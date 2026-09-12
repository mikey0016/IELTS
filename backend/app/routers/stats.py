from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models
from ..deps import require_admin

router = APIRouter(prefix="/api/admin", tags=["stats"])

@router.get("/stats")
def get_stats(db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    users = db.query(models.User).all()
    total_users = len(users)
    active_users = len([u for u in users if u.status == "active"])
    premium = len([u for u in users if u.planType == "premium"])
    pro = len([u for u in users if u.planType == "pro"])
    revenue = premium * 12 + pro * 29

    # weekly signups
    weekly = []
    today = datetime.utcnow().date()
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        iso = d.isoformat()
        label = d.strftime("%a")
        count = 0
        for u in users:
            try:
                if u.createdAt and u.createdAt.date().isoformat() == iso:
                    count += 1
            except:
                pass
        weekly.append({"label": label, "count": count, "date": iso})

    # counts - try to query actual tables, fallback to mock if empty
    try:
        total_questions = db.query(models.Question).count()
    except:
        total_questions = 0
    try:
        total_words = db.query(models.VocabularyWord).count()
    except:
        total_words = 0
    try:
        total_mocks = db.query(models.MockTest).count()
    except:
        total_mocks = 0
    try:
        total_courses = db.query(models.Course).count()
    except:
        total_courses = 0
    try:
        total_lessons = db.query(models.Lesson).count()
    except:
        total_lessons = 0
    try:
        total_writing = db.query(models.WritingPrompt).count()
    except:
        total_writing = 0
    try:
        total_speaking = db.query(models.SpeakingPrompt).count()
    except:
        total_speaking = 0
    try:
        total_grammar = db.query(models.GrammarTopic).count()
    except:
        total_grammar = 0
    try:
        total_achievements = db.query(models.Achievement).count()
    except:
        total_achievements = 0

    # fallback to mock numbers if DB empty (to match Node behavior)
    if total_questions == 0:
        total_questions = 200
    if total_words == 0:
        total_words = 640
    if total_mocks == 0:
        total_mocks = 7
    if total_courses == 0:
        total_courses = 4
    if total_lessons == 0:
        total_lessons = 24
    if total_writing == 0:
        total_writing = 5
    if total_speaking == 0:
        total_speaking = 6
    if total_grammar == 0:
        total_grammar = 8
    if total_achievements == 0:
        total_achievements = 15

    # bandDistribution
    band_buckets = {}
    for u in users:
        try:
            key = f"{float(u.targetBand):.1f}"
        except:
            key = "7.0"
        band_buckets[key] = band_buckets.get(key, 0) + 1
    bandDistribution = [{"band": k, "count": v} for k, v in sorted(band_buckets.items(), key=lambda x: float(x[0]))]

    # planDistribution
    plan_map = {}
    for u in users:
        plan_map[u.planType] = plan_map.get(u.planType, 0) + 1
    planDistribution = [{"plan": k, "count": v} for k, v in plan_map.items()]

    # statusDistribution
    status_map = {}
    for u in users:
        status_map[u.status] = status_map.get(u.status, 0) + 1
    statusDistribution = [{"status": k, "count": v} for k, v in status_map.items()]

    # roleDistribution
    role_map = {}
    for u in users:
        role_map[u.role] = role_map.get(u.role, 0) + 1
    roleDistribution = [{"role": k, "count": v} for k, v in role_map.items()]

    # recentActivity — last 5 by lastActiveAt
    sorted_users = sorted(users, key=lambda x: x.lastActiveAt or datetime.min, reverse=True)[:5]
    recentActivity = []
    for u in sorted_users:
        action = f"Banned: {u.bannedReason}" if u.status == "banned" else f"Active · {u.planType} · Band {u.targetBand}"
        recentActivity.append({"id": u.id, "user": u.name, "email": u.email, "action": action, "time": u.lastActiveAt.isoformat() if u.lastActiveAt else datetime.utcnow().isoformat()})

    return {
        "totalUsers": total_users,
        "activeUsers": active_users,
        "totalQuestions": total_questions,
        "totalWords": total_words,
        "totalMocks": total_mocks,
        "totalCourses": total_courses,
        "totalLessons": total_lessons,
        "totalWritingPrompts": total_writing,
        "totalSpeakingPrompts": total_speaking,
        "totalGrammarTopics": total_grammar,
        "totalAchievements": total_achievements,
        "revenueEstimate": revenue,
        "weeklySignups": weekly,
        "bandDistribution": bandDistribution,
        "planDistribution": planDistribution,
        "statusDistribution": statusDistribution,
        "roleDistribution": roleDistribution,
        "recentActivity": recentActivity,
    }
