import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from .database import engine, Base
# Import models to register
from . import models  # noqa

# Create tables if not exists (safe)
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"⚠️  DB create_all failed: {e}")

from .routers import auth, admin_users, wallet, questions, vocabulary, courses, writing, speaking, grammar, mocks, achievements, music, stats

app = FastAPI(
    title="IELTS Master API (FastAPI)",
    version="1.0.0",
    description="Full FastAPI backend with PostgreSQL — ported from Express/Prisma",
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {"ok": True}

# Auth
app.include_router(auth.router)

# Admin users + wallet (same prefix, order matters)
app.include_router(admin_users.router)
app.include_router(wallet.router)

# Content routers
app.include_router(questions.router)
app.include_router(vocabulary.router)
app.include_router(courses.router)
app.include_router(writing.router)
app.include_router(speaking.router)
app.include_router(grammar.router)
app.include_router(mocks.router)
app.include_router(achievements.router)
app.include_router(music.router)
app.include_router(stats.router)

@app.get("/")
def root():
    return {"message": "IELTS Master FastAPI running", "docs": "/docs"}

# Fallback 404 handler is automatic by FastAPI
