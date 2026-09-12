import asyncio
from aiogram import Router, F, Bot
from aiogram.types import Message, CallbackQuery
from aiogram.filters import Command
from aiogram.exceptions import TelegramBadRequest

from ..game_state import lobbies, games, Lobby, Game
from ..keyboards import lobby_keyboard, rounds_keyboard
from ..utils import normalize, display_name, format_lobby, format_result, check_is_admin, mention_html
from ..config import DEFAULT_ROUNDS
from ..database import get_random_word, add_score, get_top

router = Router()

# ---------- Helpers ----------

async def update_lobby_message(bot: Bot, chat_id: int):
    lobby = lobbies.get(chat_id)
    if not lobby or not lobby.message_id:
        return
    text = format_lobby(lobby.players)
    # round info qo'shamiz
    text += f"\n\n🔄 Raundlar: <b>{lobby.rounds}</b>"
    try:
        await bot.edit_message_text(
            chat_id=chat_id,
            message_id=lobby.message_id,
            text=text,
            reply_markup=lobby_keyboard(),
            parse_mode="HTML",
        )
    except TelegramBadRequest:
        pass

async def send_next_word(bot: Bot, chat_id: int):
    game = games.get(chat_id)
    if not game or not game.active:
        return

    if game.round_num >= game.total_rounds:
        await finish_game(bot, chat_id)
        return

    game.round_num += 1
    word = await get_random_word(exclude=game.used_words)
    if not word:
        await bot.send_message(chat_id, "❌ So‘zlar bazasi bo‘sh! Admin /addword orqali so‘z qo‘shsin.")
        await finish_game(bot, chat_id)
        return

    game.used_words.add(word)
    game.current_word = word
    game.normalized_word = normalize(word)
    game.round_resolved = False

    await bot.send_message(
        chat_id,
        f"🚀 <b>TZ O‘YINI — {game.round_num}/{game.total_rounds}</b>\n\n"
        f"⚡ Birinchi bo‘lib yozing!\n\n"
        f"📝 <b>SO‘Z:</b>\n"
        f"<code>{word}</code>\n\n"
        f"Kim birinchi bo‘lib aynan <code>{word}</code> deb yozsa, ball oladi!",
        parse_mode="HTML",
    )

async def finish_game(bot: Bot, chat_id: int):
    game = games.pop(chat_id, None)
    if not game:
        return
    game.active = False

    # Umumiy DB reytingga yozish shart emas — har roundda yoziladi

    if not game.scores:
        await bot.send_message(chat_id, "🏁 <b>O‘YIN TUGADI!</b>\n\nHech kim ball olmadi 😢", parse_mode="HTML")
        return

    sorted_scores = sorted(game.scores.values(), key=lambda x: x["score"], reverse=True)
    medals = ["🥇", "🥈", "🥉"]
    lines = ["🏁 <b>O‘YIN TUGADI!</b>\n", "🏆 <b>G‘OLIBLAR</b>\n"]
    for i, p in enumerate(sorted_scores):
        medal = medals[i] if i < 3 else f"{i+1}."
        # HTML mention bilan
        # display da @ bo'lsa ham mention qilamiz
        lines.append(f"{medal} {p['display']} — {p['score']} ball")
    # Agar barcha 0 bo'lsa ham
    text = "\n".join(lines)
    await bot.send_message(chat_id, text, parse_mode="HTML")

    # Joriy o'yin natijasini ham /top da ko'rish uchun alohida xabar emas — scores allaqachon DB da

# ---------- Commands ----------

@router.message(Command("startgame"))
async def cmd_startgame(message: Message, bot: Bot):
    chat_id = message.chat.id

    # Faqat guruhlarda? private da ham ishlasin lekin ogohlantiramiz
    # Agar allaqachon lobby yoki game bo'lsa
    if chat_id in games:
        await message.reply("⚠️ Bu guruhda o‘yin allaqachon ketmoqda! /stopgame bilan to‘xtating.")
        return
    if chat_id in lobbies:
        await message.reply("⚠️ Lobbi allaqachon ochilgan. O‘yinchilar qo‘shilmoqda...")
        return

    # Rounds argument
    args = (message.text or "").split()
    rounds = DEFAULT_ROUNDS
    if len(args) > 1:
        try:
            r = int(args[1])
            if r in (10, 20, 50) or (1 <= r <= 100):
                rounds = r
        except ValueError:
            pass

    lobby = Lobby(chat_id=chat_id, rounds=rounds, created_by=message.from_user.id)
    lobbies[chat_id] = lobby

    text = format_lobby(lobby.players) + f"\n\n🔄 Raundlar: <b>{rounds}</b>\n<i>/startgame 10/20/50 deb raundni o‘zgartirsa bo‘ladi</i>"
    sent = await message.answer(text, reply_markup=lobby_keyboard(), parse_mode="HTML")
    lobby.message_id = sent.message_id

@router.message(Command("stopgame"))
async def cmd_stopgame(message: Message, bot: Bot):
    chat_id = message.chat.id
    # Admin tekshiruvi
    is_admin = await check_is_admin(bot, chat_id, message.from_user.id)
    # Private da ham to'xtatishga ruxsat
    if message.chat.type in ("group", "supergroup") and not is_admin:
        await message.reply("❌ Faqat admin o‘yinni to‘xtata oladi.")
        return

    removed = False
    if chat_id in lobbies:
        lobbies.pop(chat_id)
        removed = True
    if chat_id in games:
        await finish_game(bot, chat_id)
        removed = True

    if removed:
        await message.answer("🛑 O‘yin to‘xtatildi.")
    else:
        await message.answer("ℹ️ To‘xtatiladigan o‘yin yo‘q.")

@router.message(Command("top"))
async def cmd_top(message: Message):
    chat_id = message.chat.id
    rows = await get_top(chat_id, limit=20)
    if not rows:
        await message.answer("🏆 Hali reyting bo‘sh. O‘ynab ball yig‘ing!")
        return
    medals = ["🥇", "🥈", "🥉"]
    lines = ["🏆 <b>UMUMIY REYTING</b>\n"]
    for i, (uid, username, disp, score) in enumerate(rows):
        medal = medals[i] if i < 3 else f"{i+1}."
        name = disp or (f"@{username}" if username else f"ID:{uid}")
        lines.append(f"{medal} {name} — {score} ball")
    await message.answer("\n".join(lines), parse_mode="HTML")

# fix top alias: /rating ham bo'lsin
@router.message(Command("rating"))
async def cmd_rating(message: Message):
    await cmd_top(message)

# ---------- Callbacks ----------

@router.callback_query(F.data == "tz_join")
async def cb_join(callback: CallbackQuery, bot: Bot):
    chat_id = callback.message.chat.id
    lobby = lobbies.get(chat_id)
    if not lobby:
        await callback.answer("Lobbi topilmadi. /startgame bilan yangi o‘yin boshlang.", show_alert=True)
        return

    uid = callback.from_user.id
    if uid in lobby.players:
        await callback.answer("Siz allaqachon qo‘shilgansiz ✅")
        return

    disp = display_name(callback.from_user)
    lobby.players[uid] = {
        "display": disp,
        "username": callback.from_user.username,
        "first_name": callback.from_user.first_name,
        "user_id": uid,
    }
    await callback.answer(f"Qo‘shildingiz, {disp}!")
    await update_lobby_message(bot, chat_id)

@router.callback_query(F.data == "tz_leave")
async def cb_leave(callback: CallbackQuery, bot: Bot):
    chat_id = callback.message.chat.id
    lobby = lobbies.get(chat_id)
    if not lobby:
        await callback.answer("Lobbi topilmadi.", show_alert=True)
        return
    uid = callback.from_user.id
    if uid not in lobby.players:
        await callback.answer("Siz lobbi da emassiz.", show_alert=True)
        return
    lobby.players.pop(uid)
    await callback.answer("Lobbidan chiqdingiz.")
    await update_lobby_message(bot, chat_id)

@router.callback_query(F.data == "tz_start")
async def cb_start(callback: CallbackQuery, bot: Bot):
    chat_id = callback.message.chat.id
    lobby = lobbies.get(chat_id)
    if not lobby:
        await callback.answer("Lobbi topilmadi.", show_alert=True)
        return

    # Admin yoki istalgan o'yinchi bosishi mumkinmi? Mafia Live da herkes bosa oladi, lekin kamida 2 kishi kerak
    # Admin bo'lmasa ham ruxsat beramiz, lekin lobby yaratuvchisi yoki admin bo'lsa yaxshiroq
    # Hozir hamma bosa oladi.
    if len(lobby.players) < 1:
        await callback.answer("Kamida 1 o‘yinchi kerak!", show_alert=True)
        return

    # O'yinni boshlash
    # Raund tanlashni so'rasakmi? Hozir darhol boshlaymiz
    await callback.answer("O‘yin boshlanmoqda...")

    # Lobby ni yopish
    lobbies.pop(chat_id, None)
    # Eski lobby xabarini yangilash — o'yin boshlandi
    try:
        await bot.edit_message_text(
            chat_id=chat_id,
            message_id=callback.message.message_id,
            text=f"🚀 <b>TZ O‘YINI BOSHLANDI!</b>\n\n👥 Qatnashchilar: {len(lobby.players)} ta\n🔄 Raundlar: {lobby.rounds} ta\n\nTez orada birinchi so‘z keladi...",
            parse_mode="HTML",
        )
    except TelegramBadRequest:
        pass

    # Game yaratish
    scores = {}
    for uid, info in lobby.players.items():
        scores[uid] = {"display": info["display"], "username": info["username"], "score": 0, "user_id": uid}

    game = Game(
        chat_id=chat_id,
        players=lobby.players,
        scores=scores,
        total_rounds=lobby.rounds,
    )
    games[chat_id] = game

    await send_next_word(bot, chat_id)

# ---------- Message handler — eng muhim joy ----------

@router.message(F.text & ~F.via_bot)
async def handle_answer(message: Message, bot: Bot):
    # Faqat guruhdagi o'yinlar uchun
    chat_id = message.chat.id
    game = games.get(chat_id)
    if not game or not game.active or not game.current_word:
        return
    # Agar foydalanuvchi o'yinda bo'lmasa — ishtirok eta oladimi? Spec bo'yicha faqat lobby dagi o'yinchilar?
    # Lekin ko'pincha hamma yozishi mumkin. Biz: faqat lobby dagi o'yinchilar ball olsin.
    uid = message.from_user.id
    if uid not in game.players:
        # Ruxsat berish yoki bermaslik? Hozir faqat qatnashchilar deb cheklaymiz
        # Agar xohlasangiz quyidagi 2 qatorni olib tashlab hamma ishtirok etsin
        return

    # Race condition dan himoya: lock
    async with game.lock:
        if game.round_resolved:
            return
        if normalize(message.text) != game.normalized_word:
            return

        # Birinchi to'g'ri javob!
        game.round_resolved = True

        winner_info = game.players[uid]
        disp = winner_info["display"]
        # Score ni oshirish (memory + DB)
        game.scores[uid]["score"] += 1
        await add_score(chat_id, uid, winner_info.get("username"), disp, 1)

        await message.reply(
            f"🥇 <b>{disp}</b> birinchi bo‘ldi!\n"
            f"⭐ <b>+1 BALL</b> — to‘g‘ri so‘z: <code>{game.current_word}</code>",
            parse_mode="HTML",
        )

        # Keyingi so'zga o'tish — qisqa pauza
        # lock ni qo'yib yuborib keyin delay qilamiz
        current_round = game.round_num

    # Lock dan tashqarida kutish va keyingi so'z
    # Agar o'yin tugagan bo'lmasa keyingi so'zni yuboramiz
    await asyncio.sleep(1.5)
    # Game hali ham activemi tekshirish
    if chat_id in games and games[chat_id].active:
        # Agar raund tugagan bo'lsa finish ichida tekshiriladi
        if games[chat_id].round_num >= games[chat_id].total_rounds:
            await finish_game(bot, chat_id)
        else:
            await send_next_word(bot, chat_id)

# Qo'shimcha: help
@router.message(Command("help"))
async def cmd_help(message: Message):
    await message.answer(
        "🎮 <b>TZ — TEZ YOZISH O‘YINI</b>\n\n"
        "<b>O‘yin buyruqlari:</b>\n"
        "/startgame [10|20|50] — yangi lobbi ochish\n"
        "/stopgame — o‘yinni to‘xtatish (admin)\n"
        "/top — umumiy reyting\n\n"
        "<b>Admin buyruqlari:</b>\n"
        "/addword — so‘z qo‘shish\n"
        "/delword — so‘z o‘chirish\n"
        "/words — so‘zlar ro‘yxati\n"
        "/clearwords — barcha so‘zlarni o‘chirish\n\n"
        "O‘yin: bot so‘z yuboradi, birinchi to‘g‘ri yozgan ball oladi ⚡",
        parse_mode="HTML",
    )

@router.message(Command("start"))
async def cmd_start(message: Message):
    # Private da start
    if message.chat.type == "private":
        await message.answer(
            "👋 Salom! Men <b>TZ Tez Yozish</b> botiman.\n\n"
            "Meni guruhga qo‘shing va /startgame bilan o‘yinni boshlang!\n\n"
            "Yordam uchun /help",
            parse_mode="HTML",
        )
    else:
        await cmd_help(message)
