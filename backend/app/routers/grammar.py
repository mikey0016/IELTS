import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..deps import require_admin

router = APIRouter(tags=["grammar"])

def serialize(g: models.GrammarTopic):
    return {
        "id": g.id,
        "title": g.title,
        "level": g.level,
        "summary": g.summary,
        "example": g.example,
        "minutes": g.minutes,
        "createdAt": g.createdAt.isoformat() if g.createdAt else None,
    }

@router.get("/api/grammar")
def list_grammar(search: str = Query(None), level: str = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.GrammarTopic)
    if level and level != "all":
        query = query.filter(models.GrammarTopic.level == level)
    items = query.all()
    result = [serialize(g) for g in items]
    if search:
        s = search.lower()
        result = [g for g in result if s in g["title"].lower()]
    return result

@router.get("/api/admin/grammar")
def admin_list_grammar(search: str = Query(None), level: str = Query(None), db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    query = db.query(models.GrammarTopic)
    if level and level != "all":
        query = query.filter(models.GrammarTopic.level == level)
    items = query.all()
    result = [serialize(g) for g in items]
    if search:
        s = search.lower()
        result = [g for g in result if s in g["title"].lower()]
    return result

@router.post("/api/admin/grammar")
def create_grammar(payload: schemas.GrammarCreate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    if not payload.title:
        raise HTTPException(status_code=400, detail="Title required")
    gid = payload.id or f"g_{uuid.uuid4().hex[:8]}"
    exists = db.query(models.GrammarTopic).filter(models.GrammarTopic.id == gid).first()
    if exists:
        raise HTTPException(status_code=400, detail=f"Grammar with id {gid} already exists")
    g = models.GrammarTopic(
        id=gid,
        title=payload.title,
        level=payload.level or "Intermediate (Band 5–6)",
        summary=payload.summary or "",
        example=payload.example or "",
        minutes=payload.minutes or 20,
    )
    db.add(g)
    db.commit()
    db.refresh(g)
    return serialize(g)

@router.put("/api/admin/grammar/{gid}")
def update_grammar(gid: str, payload: schemas.GrammarUpdate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    g = db.query(models.GrammarTopic).filter(models.GrammarTopic.id == gid).first()
    if not g:
        raise HTTPException(status_code=404, detail="Not found")
    data = payload.dict(exclude_unset=True)
    for k, v in data.items():
        setattr(g, k, v)
    db.commit()
    db.refresh(g)
    return serialize(g)

@router.delete("/api/admin/grammar/{gid}")
def delete_grammar(gid: str, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    g = db.query(models.GrammarTopic).filter(models.GrammarTopic.id == gid).first()
    if not g:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(g)
    db.commit()
    return {"message": "Deleted"}
