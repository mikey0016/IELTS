import json
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..auth import parse_json_field, to_json_string
from ..deps import require_admin

router = APIRouter(tags=["questions"])

def serialize_question(q: models.Question) -> dict:
    return {
        "id": q.id,
        "skill": q.skill,
        "type": q.type,
        "topic": q.topic,
        "difficulty": q.difficulty,
        "timeLimitSec": q.timeLimitSec,
        "passage": q.passage,
        "passageLabel": q.passageLabel,
        "prompt": q.prompt,
        "options": parse_json_field(q.options),
        "correctIndex": q.correctIndex,
        "correctAnswer": q.correctAnswer,
        "transcript": q.transcript,
        "audioDurationSec": q.audioDurationSec,
        "explanation": q.explanation,
        "recommendLesson": q.recommendLesson,
        "createdAt": q.createdAt.isoformat() if q.createdAt else None,
    }

@router.get("/api/questions")
def list_questions(
    skill: str = Query(None),
    difficulty: str = Query(None),
    type: str = Query(None),
    topic: str = Query(None),
    search: str = Query(None),
    limit: int = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(models.Question)
    if skill and skill != "all":
        query = query.filter(models.Question.skill == skill)
    if difficulty and difficulty != "all":
        query = query.filter(models.Question.difficulty == difficulty)
    if type and type != "all":
        query = query.filter(models.Question.type == type)
    if topic and topic != "all":
        query = query.filter(models.Question.topic == topic)
    query = query.order_by(models.Question.createdAt.desc())
    items = query.all()
    result = [serialize_question(q) for q in items]
    if search:
        s = search.lower()
        result = [q for q in result if s in q["prompt"].lower() or s in q["topic"].lower() or (q.get("passage") and s in q["passage"].lower())]
    if limit:
        result = result[:limit]
    return result

@router.get("/api/admin/questions")
def admin_list_questions(
    skill: str = Query(None),
    difficulty: str = Query(None),
    type: str = Query(None),
    topic: str = Query(None),
    search: str = Query(None),
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin),
):
    query = db.query(models.Question)
    if skill and skill != "all":
        query = query.filter(models.Question.skill == skill)
    if difficulty and difficulty != "all":
        query = query.filter(models.Question.difficulty == difficulty)
    if type and type != "all":
        query = query.filter(models.Question.type == type)
    if topic and topic != "all":
        query = query.filter(models.Question.topic == topic)
    items = query.all()
    result = [serialize_question(q) for q in items]
    if search:
        s = search.lower()
        result = [q for q in result if s in q["prompt"].lower() or s in q["topic"].lower()]
    return result

@router.post("/api/admin/questions")
def create_question(payload: schemas.QuestionCreate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    if payload.skill not in ("listening", "reading"):
        raise HTTPException(status_code=400, detail="skill must be listening or reading")
    if not payload.prompt or len(payload.prompt.strip()) < 3:
        raise HTTPException(status_code=400, detail="Prompt required")
    if not payload.type:
        raise HTTPException(status_code=400, detail="type required")
    if not payload.difficulty:
        raise HTTPException(status_code=400, detail="difficulty required")
    qid = payload.id or f"q_{uuid.uuid4().hex[:8]}"
    exists = db.query(models.Question).filter(models.Question.id == qid).first()
    if exists:
        raise HTTPException(status_code=400, detail=f"Question with id {qid} already exists")
    q = models.Question(
        id=qid,
        skill=payload.skill,
        type=payload.type,
        topic=payload.topic or "General",
        difficulty=payload.difficulty,
        timeLimitSec=payload.timeLimitSec or 120,
        passage=payload.passage,
        passageLabel=payload.passageLabel,
        prompt=payload.prompt,
        options=to_json_string(payload.options),
        correctIndex=payload.correctIndex,
        correctAnswer=payload.correctAnswer,
        transcript=payload.transcript,
        audioDurationSec=payload.audioDurationSec,
        explanation=payload.explanation or "",
        recommendLesson=payload.recommendLesson or "General lesson",
    )
    db.add(q)
    db.commit()
    db.refresh(q)
    return serialize_question(q)

@router.put("/api/admin/questions/{qid}")
def update_question(qid: str, payload: schemas.QuestionUpdate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    q = db.query(models.Question).filter(models.Question.id == qid).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    data = payload.dict(exclude_unset=True)
    if "options" in data and data["options"] is not None:
        data["options"] = to_json_string(data["options"])
    for k, v in data.items():
        setattr(q, k, v)
    db.commit()
    db.refresh(q)
    return serialize_question(q)

@router.delete("/api/admin/questions/{qid}")
def delete_question(qid: str, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    q = db.query(models.Question).filter(models.Question.id == qid).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(q)
    db.commit()
    return {"message": "Deleted"}
