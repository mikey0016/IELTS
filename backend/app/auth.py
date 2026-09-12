import os
import json
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext

JWT_SECRET = os.getenv("JWT_SECRET", "ielts-master-super-secret-2026")
ALGORITHM = "HS256"
EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=EXPIRE_DAYS))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)

def decode_token(token: str):
    return jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])

def to_profile(user) -> dict:
    notifications = user.notifications
    if isinstance(notifications, str):
        try:
            notifications = json.loads(notifications)
        except:
            notifications = {"practice": True, "reminders": True, "results": True}
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "avatarColor": user.avatarColor,
        "targetBand": user.targetBand,
        "examDate": user.examDate or "",
        "dailyGoalMin": user.dailyGoalMin,
        "notifications": notifications,
        "planType": user.planType,
        "role": user.role,
        "status": user.status,
        "createdAt": user.createdAt.isoformat() if user.createdAt else None,
        "lastActiveAt": user.lastActiveAt.isoformat() if user.lastActiveAt else None,
        "bannedReason": user.bannedReason or None,
    }

def parse_json_field(value):
    if value is None:
        return None
    if isinstance(value, (list, dict)):
        return value
    try:
        return json.loads(value)
    except:
        return value

def to_json_string(value) -> str:
    if value is None:
        return None
    if isinstance(value, str):
        return value
    return json.dumps(value, ensure_ascii=False)
