"""Seed script — mirrors server/prisma/seed_all.js but for FastAPI/SQLAlchemy"""
import json
import os
import sys
from pathlib import Path

from sqlalchemy.orm import Session

# Add app to path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal, engine, Base
from app import models
from app.auth import hash_password
from app.database import SQLALCHEMY_DATABASE_URL

print(f"🔗 DB: {SQLALCHEMY_DATABASE_URL}")

# Ensure tables exist
Base.metadata.create_all(bind=engine)

db: Session = SessionLocal()

def seed_users():
    users = [
        {"id": "u_demo", "name": "Alex Carter", "email": "alex@ieltsmaster.com", "password": "demo1234", "avatarColor": "#4c56ec", "targetBand": 7.5, "examDate": "2026-12-15", "dailyGoalMin": 30, "planType": "premium", "role": "student", "status": "active"},
        {"id": "u_admin", "name": "Admin Master", "email": "admin@ieltsmaster.com", "password": "admin123", "avatarColor": "#7c3aed", "targetBand": 9, "examDate": "", "dailyGoalMin": 60, "planType": "pro", "role": "admin", "status": "active"},
        {"id": "u_superadmin", "name": "Super Admin", "email": "superadmin@ieltsmaster.com", "password": "superadmin123", "avatarColor": "#0f172a", "targetBand": 9, "examDate": "", "dailyGoalMin": 60, "planType": "pro", "role": "superadmin", "status": "active"},
        {"id": "u_owner_vmd", "name": "vmd_xz", "email": "vmd_xz@gmail.com", "password": "Faxa2000", "avatarColor": "#0f172a", "targetBand": 9, "examDate": "", "dailyGoalMin": 60, "planType": "pro", "role": "superadmin", "status": "active"},
        {"id": "u_s1", "name": "Sarvar Rahimov", "email": "sarvar.r@ielts.uz", "password": "sarvar123", "avatarColor": "#305c8d", "targetBand": 8, "examDate": "2026-09-20", "dailyGoalMin": 45, "planType": "premium", "role": "student", "status": "active"},
        {"id": "u_s2", "name": "Madina Yusupova", "email": "madina.y@ielts.uz", "password": "madina123", "avatarColor": "#7c3aed", "targetBand": 7.5, "examDate": "2026-10-05", "dailyGoalMin": 30, "planType": "premium", "role": "student", "status": "active"},
        {"id": "u_s3", "name": "Jasur Toshpulatov", "email": "jasur.t@ielts.uz", "password": "jasur123", "avatarColor": "#0e7490", "targetBand": 7, "examDate": "2026-11-12", "dailyGoalMin": 30, "planType": "free", "role": "student", "status": "banned", "bannedReason": "Spam activity"},
        {"id": "u_s4", "name": "Nilufar Azimova", "email": "nilufar.a@ielts.uz", "password": "nilufar123", "avatarColor": "#059669", "targetBand": 8.5, "examDate": "2026-08-30", "dailyGoalMin": 60, "planType": "pro", "role": "student", "status": "active"},
        {"id": "u_s5", "name": "Otabek Karimov", "email": "otabek.k@ielts.uz", "password": "otabek123", "avatarColor": "#d97706", "targetBand": 6.5, "examDate": "2026-12-01", "dailyGoalMin": 30, "planType": "free", "role": "student", "status": "pending"},
    ]
    for u in users:
        exists = db.query(models.User).filter(models.User.email == u["email"]).first()
        if exists:
            print(f"⏭️  user exists: {u['email']}")
            continue
        user = models.User(
            id=u["id"],
            name=u["name"],
            email=u["email"],
            passwordHash=hash_password(u["password"]),
            avatarColor=u["avatarColor"],
            targetBand=u["targetBand"],
            examDate=u.get("examDate", ""),
            dailyGoalMin=u.get("dailyGoalMin", 30),
            planType=u.get("planType", "free"),
            role=u.get("role", "student"),
            status=u.get("status", "active"),
            bannedReason=u.get("bannedReason"),
        )
        db.add(user)
        print(f"✅ user: {u['email']}")
    db.commit()

def seed_from_json_file(model, file_path: Path, transform):
    if not file_path.exists():
        print(f"⏭️  skip {file_path.name} — not found")
        return
    try:
        data = json.loads(file_path.read_text(encoding="utf-8"))
        if isinstance(data, dict):
            # sometimes wrapped
            data = data.get("questions") or data.get("vocab") or data.get("data") or list(data.values())[0] if data else []
        if not isinstance(data, list):
            print(f"⚠️  {file_path.name} not a list, got {type(data)}")
            return
        count = 0
        for item in data:
            obj, is_new = transform(item)
            if obj is None:
                continue
            if is_new:
                db.add(obj)
                count += 1
        db.commit()
        print(f"✅ {file_path.name}: {count} new records")
    except Exception as e:
        print(f"❌ {file_path.name} error: {e}")
        import traceback
        traceback.print_exc()

def seed_all():
    base_data = Path(__file__).parent.parent / "server" / "data"
    # Try multiple sources
    try:
        seed_users()
    except Exception as e:
        print(f"❌ users seed error: {e}")
        db.rollback()

    # Questions
    q_file = base_data / "questions.json"
    if not q_file.exists():
        # fallback to src/data
        q_file = Path(__file__).parent.parent / "src" / "data" / "realIeltsImport.json"
    def q_transform(q):
        exists = db.query(models.Question).filter(models.Question.id == q.get("id")).first()
        if exists:
            return None, False
        import json as js
        opts = q.get("options")
        return models.Question(
            id=q.get("id"),
            skill=q.get("skill", "reading"),
            type=q.get("type", "multiple-choice"),
            topic=q.get("topic", "General"),
            difficulty=q.get("difficulty", "medium"),
            timeLimitSec=q.get("timeLimitSec", 120),
            passage=q.get("passage"),
            passageLabel=q.get("passageLabel"),
            prompt=q.get("prompt", ""),
            options=js.dumps(opts, ensure_ascii=False) if opts else None,
            correctIndex=q.get("correctIndex"),
            correctAnswer=q.get("correctAnswer"),
            transcript=q.get("transcript"),
            audioDurationSec=q.get("audioDurationSec"),
            explanation=q.get("explanation", ""),
            recommendLesson=q.get("recommendLesson", "General lesson"),
        ), True
    if q_file.exists():
        seed_from_json_file(models.Question, q_file, q_transform)
    else:
        print("⏭️  no questions file")

    # Courses etc - simplified
    print("🎉 Seeding done!")

if __name__ == "__main__":
    seed_all()
    db.close()
