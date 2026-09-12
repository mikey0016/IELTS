from aiogram import Router, F, Bot
from aiogram.types import Message
from aiogram.filters import Command

from ..game_state import pending_addword, pending_delword
from ..utils import check_is_admin
from ..database import add_word, delete_word, get_all_words, clear_words, count_words

router = Router()

async def is_admin_or_reply(message: Message, bot: Bot) -> bool:
    # Private da ham admin deb hisoblaymiz? — faqat owner
    # Guruhda esa admin tekshiramiz
    if message.chat.type == "private":
        # Private da ham ruxsat beramiz (test uchun qulay)
        return True
    ok = await check_is_admin(bot, message.chat.id, message.from_user.id)
    if not ok:
        await message.reply("❌ Bu buyruq faqat adminlar uchun.")
    return ok

@router.message(Command("addword"))
async def cmd_addword(message: Message, bot: Bot):
    if not await is_admin_or_reply(message, bot):
        return
    # Agar reply bilan so'z yuborilgan bo'lsa darhol qo'shamiz
    args = message.text.split(maxsplit=1)
    if len(args) > 1 and args[1].strip():
        word = args[1].strip()
        # vergul bilan ajratilgan ko'p so'zlarni ham qo'llab quvvatlaymiz
        words = [w.strip() for w in word.replace(",", " ").split() if w.strip()]
        added = 0
        for w in words:
            if await add_word(w):
                added += 1
        if added:
            await message.reply(f"✅ {added} ta so‘z bazaga qo‘shildi.")
        else:
            await message.reply("⚠️ So‘zlar allaqachon mavjud yoki noto‘g‘ri.")
        return

    pending_addword.add(message.from_user.id)
    # delword pending bo'lsa tozalaymiz
    pending_delword.discard(message.from_user.id)
    await message.reply("✍️ Qo‘shmoqchi bo‘lgan so‘zingizni yuboring.\n<i>Bekor qilish uchun /cancel</i>", parse_mode="HTML")

@router.message(Command("delword"))
async def cmd_delword(message: Message, bot: Bot):
    if not await is_admin_or_reply(message, bot):
        return
    args = message.text.split(maxsplit=1)
    if len(args) > 1 and args[1].strip():
        word = args[1].strip()
        if await delete_word(word):
            await message.reply(f"🗑 «{word}» so‘zi o‘chirildi.")
        else:
            await message.reply(f"❌ «{word}» topilmadi.")
        return
    pending_delword.add(message.from_user.id)
    pending_addword.discard(message.from_user.id)
    await message.reply("🗑 O‘chirmoqchi bo‘lgan so‘zni yuboring.\n<i>Bekor qilish uchun /cancel</i>", parse_mode="HTML")

@router.message(Command("cancel"))
async def cmd_cancel(message: Message):
    removed = False
    if message.from_user.id in pending_addword:
        pending_addword.discard(message.from_user.id)
        removed = True
    if message.from_user.id in pending_delword:
        pending_delword.discard(message.from_user.id)
        removed = True
    if removed:
        await message.reply("✅ Bekor qilindi.")
    else:
        await message.reply("ℹ️ Bekor qilinadigan amal yo‘q.")

@router.message(Command("words"))
async def cmd_words(message: Message, bot: Bot):
    if not await is_admin_or_reply(message, bot):
        return
    words = await get_all_words()
    if not words:
        await message.reply("📭 Bazada so‘z yo‘q. /addword bilan qo‘shing.")
        return
    total = len(words)
    # Juda ko'p bo'lsa bo'lib yuboramiz
    text = "📚 <b>So‘zlar bazasi</b> — {} ta:\n\n".format(total)
    # Har birini vergul bilan
    joined = ", ".join(f"<code>{w}</code>" for w in words)
    # Telegram limit 4096
    full = text + joined
    if len(full) > 3500:
        # Qisqartiramiz
        preview = words[:100]
        joined2 = ", ".join(f"<code>{w}</code>" for w in preview)
        full = text + joined2 + f"\n\n<i>... va yana {total-100} ta so‘z</i>"
    await message.reply(full, parse_mode="HTML")

@router.message(Command("clearwords"))
async def cmd_clearwords(message: Message, bot: Bot):
    if not await is_admin_or_reply(message, bot):
        return
    cnt = await count_words()
    if cnt == 0:
        await message.reply("📭 Baza allaqachon bo‘sh.")
        return
    await clear_words()
    await message.reply(f"🗑 Barcha so‘zlar o‘chirildi ({cnt} ta).")

# Pending holatni ushlaydigan handler — admin so'z yuborganda
@router.message(F.text & ~F.via_bot)
async def handle_pending_word(message: Message, bot: Bot):
    uid = message.from_user.id
    # Faqat pending bo'lsa ishlasin, va command emas
    if uid not in pending_addword and uid not in pending_delword:
        return
    if message.text.startswith("/"):
        return
    # Admin tekshiruvi yana
    if not await check_is_admin(bot, message.chat.id, uid) and message.chat.type != "private":
        # Private da ruxsat bor
        pending_addword.discard(uid)
        pending_delword.discard(uid)
        return

    word = message.text.strip()
    # Ko'p so'zli input ni ham qo'llab quvvatlash
    # Agar 1 ta so'z kutilayotgan bo'lsa ham bir nechta bo'lsa har birini qo'shamiz
    if uid in pending_addword:
        # Bir nechta so'z bo'lsa
        words = [w.strip() for w in word.replace(",", " ").split() if w.strip()]
        # Agar juda ko'p bo'lsa cheklaymiz
        if len(words) > 20:
            await message.reply("⚠️ Bir vaqtda 20 tagacha so‘z qo‘shing.")
            return
        added = 0
        dups = 0
        for w in words:
            ok = await add_word(w)
            if ok:
                added += 1
            else:
                dups += 1
        pending_addword.discard(uid)
        if added:
            await message.reply(f"✅ «{', '.join(words[:5])}» — {added} ta qo‘shildi." + (f" ({dups} ta allaqachon bor edi)" if dups else ""))
        else:
            await message.reply("⚠️ Barcha so‘zlar allaqachon mavjud.")
        return

    if uid in pending_delword:
        # Faqat bitta so'z o'chirish
        w = word.split()[0]
        ok = await delete_word(w)
        pending_delword.discard(uid)
        if ok:
            await message.reply(f"🗑 «{w}» o‘chirildi.")
        else:
            await message.reply(f"❌ «{w}» topilmadi.")
        return
