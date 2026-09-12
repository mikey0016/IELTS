import re


def normalize(text: str) -> str:
    """Katta/kichik, ortiqcha bo'sh joylarni normallashtirish."""
    if not text:
        return ""
    # trim + ichki ko'p bo'shliqni bitta qilamiz
    t = text.strip()
    t = re.sub(r"\s+", " ", t)
    return t.lower()


def display_name(user) -> str:
    """Username bo'lmasa first_name + last_name."""
    if getattr(user, "username", None):
        return f"@{user.username}"
    name = (user.first_name or "").strip()
    if getattr(user, "last_name", None):
        name = f"{name} {user.last_name}".strip()
    return name or f"ID:{user.id}"


def mention_html(user_id: int, name: str) -> str:
    # HTML mention — username bo'lmasa ham ishlaydi
    safe = name.replace("<", "").replace(">", "").replace("&", "")
    return f'<a href="tg://user?id={user_id}">{safe}</a>'


def format_lobby(players: dict) -> str:
    if not players:
        return (
            "🎮 <b>TZ O‘YINI</b>\n\n"
            "👥 O‘yinchilar: 0\n"
            "<i>Hali hech kim qo‘shilmadi.</i>\n\n"
            "O‘yinga qo‘shilish uchun tugmani bosing:"
        )
    lines = []
    for i, (uid, info) in enumerate(players.items(), 1):
        lines.append(f"{i}. 👤 {info['display']}")
    body = "\n".join(lines)
    return (
        "🎮 <b>TZ O‘YINI</b>\n\n"
        f"👥 O‘yinchilar: {len(players)}\n\n"
        f"{body}\n\n"
        "O‘yinga qo‘shilish uchun tugmani bosing:"
    )


def format_result(scores: dict) -> str:
    if not scores:
        return "🏆 <b>NATIJA</b>\n\nHali ball yo‘q."
    # scores: {user_id: {display, score}}
    sorted_players = sorted(scores.values(), key=lambda x: x["score"], reverse=True)
    medals = ["🥇", "🥈", "🥉"]
    lines = ["🏆 <b>NATIJA</b>\n"]
    for i, p in enumerate(sorted_players):
        medal = medals[i] if i < 3 else f"{i+1}."
        lines.append(f"{medal} {p['display']} — {p['score']} ball")
    return "\n".join(lines)


def is_admin_check(member) -> bool:
    # aiogram ChatMember status
    return member.status in ("administrator", "creator")


async def check_is_admin(bot, chat_id: int, user_id: int) -> bool:
    try:
        m = await bot.get_chat_member(chat_id, user_id)
        return is_admin_check(m)
    except Exception:
        return False
