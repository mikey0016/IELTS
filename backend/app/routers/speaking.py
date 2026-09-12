import uuid
import re
import math
import random
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db
from .. import models, schemas
from ..auth import parse_json_field, to_json_string
from ..deps import require_admin

class SpeakingEvaluateRequest(BaseModel):
    transcript: str
    durationSec: int = 45
    part: int = 1

# --- Online Speaking Evaluation (ported from src/lib/speakingEvaluation.ts) ---
AWL = {"analyse","analysis","approach","area","assessment","assume","authority","available","benefit","concept","consistent","constitutional","context","contract","create","data","definition","derived","distribution","economic","environment","established","estimate","evidence","export","factors","financial","formula","function","identified","income","indicate","individual","interpretation","involved","issues","labour","legal","legislation","major","method","occur","percent","period","policy","principle","procedure","process","required","research","response","role","section","sector","significant","similar","source","specific","structured","theory","variables","advocate","comprehensive","sustainable","infrastructure","contemporary","phenomenon","perspective","paradigm","coherent","cohesive","articulate","elaborate","substantiate","exemplify","illustrate","notion","implications","consequences","underlying","prevalent","intrinsic","extrinsic"}
IDIOMS = ["as a matter of fact","in my opinion","from my perspective","on the other hand","a double-edged sword","every coin has two sides","in the long run","in terms of"]
FILLERS = ["um","uh","er","ah","like","you know","i mean","kind of","sort of","actually actually"]

def count_words(t: str): return len([w for w in t.strip().split() if w])
def ttr(t: str):
    w = re.sub(r"[^\w\s]", " ", t.lower()).split()
    w = [x for x in w if x]
    return len(set(w))/len(w) if w else 0
def count_fillers(t: str):
    low=t.lower(); c=0
    for f in FILLERS:
        c+= len(re.findall(r"\b"+re.escape(f)+r"\b", low))
    return c
def count_academic(t: str): return sum(1 for w in t.lower().split() if w.strip(".,!?;:") in AWL)
def count_idioms(t: str): return sum(1 for idi in IDIOMS if idi in t.lower())
def sentence_complexity(t: str):
    sents=[s for s in re.split(r"[.!?]+", t) if s.strip()]
    if not sents: return 0,0
    total=0; complex_n=0
    for s in sents:
        wc=count_words(s); total+=wc
        if wc>18 or re.search(r"although|because|while|whereas|if|when|since|however|therefore|moreover|nevertheless|despite|in spite of|which|who|that", s.lower()): complex_n+=1
    return total/len(sents), complex_n/len(sents)
def grammar_heuristic(t: str):
    sents=[s for s in re.split(r"[.!?]+", t) if s]
    short=len([s for s in sents if count_words(s)<6])*0.3
    iam=len(re.findall(r"\bi am\b", t.lower()))
    extra=1 if iam>3 else 0
    return min(4, short+extra)
def band_round(b): return round(b*2)/2
def cefr(b):
    if b>=8.5: return "C2"
    if b>=7: return "C1"
    if b>=5.5: return "B2"
    if b>=4: return "B1"
    return "A2"

def evaluate_speaking_full(transcript: str, durationSec: int, part: int):
    text=transcript.strip() or "Hello I am a student. I like to talk about my hobbies and my family. I think education is important."
    wc=count_words(text); wpm=round((wc/durationSec)*60) if durationSec else 0
    _ttr=ttr(text); fillers=count_fillers(text); academic=count_academic(text); idioms=count_idioms(text)
    avg, complex_ratio=sentence_complexity(text); ge=grammar_heuristic(text)
    flu=5.0
    if 90 <= wpm <=140 and fillers<=2 and wc >= (120 if part==2 else 25 if part==1 else 40): flu=7.5
    elif 80 <= wpm <=150 and fillers<=4: flu=7.0
    elif wpm>=70 and fillers<=6: flu=6.0
    elif wpm>=60 and fillers<=8: flu=5.5
    elif wpm<50 or fillers>8: flu=5.0
    if complex_ratio>0.4: flu+=0.5
    if avg>16: flu+=0.25
    flu=min(9, max(4, flu))
    lex=5.0
    if _ttr>0.65 and academic>=4 and idioms>=1: lex=8.0
    elif _ttr>0.6 and academic>=3: lex=7.0
    elif _ttr>0.55 and academic>=2: lex=6.5
    elif _ttr>0.5 and academic>=1: lex=6.0
    elif _ttr>0.45: lex=5.5
    if idioms>=2: lex+=0.5
    if wc>150 and part==2: lex+=0.25
    lex=min(9, max(4, lex))
    gra=5.0
    if complex_ratio>0.5 and ge<1 and avg>14: gra=7.5
    elif complex_ratio>0.35 and ge<1.5: gra=7.0
    elif complex_ratio>0.25 and ge<2: gra=6.0
    elif complex_ratio>0.15: gra=5.5
    if ge>2: gra-=0.5
    gra=min(9, max(4, gra))
    pro=6.0
    if fillers<=1 and 90 <= wpm <=130: pro=7.5
    elif fillers<=3 and wpm>=80: pro=7.0
    elif fillers<=5: pro=6.5
    elif fillers>6: pro=5.5
    pro+=(wc%3)*0.1
    pro=min(9, max(4, pro))
    overall=band_round((flu+lex+gra+pro)/4)
    return {
        "id": str(random.randint(100000,999999)),
        "part": part,
        "date": datetime.utcnow().isoformat()[:10],
        "overall": overall,
        "estimatedCEFR": cefr(overall),
        "transcript": text,
        "wordCount": wc,
        "durationSec": durationSec,
        "wpm": wpm,
        "fillerCount": fillers,
        "criteria": [
            {"key":"fluency","label":"Fluency & Coherence","band":band_round(flu),"comment":"Ravon va izchil" if flu>=7 else "To'xtalishlar bor","details":[f"{wc} so'z, {durationSec}s — {wpm} wpm", f"To'ldiruvchi: {fillers} ta", f"O'rtacha gap: {avg:.1f} so'z", f"Murakkab: {complex_ratio*100:.0f}%"],"strengths":[],"improvements":[]},
            {"key":"lexical","label":"Lexical Resource","band":band_round(lex),"comment":"Boy lug'at" if lex>=7 else "Oddiy lug'at","details":[f"TTR: {_ttr*100:.1f}%", f"Akademik: {academic}", f"Idioma: {idioms}",""],"strengths":[],"improvements":[]},
            {"key":"grammar","label":"Grammatical Range","band":band_round(gra),"comment":"Murakkab tuzilmalar" if gra>=7 else "Oddiy gaplar","details":[f"Murakkab: {complex_ratio*100:.0f}%", f"Xato: {ge:.1f}/4"],"strengths":[],"improvements":[]},
            {"key":"pronunciation","label":"Pronunciation","band":band_round(pro),"comment":"Aniq talaffuz" if pro>=7 else "Ishlash kerak","details":[f"Tezlik: {wpm} wpm", f"To'ldiruvchi: {fillers}"],"strengths":[],"improvements":[]},
        ],
        "strengths": ["Ravon gapirasiz"] if flu>=7 else [],
        "weaknesses": [] if flu>=7 else ["Ravonlikni oshiring"],
        "nextSteps": [f"Part {part} uchun 10 daqiqa yozing","5 ta akademik so'z yodlang","Murakkab gap mashq qiling"],
    }

router = APIRouter(tags=["speaking"])

def serialize(s: models.SpeakingPrompt):
    return {
        "id": s.id,
        "part": s.part,
        "difficulty": s.difficulty,
        "prepTimeSec": s.prepTimeSec,
        "speakingTimeSec": s.speakingTimeSec,
        "cueCardTitle": s.cueCardTitle,
        "prompt": s.prompt,
        "followUps": parse_json_field(s.followUps) or [],
        "createdAt": s.createdAt.isoformat() if s.createdAt else None,
    }

@router.get("/api/speaking")
def list_speaking(search: str = Query(None), difficulty: str = Query(None), part: str = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.SpeakingPrompt)
    if difficulty and difficulty != "all":
        query = query.filter(models.SpeakingPrompt.difficulty == difficulty)
    if part and part != "all":
        try:
            query = query.filter(models.SpeakingPrompt.part == int(part))
        except:
            pass
    items = query.all()
    result = [serialize(s) for s in items]
    if search:
        s_ = search.lower()
        result = [p for p in result if s_ in p["prompt"].lower() or s_ in p["cueCardTitle"].lower()]
    return result

@router.post("/api/speaking/evaluate")
def evaluate_speaking(req: SpeakingEvaluateRequest):
    # Online evaluation — real backend, not offline mock
    if not req.transcript or len(req.transcript.strip()) < 2:
        raise HTTPException(status_code=400, detail="Transcript required")
    if req.part not in (1,2,3):
        raise HTTPException(status_code=400, detail="Part must be 1, 2 or 3")
    try:
        return evaluate_speaking_full(req.transcript, req.durationSec, req.part)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/admin/speaking")
def admin_list_speaking(search: str = Query(None), difficulty: str = Query(None), part: str = Query(None), db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    query = db.query(models.SpeakingPrompt)
    if difficulty and difficulty != "all":
        query = query.filter(models.SpeakingPrompt.difficulty == difficulty)
    if part and part != "all":
        try:
            query = query.filter(models.SpeakingPrompt.part == int(part))
        except:
            pass
    items = query.all()
    result = [serialize(s) for s in items]
    if search:
        s_ = search.lower()
        result = [p for p in result if s_ in p["prompt"].lower()]
    return result

@router.post("/api/admin/speaking")
def create_speaking(payload: schemas.SpeakingCreate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    if not payload.prompt or len(payload.prompt) < 10:
        raise HTTPException(status_code=400, detail="Prompt required")
    if not payload.cueCardTitle:
        raise HTTPException(status_code=400, detail="cueCardTitle required")
    sid = payload.id or f"s_{uuid.uuid4().hex[:8]}"
    exists = db.query(models.SpeakingPrompt).filter(models.SpeakingPrompt.id == sid).first()
    if exists:
        raise HTTPException(status_code=400, detail=f"Speaking prompt with id {sid} already exists")
    s = models.SpeakingPrompt(
        id=sid,
        part=payload.part or 1,
        difficulty=payload.difficulty or "medium",
        prepTimeSec=payload.prepTimeSec or 60,
        speakingTimeSec=payload.speakingTimeSec or 120,
        cueCardTitle=payload.cueCardTitle,
        prompt=payload.prompt,
        followUps=to_json_string(payload.followUps or []),
    )
    db.add(s)
    db.commit()
    db.refresh(s)
    return serialize(s)

@router.put("/api/admin/speaking/{sid}")
def update_speaking(sid: str, payload: schemas.SpeakingUpdate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    s = db.query(models.SpeakingPrompt).filter(models.SpeakingPrompt.id == sid).first()
    if not s:
        raise HTTPException(status_code=404, detail="Not found")
    data = payload.dict(exclude_unset=True)
    if "followUps" in data and data["followUps"] is not None:
        data["followUps"] = to_json_string(data["followUps"])
    for k, v in data.items():
        setattr(s, k, v)
    db.commit()
    db.refresh(s)
    return serialize(s)

@router.delete("/api/admin/speaking/{sid}")
def delete_speaking(sid: str, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    s = db.query(models.SpeakingPrompt).filter(models.SpeakingPrompt.id == sid).first()
    if not s:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(s)
    db.commit()
    return {"message": "Deleted"}
