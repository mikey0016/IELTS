import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
from .. import models, schemas
from ..deps import require_admin

router = APIRouter(tags=["courses"])

def serialize_course(c: models.Course):
    return {
        "key": c.key,
        "title": c.title,
        "description": c.description,
        "color": c.color,
        "createdAt": c.createdAt.isoformat() if c.createdAt else None,
        "lessons": [{"id": l.id, "title": l.title, "meta": l.meta, "minutes": l.minutes, "skill": l.skill, "courseKey": l.courseKey, "createdAt": l.createdAt.isoformat() if l.createdAt else None} for l in c.lessons],
    }

@router.get("/api/courses")
def list_courses(db: Session = Depends(get_db)):
    courses = db.query(models.Course).options(joinedload(models.Course.lessons)).all()
    return [serialize_course(c) for c in courses]

@router.get("/api/admin/courses")
def admin_list_courses(db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    courses = db.query(models.Course).options(joinedload(models.Course.lessons)).all()
    return [serialize_course(c) for c in courses]

@router.post("/api/admin/courses")
def create_course(payload: schemas.CourseCreate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    if payload.key not in ("listening", "reading", "writing", "speaking"):
        raise HTTPException(status_code=400, detail="Invalid key")
    if not payload.title:
        raise HTTPException(status_code=400, detail="Title required")
    exists = db.query(models.Course).filter(models.Course.key == payload.key).first()
    if exists:
        raise HTTPException(status_code=400, detail=f"Course with key {payload.key} already exists")
    c = models.Course(key=payload.key, title=payload.title, description=payload.description or "", color=payload.color or "brand")
    db.add(c)
    db.commit()
    db.refresh(c)
    return {"key": c.key, "title": c.title, "description": c.description, "color": c.color, "createdAt": c.createdAt.isoformat() if c.createdAt else None}

@router.put("/api/admin/courses/{key}")
def update_course(key: str, payload: schemas.CourseUpdate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    c = db.query(models.Course).filter(models.Course.key == key).first()
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
    data = payload.dict(exclude_unset=True)
    for k, v in data.items():
        setattr(c, k, v)
    db.commit()
    db.refresh(c)
    return {"key": c.key, "title": c.title, "description": c.description, "color": c.color, "createdAt": c.createdAt.isoformat() if c.createdAt else None}

@router.delete("/api/admin/courses/{key}")
def delete_course(key: str, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    c = db.query(models.Course).filter(models.Course.key == key).first()
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(c)
    db.commit()
    return {"message": "Deleted"}

@router.post("/api/admin/courses/{key}/lessons")
def create_lesson(key: str, payload: schemas.LessonCreate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    if not payload.title:
        raise HTTPException(status_code=400, detail="Lesson title required")
    course = db.query(models.Course).filter(models.Course.key == key).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    lid = payload.id or f"lesson_{uuid.uuid4().hex[:8]}"
    exists = db.query(models.Lesson).filter(models.Lesson.id == lid).first()
    if exists:
        raise HTTPException(status_code=400, detail=f"Lesson with id {lid} already exists")
    lesson = models.Lesson(id=lid, title=payload.title, meta=payload.meta or "", minutes=payload.minutes or 20, skill=payload.skill or key, courseKey=key)
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return {"id": lesson.id, "title": lesson.title, "meta": lesson.meta, "minutes": lesson.minutes, "skill": lesson.skill, "courseKey": lesson.courseKey}

@router.put("/api/admin/courses/{key}/lessons/{lid}")
def update_lesson(key: str, lid: str, payload: schemas.LessonUpdate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lid).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    data = payload.dict(exclude_unset=True)
    for k, v in data.items():
        setattr(lesson, k, v)
    db.commit()
    db.refresh(lesson)
    return {"id": lesson.id, "title": lesson.title, "meta": lesson.meta, "minutes": lesson.minutes, "skill": lesson.skill, "courseKey": lesson.courseKey}

@router.delete("/api/admin/courses/{key}/lessons/{lid}")
def delete_lesson(key: str, lid: str, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lid).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    db.delete(lesson)
    db.commit()
    return {"message": "Deleted"}
