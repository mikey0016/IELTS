import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..deps import require_admin

router = APIRouter(tags=["achievements"])

def serialize(a: models.Achievement):
    return {
        "id": a.id,
        "title": a.title,
        "description": a.description,
        "icon": a.icon,
        "progress": a.progress,
        "max": a.max,
        "condition": a.condition,
        "reward": a.reward,
        "tier": a.tier,
        "createdAt": a.createdAt.isoformat() if a.createdAt else None,
    }

@router.get("/api/achievements")
def list_achievements(search: str = Query(None), db: Session = Depends(get_db)):
    items = db.query(models.Achievement).all()
    result = [serialize(a) for a in items]
    if search:
        s = search.lower()
        result = [a for a in result if s in a["title"].lower()]
    return result

@router.get("/api/admin/achievements")
def admin_list_achievements(search: str = Query(None), db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    items = db.query(models.Achievement).all()
    result = [serialize(a) for a in items]
    if search:
        s = search.lower()
        result = [a for a in result if s in a["title"].lower()]
    return result

@router.post("/api/admin/achievements")
def create_achievement(payload: schemas.AchievementCreate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    if not payload.title:
        raise HTTPException(status_code=400, detail="Title required")
    aid = payload.id or f"ach_{uuid.uuid4().hex[:8]}"
    exists = db.query(models.Achievement).filter(models.Achievement.id == aid).first()
    if exists:
        raise HTTPException(status_code=400, detail=f"Achievement with id {aid} already exists")
    a = models.Achievement(
        id=aid,
        title=payload.title,
        description=payload.description or "",
        icon=payload.icon or "🏆",
        progress=payload.progress or 0,
        max=payload.max or 1,
        condition=payload.condition,
        reward=payload.reward,
        tier=payload.tier,
    )
    db.add(a)
    db.commit()
    db.refresh(a)
    return serialize(a)

@router.put("/api/admin/achievements/{aid}")
def update_achievement(aid: str, payload: schemas.AchievementUpdate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    a = db.query(models.Achievement).filter(models.Achievement.id == aid).first()
    if not a:
        raise HTTPException(status_code=404, detail="Not found")
    data = payload.dict(exclude_unset=True)
    for k, v in data.items():
        setattr(a, k, v)
    db.commit()
    db.refresh(a)
    return serialize(a)

@router.delete("/api/admin/achievements/{aid}")
def delete_achievement(aid: str, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    a = db.query(models.Achievement).filter(models.Achievement.id == aid).first()
    if not a:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(a)
    db.commit()
    return {"message": "Deleted"}
