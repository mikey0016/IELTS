import re
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..auth import hash_password, to_profile
from ..deps import require_admin, get_current_user

router = APIRouter(prefix="/api/admin/users", tags=["admin-users"])

def is_valid_email(email: str) -> bool:
    return bool(re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email))

@router.get("", dependencies=[])
def list_users(db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    users = db.query(models.User).order_by(models.User.createdAt.desc()).all()
    return [to_profile(u) for u in users]

@router.get("/{user_id}")
def get_user(user_id: str, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return to_profile(user)

@router.delete("/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.id == admin.id:
        raise HTTPException(status_code=400, detail="O'zingizni o'chira olmaysiz")
    is_privileged = target.role in ("admin", "superadmin")
    if is_privileged and admin.role != "superadmin":
        raise HTTPException(status_code=403, detail="Faqat Super Admin (owner) Admin/Super Admin'larni o'chira oladi")
    db.delete(target)
    db.commit()
    return {"message": "Deleted"}

@router.post("/{user_id}/ban")
def ban_user(user_id: str, payload: schemas.BanRequest, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.status = "banned"
    user.bannedReason = payload.reason or "Banned by admin"
    db.commit()
    db.refresh(user)
    return to_profile(user)

@router.post("/{user_id}/unban")
def unban_user(user_id: str, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.status = "active"
    user.bannedReason = None
    db.commit()
    db.refresh(user)
    return to_profile(user)

@router.put("/{user_id}/role")
def set_role(user_id: str, payload: schemas.RoleUpdate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    if payload.role not in ("student", "admin", "superadmin"):
        raise HTTPException(status_code=400, detail="Invalid role")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = payload.role
    db.commit()
    db.refresh(user)
    return to_profile(user)

@router.put("/{user_id}/plan")
def set_plan(user_id: str, payload: schemas.PlanUpdate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    plan = payload.planType or payload.plan
    if plan not in ("free", "premium", "pro"):
        raise HTTPException(status_code=400, detail="Invalid plan")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.planType = plan
    db.commit()
    db.refresh(user)
    return to_profile(user)

@router.post("")
def create_user(payload: schemas.AdminUserCreate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    if not payload.name or len(payload.name.strip()) < 2:
        raise HTTPException(status_code=400, detail="Name must be at least 2 characters.")
    if not is_valid_email(payload.email):
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")
    normalized = payload.email.strip().lower()
    exists = db.query(models.User).filter(models.User.email == normalized).first()
    if exists:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")
    hashed = hash_password(payload.password or "123456")
    user = models.User(
        name=payload.name.strip(),
        email=normalized,
        passwordHash=hashed,
        avatarColor=payload.avatarColor or "#7c3aed",
        targetBand=payload.targetBand or 7,
        planType=payload.planType or "free",
        role=payload.role or "student",
        status=payload.status or "active",
        examDate=payload.examDate or "",
        dailyGoalMin=payload.dailyGoalMin or 30,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return to_profile(user)

@router.put("/{user_id}")
def update_user(user_id: str, payload: schemas.AdminUserUpdate, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    data = payload.dict(exclude_unset=True)
    if "email" in data and data["email"] is not None:
        if not is_valid_email(data["email"]):
            raise HTTPException(status_code=400, detail="Please enter a valid email address.")
        data["email"] = data["email"].strip().lower()
    if "password" in data and data["password"]:
        data["passwordHash"] = hash_password(data.pop("password"))
    elif "password" in data:
        data.pop("password", None)
    data.pop("id", None)
    # handle notifications as json string
    if "notifications" in data and data["notifications"] is not None:
        if isinstance(data["notifications"], dict):
            data["notifications"] = json.dumps(data["notifications"])
        elif isinstance(data["notifications"], str):
            pass
    for k, v in data.items():
        # map to model attribute; handle camelCase
        if hasattr(user, k):
            setattr(user, k, v)
    db.commit()
    db.refresh(user)
    return to_profile(user)
