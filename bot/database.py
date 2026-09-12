import aiosqlite
import os
import random
from typing import Optional

from .config import DB_PATH, DEFAULT_WORDS


async def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS words (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                word TEXT UNIQUE NOT NULL COLLATE NOCASE
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS scores (
                chat_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                username TEXT,
                display_name TEXT,
                score INTEGER NOT NULL DEFAULT 0,
                PRIMARY KEY (chat_id, user_id)
            )
        """)
        await db.commit()

        # Agar so'zlar bo'sh bo'lsa defaultlarni qo'shish
        async with db.execute("SELECT COUNT(*) FROM words") as cur:
            row = await cur.fetchone()
            if row and row[0] == 0:
                for w in DEFAULT_WORDS:
                    try:
                        await db.execute("INSERT INTO words(word) VALUES (?)", (w.strip(),))
                    except aiosqlite.IntegrityError:
                        pass
                await db.commit()


# ---------- Words ----------
async def add_word(word: str) -> bool:
    word = word.strip()
    if not word:
        return False
    async with aiosqlite.connect(DB_PATH) as db:
        try:
            await db.execute("INSERT INTO words(word) VALUES (?)", (word,))
            await db.commit()
            return True
        except aiosqlite.IntegrityError:
            return False


async def delete_word(word: str) -> bool:
    word = word.strip()
    async with aiosqlite.connect(DB_PATH) as db:
        cur = await db.execute("DELETE FROM words WHERE word = ? COLLATE NOCASE", (word,))
        await db.commit()
        return cur.rowcount > 0


async def clear_words() -> int:
    async with aiosqlite.connect(DB_PATH) as db:
        cur = await db.execute("DELETE FROM words")
        await db.commit()
        return cur.rowcount


async def get_all_words() -> list[str]:
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT word FROM words ORDER BY word ASC") as cur:
            rows = await cur.fetchall()
            return [r[0] for r in rows]


async def get_random_word(exclude: Optional[set[str]] = None) -> Optional[str]:
    words = await get_all_words()
    if exclude:
        words = [w for w in words if w not in exclude]
    if not words:
        # hammasini ishlatib bo'lingan bo'lsa qayta
        words = await get_all_words()
    if not words:
        return None
    return random.choice(words)


async def count_words() -> int:
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT COUNT(*) FROM words") as cur:
            row = await cur.fetchone()
            return row[0] if row else 0


# ---------- Scores ----------
async def add_score(chat_id: int, user_id: int, username: str | None, display_name: str, points: int = 1):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            INSERT INTO scores(chat_id, user_id, username, display_name, score)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(chat_id, user_id) DO UPDATE SET
                score = score + ?,
                username = excluded.username,
                display_name = excluded.display_name
        """, (chat_id, user_id, username, display_name, points, points))
        await db.commit()


async def get_top(chat_id: int, limit: int = 20) -> list[tuple]:
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT user_id, username, display_name, score FROM scores WHERE chat_id=? ORDER BY score DESC, display_name ASC LIMIT ?",
            (chat_id, limit)
        ) as cur:
            rows = await cur.fetchall()
            return rows


async def get_score(chat_id: int, user_id: int) -> int:
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT score FROM scores WHERE chat_id=? AND user_id=?", (chat_id, user_id)) as cur:
            row = await cur.fetchone()
            return row[0] if row else 0
