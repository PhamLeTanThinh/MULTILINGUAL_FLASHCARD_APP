from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    name: str
    avatar: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserUpdate(UserBase):
    pass

class User(UserBase):
    id: int
    created_at: datetime
    last_activity_at: datetime  # ← MỚI
    days_until_deletion: Optional[int] = None  # ← MỚI
    deck_count: Optional[int] = None

    class Config:
        from_attributes = True

# Deck Schemas
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
    updated_at: datetime
    flashcard_count: Optional[int] = 0
    
    class Config:
        from_attributes = True

# Flashcard Schemas
class FlashcardBase(BaseModel):
    vietnamese: str
    pronunciation: Optional[str] = None
    target_language: str

class FlashcardCreate(FlashcardBase):
    deck_id: int

class FlashcardUpdate(FlashcardBase):
    pass

class Flashcard(FlashcardBase):
    id: int
    deck_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# CSV Import
class CSVFlashcard(BaseModel):
    vietnamese: str
    pronunciation: str
    target_language: str

class BulkImportRequest(BaseModel):
    deck_id: int
    flashcards: List[CSVFlashcard]

# Dictionary Search
class DictionaryResult(BaseModel):
    vietnamese: str
    pronunciation: str
    target_language: str
    language: str