import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..auth import parse_json_field, to_json_string
from ..deps import require_admin

router = APIRouter(tags=["mocks"])

def serialize(m: models.MockTest):
    return {
        "id": m.id,
        "title": m.title,
        "type": m.type,
        "durationMin": m.durationMin,
        "questions": m.questions,
        "description": m.description,
        "sections": parse_json_field(m.sections) or [],
        "difficulty": m.difficulty,
        "createdAt": m.createdAt.isoformat() if m.createdAt else None,
    }

@router.get("/api/mocks")
def list_mocks(search: str = Query(None), type: str = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.MockTest)
    if type and type != "all":
        query = query.filter(models.MockTest.type == type)
    items = query.all()
    result = [serialize(m) for m in items]
    if search:
        s = search.lower()
        result = [m for m in result if s in m["title"].lower()]
    return result

@router.get("/api/admin/mocks")
def admin_list_mocks(search: str = Query(None), type: str = Query(None), db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    query = db.query(models.MockTest)
    if type and type != "all":
        query = query.filter(models.MockTest.type == type)
    items = query.all()
    result = [serialize(m) for m in items]
    if search:
        s = search.lower()
        result = [m for m in result if s in m["title"].lower()]
    return result

@router.post("/api/admin/mocks")
def create_mock(payload: schemas.MockCreate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    if not payload.title:
        raise HTTPException(status_code=400, detail="Title required")
    mid = payload.id or f"mock_{uuid.uuid4().hex[:8]}"
    exists = db.query(models.MockTest).filter(models.MockTest.id == mid).first()
    if exists:
        raise HTTPException(status_code=400, detail=f"Mock with id {mid} already exists")
    m = models.MockTest(
        id=mid,
        title=payload.title,
        type=payload.type or "Academic",
        durationMin=payload.durationMin or 60,
        questions=payload.questions or 0,
        description=payload.description or "",
        sections=to_json_string(payload.sections or []),
        difficulty=payload.difficulty,
    )
    db.add(m)
    db.commit()
    db.refresh(m)
    return serialize(m)

@router.put("/api/admin/mocks/{mid}")
def update_mock(mid: str, payload: schemas.MockUpdate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    m = db.query(models.MockTest).filter(models.MockTest.id == mid).first()
    if not m:
        raise HTTPException(status_code=404, detail="Not found")
    data = payload.dict(exclude_unset=True)
    if "sections" in data and data["sections"] is not None:
        data["sections"] = to_json_string(data["sections"])
    for k, v in data.items():
        setattr(m, k, v)
    db.commit()
    db.refresh(m)
    return serialize(m)

@router.delete("/api/admin/mocks/{mid}")
def delete_mock(mid: str, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    m = db.query(models.MockTest).filter(models.MockTest.id == mid).first()
    if not m:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(m)
    db.commit()
    return {"message": "Deleted"}
