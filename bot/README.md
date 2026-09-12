# TZ — Tez Yozish Telegram Boti

Mafia Live uslubidagi tez yozish o'yini. Bot guruhga tasodifiy so'z yuboradi, birinchi to'g'ri yozgan ball oladi.

## Xususiyatlar
- Lobby: O'YINGA QO'SHILISH / O'YINDAN CHIQISH / BOSHLASH
- Race-condition himoyasi (`asyncio.Lock`)
- Har guruh alohida state
- SQLite da so'zlar va reyting saqlanadi (restart da yo'qolmaydi)
- Admin tekshiruvi Telegram admin statusi orqali
- Case-insensitive, trim

## O'rnatish

```bash
cd bot
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# .env ichiga BOT_TOKEN ni qo'ying

python -m bot.main
```

Tokenni @BotFather dan oling.

## .env
```
BOT_TOKEN=123456:ABC...
DB_PATH=bot/data/tz.db
DEFAULT_ROUNDS=10
```

## Buyruqlar

| Buyruq | Tavsif |
|--------|--------|
| /startgame [10/20/50] | Lobbi ochish |
| /stopgame | O'yinni to'xtatish (admin) |
| /top | Umumiy reyting |
| /addword [so'z] | So'z qo'shish (admin) |
| /delword [so'z] | So'z o'chirish (admin) |
| /words | So'zlar ro'yxati (admin) |
| /clearwords | Barchasini o'chirish (admin) |
| /help | Yordam |
| /cancel | Kutilayotgan amalni bekor qilish |

## O'yin flow
1. /startgame → lobby xabari
2. O'yinchilar 🎮 tugmani bosadi
3. 🚀 BOSHLASH → o'yin boshlanadi
4. Har raundda `so'z` yuboriladi, birinchi to'g'ri yozgan +1 ball
5. Belgilangan raund tugagach g'oliblar e'lon qilinadi

## Texnik
- aiogram 3.x, asyncio
- aiosqlite
- Har chat uchun alohida `lobbies` / `games` dict + per-game Lock

## Botni guruhga qo'shish
- Botni guruhga invite qiling
- Admin qiling (xabarlarni o'qiy olishi uchun)
- Privacy mode ni o'chiring @BotFather → /setprivacy → Disable (guruh xabarlarini ko'rishi uchun muhim)

## Loyiha strukturasi
```
bot/
  main.py
  config.py
  database.py
  game_state.py
  keyboards.py
  utils.py
  handlers/
    game.py
    admin.py
  data/tz.db
  requirements.txt
  .env.example
```
