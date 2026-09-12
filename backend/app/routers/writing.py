import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..auth import parse_json_field, to_json_string
from ..deps import require_admin

router = APIRouter(tags=["writing"])

def serialize(w: models.WritingPrompt):
    return {
        "id": w.id,
        "task": w.task,
        "type": w.type,
        "difficulty": w.difficulty,
        "timeLimitMin": w.timeLimitMin,
        "minWords": w.minWords,
        "prompt": w.prompt,
        "instructions": parse_json_field(w.instructions) or [],
        "createdAt": w.createdAt.isoformat() if w.createdAt else None,
    }

@router.get("/api/writing")
def list_writing(search: str = Query(None), difficulty: str = Query(None), type: str = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.WritingPrompt)
    if difficulty and difficulty != "all":
        query = query.filter(models.WritingPrompt.difficulty == difficulty)
    if type and type != "all":
        query = query.filter(models.WritingPrompt.type == type)
    items = query.all()
    result = [serialize(w) for w in items]
    if search:
        s = search.lower()
        result = [p for p in result if s in p["prompt"].lower()]
    return result

@router.get("/api/admin/writing")
def admin_list_writing(search: str = Query(None), difficulty: str = Query(None), type: str = Query(None), db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    query = db.query(models.WritingPrompt)
    if difficulty and difficulty != "all":
        query = query.filter(models.WritingPrompt.difficulty == difficulty)
    if type and type != "all":
        query = query.filter(models.WritingPrompt.type == type)
    items = query.all()
    result = [serialize(w) for w in items]
    if search:
        s = search.lower()
        result = [p for p in result if s in p["prompt"].lower()]
    return result

@router.post("/api/admin/writing")
def create_writing(payload: schemas.WritingCreate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    if not payload.prompt or len(payload.prompt) < 10:
        raise HTTPException(status_code=400, detail="Prompt must be at least 10 chars")
    wid = payload.id or f"w_{uuid.uuid4().hex[:8]}"
    exists = db.query(models.WritingPrompt).filter(models.WritingPrompt.id == wid).first()
    if exists:
        raise HTTPException(status_code=400, detail=f"Writing prompt with id {wid} already exists")
    w = models.WritingPrompt(
        id=wid,
        task=payload.task or "Academic Task 2",
        type=payload.type or "academic-task2",
        difficulty=payload.difficulty or "medium",
        timeLimitMin=payload.timeLimitMin or 40,
        minWords=payload.minWords or 250,
        prompt=payload.prompt,
        instructions=to_json_string(payload.instructions or []),
    )
    db.add(w)
    db.commit()
    db.refresh(w)
    return serialize(w)

@router.put("/api/admin/writing/{wid}")
def update_writing(wid: str, payload: schemas.WritingUpdate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    w = db.query(models.WritingPrompt).filter(models.WritingPrompt.id == wid).first()
    if not w:
        raise HTTPException(status_code=404, detail="Not found")
    data = payload.dict(exclude_unset=True)
    if "instructions" in data and data["instructions"] is not None:
        data["instructions"] = to_json_string(data["instructions"])
    for k, v in data.items():
        setattr(w, k, v)
    db.commit()
    db.refresh(w)
    return serialize(w)

@router.delete("/api/admin/writing/{wid}")
def delete_writing(wid: str, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    w = db.query(models.WritingPrompt).filter(models.WritingPrompt.id == wid).first()
    if not w:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(w)
    db.commit()
    return {"message": "Deleted"}
