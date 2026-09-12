from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton


def lobby_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🎮 O‘YINGA QO‘SHILISH", callback_data="tz_join")],
        [InlineKeyboardButton(text="🚪 O‘YINDAN CHIQISH", callback_data="tz_leave")],
        [InlineKeyboardButton(text="🚀 BOSHLASH", callback_data="tz_start")],
    ])


def rounds_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="10 ta", callback_data="tz_rounds_10"),
            InlineKeyboardButton(text="20 ta", callback_data="tz_rounds_20"),
            InlineKeyboardButton(text="50 ta", callback_data="tz_rounds_50"),
        ],
        [InlineKeyboardButton(text="❌ Bekor qilish", callback_data="tz_cancel")],
    ])
