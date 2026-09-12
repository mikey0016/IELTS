import os
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN: str = os.getenv("BOT_TOKEN", "")
if not BOT_TOKEN:
    # .env fayl bot/ ichida bo'lishi ham mumkin
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        load_dotenv(env_path)
        BOT_TOKEN = os.getenv("BOT_TOKEN", "")

DB_PATH: str = os.getenv("DB_PATH", os.path.join(os.path.dirname(__file__), "data", "tz.db"))

DEFAULT_ROUNDS: int = int(os.getenv("DEFAULT_ROUNDS", "10"))

# So'zlar kam bo'lsa fallback ro'yxat
DEFAULT_WORDS = [
    "kompyuter", "maktab", "kitob", "dars", "o'qituvchi",
    "talaba", "universitet", "dastur", "telefon", "internet",
    "klaviatura", "sichqoncha", "monitor", "daftar", "qalam",
    "stol", "stul", "deraza", "eshik", "kitobxon",
    "yozuvchi", "shoir", "san'at", "musiqa", "sport",
    "futbol", "basketbol", "matematika", "fizika", "kimyo",
    "tarix", "geografiya", "biologiya", "adabiyot", "ingliz",
    "o'zbek", "dunyo", "hayot", "kelajak", "orzu",
    "muvaffaqiyat", "bilim", "tajriba", "do'stlik", "oila",
    "sog'liq", "baxt", "sevgi", "hurmat", "sabr",
]
