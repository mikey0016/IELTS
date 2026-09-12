import uuid
import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..auth import parse_json_field, to_json_string
from ..deps import require_admin

router = APIRouter(tags=["vocabulary"])

def serialize(w: models.VocabularyWord):
    return {
        "id": w.id,
        "word": w.word,
        "phonetic": w.phonetic,
        "partOfSpeech": w.partOfSpeech,
        "meaning": w.meaning,
        "example": w.example,
        "synonyms": parse_json_field(w.synonyms) or [],
        "difficulty": w.difficulty,
        "band": w.band,
        "topic": w.topic,
        "createdAt": w.createdAt.isoformat() if w.createdAt else None,
    }

@router.get("/api/vocabulary")
def list_vocab(search: str = Query(None), difficulty: str = Query(None), partOfSpeech: str = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.VocabularyWord)
    if difficulty and difficulty != "all":
        query = query.filter(models.VocabularyWord.difficulty == difficulty)
    if partOfSpeech and partOfSpeech != "all":
        query = query.filter(models.VocabularyWord.partOfSpeech == partOfSpeech)
    items = query.all()
    result = [serialize(w) for w in items]
    if search:
        s = search.lower()
        result = [w for w in result if s in w["word"].lower() or s in w["meaning"].lower()]
    return result

@router.get("/api/admin/vocabulary")
def admin_list_vocab(search: str = Query(None), difficulty: str = Query(None), partOfSpeech: str = Query(None), db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    query = db.query(models.VocabularyWord)
    if difficulty and difficulty != "all":
        query = query.filter(models.VocabularyWord.difficulty == difficulty)
    if partOfSpeech and partOfSpeech != "all":
        query = query.filter(models.VocabularyWord.partOfSpeech == partOfSpeech)
    items = query.all()
    # admin returns without parsing synonyms? but we do same
    result = []
    for w in items:
        result.append({
            "id": w.id,
            "word": w.word,
            "phonetic": w.phonetic,
            "partOfSpeech": w.partOfSpeech,
            "meaning": w.meaning,
            "example": w.example,
            "synonyms": w.synonyms,
            "difficulty": w.difficulty,
            "band": w.band,
            "topic": w.topic,
            "createdAt": w.createdAt.isoformat() if w.createdAt else None,
        })
    if search:
        s = search.lower()
        result = [w for w in result if s in w["word"].lower() or s in w["meaning"].lower()]
    return result

@router.post("/api/admin/vocabulary")
def create_word(payload: schemas.VocabCreate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    if not payload.word or not payload.word.strip():
        raise HTTPException(status_code=400, detail="Word required")
    if not payload.meaning or not payload.meaning.strip():
        raise HTTPException(status_code=400, detail="Meaning required")
    wid = payload.id or f"w_{uuid.uuid4().hex[:8]}"
    exists = db.query(models.VocabularyWord).filter(models.VocabularyWord.id == wid).first()
    if exists:
        raise HTTPException(status_code=400, detail=f"Word with id {wid} already exists")
    w = models.VocabularyWord(
        id=wid,
        word=payload.word.strip(),
        phonetic=payload.phonetic or f"/{payload.word.strip()}/",
        partOfSpeech=payload.partOfSpeech or "noun",
        meaning=payload.meaning,
        example=payload.example or "",
        synonyms=to_json_string(payload.synonyms or []),
        difficulty=payload.difficulty or "medium",
        band=payload.band,
        topic=payload.topic,
    )
    db.add(w)
    db.commit()
    db.refresh(w)
    return serialize(w)

@router.put("/api/admin/vocabulary/{wid}")
def update_word(wid: str, payload: schemas.VocabUpdate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    w = db.query(models.VocabularyWord).filter(models.VocabularyWord.id == wid).first()
    if not w:
        raise HTTPException(status_code=404, detail="Word not found")
    data = payload.dict(exclude_unset=True)
    if "synonyms" in data and data["synonyms"] is not None:
        data["synonyms"] = to_json_string(data["synonyms"])
    for k, v in data.items():
        setattr(w, k, v)
    db.commit()
    db.refresh(w)
    return serialize(w)

@router.delete("/api/admin/vocabulary/{wid}")
def delete_word(wid: str, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    w = db.query(models.VocabularyWord).filter(models.VocabularyWord.id == wid).first()
    if not w:
        raise HTTPException(status_code=404, detail="Word not found")
    db.delete(w)
    db.commit()
    return {"message": "Deleted"}
