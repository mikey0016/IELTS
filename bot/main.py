import asyncio
import logging
from aiogram import Bot, Dispatcher
from aiogram.enums import ParseMode
from aiogram.client.default import DefaultBotProperties
from aiogram.fsm.storage.memory import MemoryStorage

from .config import BOT_TOKEN
from .database import init_db
from .handlers.game import router as game_router
from .handlers.admin import router as admin_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(name)s | %(message)s")
logger = logging.getLogger(__name__)

async def main():
    if not BOT_TOKEN or BOT_TOKEN == "123456:TEST":
        logger.error("BOT_TOKEN topilmadi! .env faylga BOT_TOKEN=... qo'shing.")
        return

    await init_db()
    logger.info("DB tayyor")

    bot = Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
    dp = Dispatcher(storage=MemoryStorage())

    # Admin router oldin turishi kerak — pending word handler game handlerdan oldin ishlashi uchun
    dp.include_router(admin_router)
    dp.include_router(game_router)

    logger.info("Bot ishga tushdi ✅")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
