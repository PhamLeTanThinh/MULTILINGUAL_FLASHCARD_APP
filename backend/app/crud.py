from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from . import models, schemas

# ==================== USER CRUD ====================

def get_all_users(db: Session):
    """Lấy tất cả users"""
    return db.query(models.User).all()

def get_user(db: Session, user_id: int):
    """Lấy user theo ID"""
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_user(db: Session, user: schemas.UserCreate):
    """Tạo user mới"""
    db_user = models.User(
        name=user.name,
        avatar=user.avatar,
        # Dùng datetime aware (UTC) để khớp với DateTime(timezone=True)
        last_activity_at=datetime.now(timezone.utc)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user: schemas.UserUpdate):
    """Cập nhật user"""
    db_user = get_user(db, user_id)
    if db_user:
        db_user.name = user.name
        if user.avatar is not None:
            db_user.avatar = user.avatar
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    """Xóa user"""
    db_user = get_user(db, user_id)
    if db_user:
        db.delete(db_user)
        db.commit()
        return True
    return False

def update_user_activity(db: Session, user_id: int):
    """Update last_activity_at khi user truy cập"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        # Dùng datetime aware (UTC)
        user.last_activity_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(user)
    return user

def get_inactive_users(db: Session, days: int = 30):
    """Lấy danh sách users không hoạt động quá X ngày"""
    # threshold cũng phải là datetime aware
    threshold_date = datetime.now(timezone.utc) - timedelta(days=days)
    return db.query(models.User).filter(
        models.User.last_activity_at < threshold_date
    ).all()

def delete_user_cascade(db: Session, user_id: int):
    """Xóa user và tất cả data liên quan (cascade)"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        db.delete(user)
        db.commit()
        return True
    return False

def get_days_until_deletion(user: models.User) -> int:
    """Tính số ngày còn lại trước khi bị xóa (sau 30 ngày không hoạt động)"""

    # Nếu chưa có last_activity_at thì cho mặc định còn 30 ngày
    if not user.last_activity_at:
        return 30

    # now là datetime aware (UTC)
    now_utc = datetime.now(timezone.utc)

    last = user.last_activity_at

    # Nếu DB trả về naive datetime (trường hợp SQLite local) thì convert sang UTC
    if last.tzinfo is None:
        last = last.replace(tzinfo=timezone.utc)

    days_inactive = (now_utc - last).days
    days_remaining = 30 - days_inactive

    return max(0, days_remaining)

# ==================== DECK CRUD ====================

def get_decks_by_user(db: Session, user_id: int):
    """Lấy tất cả decks của user"""
    return db.query(models.Deck).filter(models.Deck.user_id == user_id).all()

def get_deck(db: Session, deck_id: int):
    """Lấy deck theo ID"""
    return db.query(models.Deck).filter(models.Deck.id == deck_id).first()

def create_deck(db: Session, deck: schemas.DeckCreate):
    """Tạo deck mới"""
    db_deck = models.Deck(**deck.dict())
    db.add(db_deck)
    db.commit()
    db.refresh(db_deck)
    return db_deck

def update_deck(db: Session, deck_id: int, deck: schemas.DeckUpdate):
    """Cập nhật deck"""
    db_deck = get_deck(db, deck_id)
    if db_deck:
        db_deck.name = deck.name
        db.commit()
        db.refresh(db_deck)
    return db_deck

def delete_deck(db: Session, deck_id: int):
    """Xóa deck"""
    db_deck = get_deck(db, deck_id)
    if db_deck:
        db.delete(db_deck)
        db.commit()
        return True
    return False

# ==================== FLASHCARD CRUD ====================

def get_flashcards_by_deck(db: Session, deck_id: int):
    """Lấy tất cả flashcards của deck"""
    return db.query(models.Flashcard).filter(models.Flashcard.deck_id == deck_id).all()

def get_flashcard(db: Session, flashcard_id: int):
    """Lấy flashcard theo ID"""
    return db.query(models.Flashcard).filter(models.Flashcard.id == flashcard_id).first()

def create_flashcard(db: Session, flashcard: schemas.FlashcardCreate):
    """Tạo flashcard mới"""
    db_flashcard = models.Flashcard(**flashcard.dict())
    db.add(db_flashcard)
    db.commit()
    db.refresh(db_flashcard)
    return db_flashcard

def create_flashcards_bulk(db: Session, deck_id: int, flashcards_data: list):
    """Tạo nhiều flashcards cùng lúc"""
    db_flashcards = []
    for fc_data in flashcards_data:
        db_flashcard = models.Flashcard(
            deck_id=deck_id,
            vietnamese=fc_data['vietnamese'],
            pronunciation=fc_data['pronunciation'],
            target_language=fc_data['target_language']
        )
        db.add(db_flashcard)
        db_flashcards.append(db_flashcard)
    
    db.commit()
    for fc in db_flashcards:
        db.refresh(fc)
    return db_flashcards

def update_flashcard(db: Session, flashcard_id: int, flashcard: schemas.FlashcardUpdate):
    """Cập nhật flashcard"""
    db_flashcard = get_flashcard(db, flashcard_id)
    if db_flashcard:
        db_flashcard.vietnamese = flashcard.vietnamese
        db_flashcard.pronunciation = flashcard.pronunciation
        db_flashcard.target_language = flashcard.target_language
        db.commit()
        db.refresh(db_flashcard)
    return db_flashcard

def delete_flashcard(db: Session, flashcard_id: int):
    """Xóa flashcard"""
    db_flashcard = get_flashcard(db, flashcard_id)
    if db_flashcard:
        db.delete(db_flashcard)
        db.commit()
        return True
    return False

def get_flashcards_by_deck(db: Session, deck_id: int):
    """Lấy tất cả flashcards của deck"""
    return db.query(models.Flashcard).filter(models.Flashcard.deck_id == deck_id).all()