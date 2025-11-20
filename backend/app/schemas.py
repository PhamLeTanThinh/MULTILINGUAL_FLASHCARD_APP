from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# ==================== USER SCHEMAS ====================

class UserBase(BaseModel):
    name: str
    avatar: Optional[str] = None

    # Loyalty fields (ALWAYS returned)
    points: int = 0
    theme: str = "default"


class UserCreate(BaseModel):
    name: str
    avatar: Optional[str] = None
    # points/theme will use DB defaults


class UserUpdate(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None

    # Cho phép đổi theme, KHÔNG cho đổi points
    theme: Optional[str] = None


class User(UserBase):
    id: int
    created_at: datetime
    last_activity_at: Optional[datetime] = None
    days_until_deletion: Optional[int] = None
    deck_count: Optional[int] = None

    class Config:
        from_attributes = True


# ==================== DECK SCHEMAS ====================

class DeckBase(BaseModel):
    name: str
    language: str  # EN, ZH, KO, JA

class DeckCreate(DeckBase):
    user_id: int

class DeckUpdate(BaseModel):
    name: Optional[str] = None

class Deck(DeckBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    flashcard_count: Optional[int] = 0

    class Config:
        from_attributes = True


# ==================== FLASHCARD SCHEMAS ====================

class FlashcardBase(BaseModel):
    vietnamese: str
    pronunciation: Optional[str] = None
    target_language: str

class FlashcardCreate(FlashcardBase):
    deck_id: int


class FlashcardUpdate(BaseModel):
    vietnamese: Optional[str] = None
    pronunciation: Optional[str] = None
    target_language: Optional[str] = None


class Flashcard(FlashcardBase):
    id: int
    deck_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== CSV IMPORT ====================

class CSVFlashcard(BaseModel):
    vietnamese: str
    pronunciation: str
    target_language: str

class BulkImportRequest(BaseModel):
    deck_id: int
    flashcards: List[CSVFlashcard]


# ==================== DICTIONARY SEARCH ====================

class DictionaryResult(BaseModel):
    vietnamese: str
    pronunciation: str
    target_language: str
    language: str