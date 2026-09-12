from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..deps import require_admin

router = APIRouter(prefix="/api/admin/users", tags=["wallet"])

@router.get("/{user_id}/wallet")
def get_wallet(user_id: str, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    txs = db.query(models.WalletTransaction).filter(models.WalletTransaction.userId == user_id).order_by(models.WalletTransaction.createdAt.desc()).limit(20).all()
    return {
        "userId": user.id,
        "coins": user.coins,
        "xp": user.xp,
        "level": user.level,
        "transactions": [{"amount": t.amount, "reason": t.reason, "date": t.createdAt.isoformat(), "balance": t.balance} for t in txs],
    }

@router.post("/{user_id}/wallet/add")
def add_wallet(user_id: str, payload: schemas.WalletAdd, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    amt = payload.amount
    if amt == 0 or abs(amt) > 10000:
        if amt == 0:
            raise HTTPException(status_code=400, detail="Amount must be non-zero")
        raise HTTPException(status_code=400, detail="Amount too large")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    next_coins = max(0, user.coins + amt)
    next_xp = user.xp + (amt if amt > 0 else 0)
    next_level = next_xp // 200 + 1
    user.coins = next_coins
    user.xp = next_xp
    user.level = next_level
    tx = models.WalletTransaction(userId=user.id, amount=amt, reason=payload.reason or "Admin gift", balance=next_coins)
    db.add(tx)
    db.commit()
    db.refresh(user)
    txs = db.query(models.WalletTransaction).filter(models.WalletTransaction.userId == user_id).order_by(models.WalletTransaction.createdAt.desc()).limit(20).all()
    return {
        "userId": user.id,
        "coins": user.coins,
        "xp": user.xp,
        "level": user.level,
        "transactions": [{"amount": t.amount, "reason": t.reason, "date": t.createdAt.isoformat(), "balance": t.balance} for t in txs],
    }

@router.post("/{user_id}/wallet/set")
def set_wallet(user_id: str, payload: schemas.WalletSet, db: Session = Depends(get_db), admin: models.User = Depends(require_admin)):
    c = payload.coins
    if c < 0 or c > 100000:
        raise HTTPException(status_code=400, detail="Coins must be 0-100000")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.coins = int(c)
    db.commit()
    db.refresh(user)
    txs = db.query(models.WalletTransaction).filter(models.WalletTransaction.userId == user_id).order_by(models.WalletTransaction.createdAt.desc()).limit(20).all()
    return {
        "userId": user.id,
        "coins": user.coins,
        "xp": user.xp,
        "level": user.level,
        "transactions": [{"amount": t.amount, "reason": t.reason, "date": t.createdAt.isoformat(), "balance": t.balance} for t in txs],
    }
