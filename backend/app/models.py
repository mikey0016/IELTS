import json
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
import uuid

def gen_cuid():
    return str(uuid.uuid4()).replace("-", "")[:24]

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=gen_cuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    passwordHash = Column("passwordHash", String, nullable=False)
    avatarColor = Column("avatarColor", String, default="#7c3aed")
    targetBand = Column("targetBand", Float, default=7)
    examDate = Column("examDate", String, default="")
    dailyGoalMin = Column("dailyGoalMin", Integer, default=30)
    notifications = Column(String, default='{"practice":true,"reminders":true,"results":true}')
    planType = Column("planType", String, default="free")
    role = Column(String, default="student")
    status = Column(String, default="active")
    bannedReason = Column("bannedReason", String, nullable=True)
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)
    lastActiveAt = Column("lastActiveAt", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    coins = Column(Integer, default=250)
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)

    wallet_transactions = relationship("WalletTransaction", back_populates="user", cascade="all, delete-orphan")

class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"
    id = Column(String, primary_key=True, default=gen_cuid)
    userId = Column("userId", String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Integer, nullable=False)
    reason = Column(String, nullable=False)
    balance = Column(Integer, nullable=False)
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="wallet_transactions")

class Music(Base):
    __tablename__ = "music"
    id = Column(String, primary_key=True, default=gen_cuid)
    title = Column(String, nullable=False)
    artist = Column(String, default="IELTS Master")
    url = Column(Text, nullable=False)
    coverUrl = Column("coverUrl", Text, nullable=True)
    durationSec = Column("durationSec", Integer, default=0)
    category = Column(String, default="reading")
    isActive = Column("isActive", Boolean, default=True)
    order = Column(Integer, default=0)
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)

class Question(Base):
    __tablename__ = "questions"
    id = Column(String, primary_key=True)
    skill = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False)
    topic = Column(String, default="General")
    difficulty = Column(String, default="medium", index=True)
    timeLimitSec = Column("timeLimitSec", Integer, default=120)
    passage = Column(Text, nullable=True)
    passageLabel = Column("passageLabel", String, nullable=True)
    prompt = Column(Text, nullable=False)
    options = Column(Text, nullable=True)  # JSON string
    correctIndex = Column("correctIndex", Integer, nullable=True)
    correctAnswer = Column("correctAnswer", Text, nullable=True)
    transcript = Column(Text, nullable=True)
    audioDurationSec = Column("audioDurationSec", Integer, nullable=True)
    explanation = Column(Text, default="")
    recommendLesson = Column("recommendLesson", String, default="General lesson")
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)

class VocabularyWord(Base):
    __tablename__ = "vocabulary_words"
    id = Column(String, primary_key=True)
    word = Column(String, nullable=False)
    phonetic = Column(String, default="")
    partOfSpeech = Column("partOfSpeech", String, default="noun")
    meaning = Column(Text, nullable=False)
    example = Column(Text, nullable=True)
    synonyms = Column(Text, nullable=True)  # JSON string
    difficulty = Column(String, default="medium")
    band = Column(Integer, nullable=True)
    topic = Column(String, nullable=True)
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)

class Course(Base):
    __tablename__ = "courses"
    key = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    color = Column(String, default="brand")
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)
    lessons = relationship("Lesson", back_populates="course", cascade="all, delete-orphan")

class Lesson(Base):
    __tablename__ = "lessons"
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    meta = Column(String, default="")
    minutes = Column(Integer, default=20)
    skill = Column(String, nullable=False)
    courseKey = Column("courseKey", String, ForeignKey("courses.key", ondelete="CASCADE"), nullable=False)
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)
    course = relationship("Course", back_populates="lessons")

class GrammarTopic(Base):
    __tablename__ = "grammar_topics"
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    level = Column(String, default="Intermediate (Band 5–6)")
    summary = Column(Text, default="")
    example = Column(Text, default="")
    minutes = Column(Integer, default=20)
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)

class WritingPrompt(Base):
    __tablename__ = "writing_prompts"
    id = Column(String, primary_key=True)
    task = Column(String, default="Academic Task 2")
    type = Column(String, default="academic-task2")
    difficulty = Column(String, default="medium")
    timeLimitMin = Column("timeLimitMin", Integer, default=40)
    minWords = Column("minWords", Integer, default=250)
    prompt = Column(Text, nullable=False)
    instructions = Column(Text, nullable=True)  # JSON string
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)

class SpeakingPrompt(Base):
    __tablename__ = "speaking_prompts"
    id = Column(String, primary_key=True)
    part = Column(Integer, default=1)
    difficulty = Column(String, default="medium")
    prepTimeSec = Column("prepTimeSec", Integer, default=60)
    speakingTimeSec = Column("speakingTimeSec", Integer, default=120)
    cueCardTitle = Column("cueCardTitle", Text, nullable=False)
    prompt = Column(Text, nullable=False)
    followUps = Column("followUps", Text, nullable=True)  # JSON string
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)

class MockTest(Base):
    __tablename__ = "mock_tests"
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    type = Column(String, default="Academic")
    durationMin = Column("durationMin", Integer, default=60)
    questions = Column(Integer, default=0)
    description = Column(Text, default="")
    sections = Column(Text, nullable=True)  # JSON string
    difficulty = Column(String, nullable=True)
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)

class Achievement(Base):
    __tablename__ = "achievements"
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    icon = Column(String, default="🏆")
    progress = Column(Integer, default=0)
    max = Column(Integer, default=1)
    condition = Column(String, nullable=True)
    reward = Column(String, nullable=True)
    tier = Column(String, nullable=True)
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)
