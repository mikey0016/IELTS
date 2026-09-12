from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime

# --- User ---
class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    avatarColor: str
    targetBand: float
    examDate: str
    dailyGoalMin: int
    notifications: Any
    planType: str
    role: str
    status: str
    createdAt: datetime
    lastActiveAt: datetime
    bannedReason: Optional[str] = None

    class Config:
        from_attributes = True

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ForgotRequest(BaseModel):
    email: str

class TokenResponse(BaseModel):
    user: dict
    token: str

# --- Generic ---
class MessageResponse(BaseModel):
    message: str

# --- Questions ---
class QuestionCreate(BaseModel):
    id: Optional[str] = None
    skill: str
    type: str
    topic: Optional[str] = "General"
    difficulty: str
    timeLimitSec: Optional[int] = 120
    passage: Optional[str] = None
    passageLabel: Optional[str] = None
    prompt: str
    options: Optional[List[str]] = None
    correctIndex: Optional[int] = None
    correctAnswer: Optional[str] = None
    transcript: Optional[str] = None
    audioDurationSec: Optional[int] = None
    explanation: Optional[str] = ""
    recommendLesson: Optional[str] = "General lesson"

class QuestionUpdate(BaseModel):
    skill: Optional[str] = None
    type: Optional[str] = None
    topic: Optional[str] = None
    difficulty: Optional[str] = None
    timeLimitSec: Optional[int] = None
    passage: Optional[str] = None
    passageLabel: Optional[str] = None
    prompt: Optional[str] = None
    options: Optional[Any] = None
    correctIndex: Optional[int] = None
    correctAnswer: Optional[str] = None
    transcript: Optional[str] = None
    audioDurationSec: Optional[int] = None
    explanation: Optional[str] = None
    recommendLesson: Optional[str] = None

# --- Vocabulary ---
class VocabCreate(BaseModel):
    id: Optional[str] = None
    word: str
    phonetic: Optional[str] = None
    partOfSpeech: Optional[str] = "noun"
    meaning: str
    example: Optional[str] = None
    synonyms: Optional[List[str]] = None
    difficulty: Optional[str] = "medium"
    band: Optional[int] = None
    topic: Optional[str] = None

class VocabUpdate(BaseModel):
    word: Optional[str] = None
    phonetic: Optional[str] = None
    partOfSpeech: Optional[str] = None
    meaning: Optional[str] = None
    example: Optional[str] = None
    synonyms: Optional[Any] = None
    difficulty: Optional[str] = None
    band: Optional[int] = None
    topic: Optional[str] = None

# --- Courses ---
class CourseCreate(BaseModel):
    key: str
    title: str
    description: Optional[str] = ""
    color: Optional[str] = "brand"

class CourseUpdate(BaseModel):
    key: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None

class LessonCreate(BaseModel):
    id: Optional[str] = None
    title: str
    meta: Optional[str] = ""
    minutes: Optional[int] = 20
    skill: Optional[str] = None

class LessonUpdate(BaseModel):
    title: Optional[str] = None
    meta: Optional[str] = None
    minutes: Optional[int] = None
    skill: Optional[str] = None
    courseKey: Optional[str] = None

# --- Writing ---
class WritingCreate(BaseModel):
    id: Optional[str] = None
    task: Optional[str] = "Academic Task 2"
    type: Optional[str] = "academic-task2"
    difficulty: Optional[str] = "medium"
    timeLimitMin: Optional[int] = 40
    minWords: Optional[int] = 250
    prompt: str
    instructions: Optional[List[str]] = None

class WritingUpdate(BaseModel):
    task: Optional[str] = None
    type: Optional[str] = None
    difficulty: Optional[str] = None
    timeLimitMin: Optional[int] = None
    minWords: Optional[int] = None
    prompt: Optional[str] = None
    instructions: Optional[Any] = None

# --- Speaking ---
class SpeakingCreate(BaseModel):
    id: Optional[str] = None
    part: Optional[int] = 1
    difficulty: Optional[str] = "medium"
    prepTimeSec: Optional[int] = 60
    speakingTimeSec: Optional[int] = 120
    cueCardTitle: str
    prompt: str
    followUps: Optional[List[str]] = None

class SpeakingUpdate(BaseModel):
    part: Optional[int] = None
    difficulty: Optional[str] = None
    prepTimeSec: Optional[int] = None
    speakingTimeSec: Optional[int] = None
    cueCardTitle: Optional[str] = None
    prompt: Optional[str] = None
    followUps: Optional[Any] = None

# --- Grammar ---
class GrammarCreate(BaseModel):
    id: Optional[str] = None
    title: str
    level: Optional[str] = "Intermediate (Band 5–6)"
    summary: Optional[str] = ""
    example: Optional[str] = ""
    minutes: Optional[int] = 20

class GrammarUpdate(BaseModel):
    title: Optional[str] = None
    level: Optional[str] = None
    summary: Optional[str] = None
    example: Optional[str] = None
    minutes: Optional[int] = None

# --- Mocks ---
class MockCreate(BaseModel):
    id: Optional[str] = None
    title: str
    type: Optional[str] = "Academic"
    durationMin: Optional[int] = 60
    questions: Optional[int] = 0
    description: Optional[str] = ""
    sections: Optional[Any] = None
    difficulty: Optional[str] = None

class MockUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    durationMin: Optional[int] = None
    questions: Optional[int] = None
    description: Optional[str] = None
    sections: Optional[Any] = None
    difficulty: Optional[str] = None

# --- Achievement ---
class AchievementCreate(BaseModel):
    id: Optional[str] = None
    title: str
    description: Optional[str] = ""
    icon: Optional[str] = "🏆"
    progress: Optional[int] = 0
    max: Optional[int] = 1
    condition: Optional[str] = None
    reward: Optional[str] = None
    tier: Optional[str] = None

class AchievementUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    progress: Optional[int] = None
    max: Optional[int] = None
    condition: Optional[str] = None
    reward: Optional[str] = None
    tier: Optional[str] = None

# --- Music ---
class MusicCreate(BaseModel):
    title: str
    artist: Optional[str] = "IELTS Master"
    url: str
    coverUrl: Optional[str] = None
    durationSec: Optional[int] = 0
    category: Optional[str] = "reading"
    order: Optional[int] = 0
    isActive: Optional[bool] = True

class MusicUpdate(BaseModel):
    title: Optional[str] = None
    artist: Optional[str] = None
    url: Optional[str] = None
    coverUrl: Optional[str] = None
    durationSec: Optional[int] = None
    category: Optional[str] = None
    order: Optional[int] = None
    isActive: Optional[bool] = None

# --- Admin User ---
class RoleUpdate(BaseModel):
    role: str

class PlanUpdate(BaseModel):
    planType: Optional[str] = None
    plan: Optional[str] = None

class BanRequest(BaseModel):
    reason: Optional[str] = "Banned by admin"

class WalletAdd(BaseModel):
    amount: int
    reason: Optional[str] = "Admin gift"

class WalletSet(BaseModel):
    coins: int

class AdminUserCreate(BaseModel):
    name: str
    email: str
    password: Optional[str] = "123456"
    avatarColor: Optional[str] = "#7c3aed"
    targetBand: Optional[float] = 7
    planType: Optional[str] = "free"
    role: Optional[str] = "student"
    status: Optional[str] = "active"
    examDate: Optional[str] = ""
    dailyGoalMin: Optional[int] = 30

class AdminUserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    avatarColor: Optional[str] = None
    targetBand: Optional[float] = None
    examDate: Optional[str] = None
    dailyGoalMin: Optional[int] = None
    notifications: Optional[Any] = None
    planType: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    bannedReason: Optional[str] = None
    coins: Optional[int] = None
    xp: Optional[int] = None
    level: Optional[int] = None
