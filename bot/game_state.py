import asyncio
from dataclasses import dataclass, field
from typing import Optional

@dataclass
class Lobby:
    chat_id: int
    message_id: Optional[int] = None
    players: dict = field(default_factory=dict)  # user_id -> {display, username, first_name}
    rounds: int = 10
    created_by: Optional[int] = None

@dataclass
class Game:
    chat_id: int
    players: dict  # user_id -> info
    scores: dict = field(default_factory=dict)  # user_id -> {display, username, score}
    current_word: Optional[str] = None
    normalized_word: Optional[str] = None
    round_num: int = 0
    total_rounds: int = 10
    used_words: set = field(default_factory=set)
    lock: asyncio.Lock = field(default_factory=asyncio.Lock)
    active: bool = True
    round_resolved: bool = False  # race condition oldini olish

# Global storages — har bir guruh alohida
lobbies: dict[int, Lobby] = {}
games: dict[int, Game] = {}

# FSM uchun vaqtinchalik holatlar
pending_addword: set[int] = set()  # user_id lar kutilmoqda
pending_delword: set[int] = set()
