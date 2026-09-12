import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..deps import require_admin

router = APIRouter(tags=["music"])

def serialize(m: models.Music):
    return {
        "id": m.id,
        "title": m.title,
        "artist": m.artist,
        "url": m.url,
        "coverUrl": m.coverUrl,
        "durationSec": m.durationSec,
        "category": m.category,
        "isActive": m.isActive,
        "order": m.order,
        "createdAt": m.createdAt.isoformat() if m.createdAt else None,
    }

@router.get("/api/music")
def list_music(category: str = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.Music).filter(models.Music.isActive == True)
    if category and category != "all":
        query = query.filter(models.Music.category == category)
    items = query.order_by(models.Music.order.asc()).all()
    return [serialize(m) for m in items]

@router.get("/api/admin/music")
def admin_list_music(db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    items = db.query(models.Music).order_by(models.Music.order.asc()).all()
    return [serialize(m) for m in items]

@router.post("/api/admin/music")
def create_music(payload: schemas.MusicCreate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    if not payload.title:
        raise HTTPException(status_code=400, detail="Title required")
    if not payload.url:
        raise HTTPException(status_code=400, detail="URL required")
    m = models.Music(
        title=payload.title,
        artist=payload.artist or "IELTS Master",
        url=payload.url,
        coverUrl=payload.coverUrl,
        durationSec=payload.durationSec or 0,
        category=payload.category or "reading",
        order=payload.order or 0,
        isActive=payload.isActive if payload.isActive is not None else True,
    )
    db.add(m)
    db.commit()
    db.refresh(m)
    return serialize(m)

@router.put("/api/admin/music/{mid}")
def update_music(mid: str, payload: schemas.MusicUpdate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    m = db.query(models.Music).filter(models.Music.id == mid).first()
    if not m:
        raise HTTPException(status_code=404, detail="Music not found")
    data = payload.dict(exclude_unset=True)
    for k, v in data.items():
        setattr(m, k, v)
    db.commit()
    db.refresh(m)
    return serialize(m)

@router.delete("/api/admin/music/{mid}")
def delete_music(mid: str, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    m = db.query(models.Music).filter(models.Music.id == mid).first()
    if not m:
        raise HTTPException(status_code=404, detail="Music not found")
    db.delete(m)
    db.commit()
    return {"message": "Deleted"}
