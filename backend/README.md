# IELTS Master — FastAPI Backend (PostgreSQL)

Full port of Express/Prisma backend to **FastAPI + PostgreSQL + SQLAlchemy**.

## Database
- **PostgreSQL** `postgres` / `Faxa2000` @ `localhost:5432/ielts_master`
- Env: `DATABASE_URL="postgresql://postgres:Faxa2000@localhost:5432/ielts_master?schema=public"`
- JWT: `ielts-master-super-secret-2026`

## Run

```bash
cd backend
py -m pip install -r requirements.txt
py -m uvicorn app.main:app --host 0.0.0.0 --port 4000 --reload
```

Docs: http://localhost:4000/docs

## Seed

```bash
py seed.py
```

## Frontend integration

- Vite proxy (`vite.config.ts:21`): `/api -> http://localhost:4000`
- Frontend env: `VITE_API_URL=http://localhost:4000` (empty = mock mode)
- `src/api/http.ts` will auto-use real API when VITE_API_URL is set.

## Endpoints

Mirrors Express `server/src/index.js:565`:
- `GET /api/health`
- `POST /api/auth/signup, /login, /google, /me, /forgot-password`
- `GET/POST/PUT/DELETE /api/admin/users ...`
- `GET /api/admin/users/:id/wallet ...`
- `GET /api/questions, /api/admin/questions ...`
- `GET /api/vocabulary, /api/admin/vocabulary ...`
- `GET /api/courses, /api/admin/courses ...`
- `GET /api/writing, /api/admin/writing ...`
- `GET /api/speaking, /api/admin/speaking ...`
- `GET /api/grammar, /api/admin/grammar ...`
- `GET /api/mocks, /api/admin/mocks ...`
- `GET /api/achievements, /api/admin/achievements ...`
- `GET /api/music, /api/admin/music ...`
- `GET /api/admin/stats`
