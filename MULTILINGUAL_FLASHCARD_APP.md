# 🎴 Multilingual Flashcard Learning App
## Hệ thống học từ vựng đa ngôn ngữ (Tiếng Anh, Trung, Hàn, Nhật)

---

## 📋 MỤC LỤC

1. [Tổng quan hệ thống](#tổng-quan-hệ-thống)
2. [Tech Stack](#tech-stack)
3. [Cấu trúc Project](#cấu-trúc-project)
4. [Backend - FastAPI](#backend---fastapi)
5. [Frontend - Next.js](#frontend---nextjs)
6. [Database Schema](#database-schema)
7. [Hướng dẫn Setup Local](#hướng-dẫn-setup-local)
8. [Deployment Free](#deployment-free)
9. [API Documentation](#api-documentation)

---

## 🎯 TỔNG QUAN HỆ THỐNG

### Features chính:

✅ **Quản lý User Profiles** (10 users)
- Thêm/Xóa/Sửa profile người dùng
- Không cần login/logout (nội bộ)

✅ **Quản lý Decks (Bộ flashcard)**
- Mỗi user có nhiều decks
- Mỗi deck chỉ 1 ngôn ngữ (EN/ZH/KO/JA)
- Đặt tên deck tùy chỉnh

✅ **Flashcard Learning**
- Giao diện flip card giống Quizlet
- Hiển thị: Tiếng Việt ⟷ Ngôn ngữ đích + Phiên âm
- Text-to-Speech cho tất cả ngôn ngữ

✅ **Import dữ liệu 2 cách:**
1. **CSV Import**: Format `vietnamese,pronunciation,target_language`
2. **Dictionary Search**: Search tiếng Việt → Suggest từ vựng

---

## 🛠️ TECH STACK

### Frontend
```
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Framer Motion (animations)
- Zustand (state management)
- Axios (API calls)
- React Query (data fetching)
- Papa Parse (CSV parsing)
```

### Backend
```
- FastAPI (Python 3.10+)
- SQLAlchemy (ORM)
- SQLite (Database)
- Pydantic (Validation)
- gTTS (Google Text-to-Speech)
- pypinyin (Chinese pinyin)
- pykakasi (Japanese romaji)
- hangul-romanize (Korean romanization)
```

### Free APIs & Libraries
```
- CC-CEDICT (Chinese-Vietnamese dict)
- JMdict (Japanese-Vietnamese dict)
- Korean Basic Dict API
```

---

## 📁 CẤU TRÚC PROJECT

```
flashcard-app/
├── backend/                    # Python FastAPI
│   ├── app/
│   │   ├── main.py            # Entry point
│   │   ├── database.py        # DB connection
│   │   ├── models.py          # SQLAlchemy models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── crud.py            # Database operations
│   │   ├── routers/
│   │   │   ├── users.py       # User endpoints
│   │   │   ├── decks.py       # Deck endpoints
│   │   │   ├── flashcards.py  # Flashcard endpoints
│   │   │   ├── dictionary.py  # Dictionary search
│   │   │   └── tts.py         # Text-to-speech
│   │   ├── services/
│   │   │   ├── pronunciation.py   # Auto-generate pronunciation
│   │   │   ├── dictionary_service.py  # Dict APIs
│   │   │   └── tts_service.py     # TTS service
│   │   └── utils/
│   │       └── csv_parser.py  # CSV import helper
│   ├── data/
│   │   ├── cedict.txt         # Chinese dictionary
│   │   └── jmdict.json        # Japanese dictionary
│   ├── requirements.txt
│   ├── .env
│   └── README.md
│
└── frontend/                   # Next.js
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx       # Home/User selection
    │   │   ├── users/
    │   │   │   └── [userId]/
    │   │   │       ├── page.tsx      # User decks
    │   │   │       └── decks/
    │   │   │           └── [deckId]/
    │   │   │               ├── page.tsx    # Deck detail
    │   │   │               └── study/
    │   │   │                   └── page.tsx  # Study mode
    │   │   └── api/           # API routes (proxy)
    │   ├── components/
    │   │   ├── ui/            # shadcn/ui components
    │   │   ├── UserCard.tsx
    │   │   ├── DeckCard.tsx
    │   │   ├── FlashCard.tsx  # Flip card component
    │   │   ├── CSVImport.tsx
    │   │   ├── DictionarySearch.tsx
    │   │   └── LanguageSelector.tsx
    │   ├── lib/
    │   │   ├── api.ts         # API client
    │   │   └── utils.ts
    │   ├── store/
    │   │   └── useStore.ts    # Zustand store
    │   └── types/
    │       └── index.ts       # TypeScript types
    ├── public/
    ├── package.json
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── next.config.js
```

---

## 🐍 BACKEND - FASTAPI

### 1. `backend/requirements.txt`

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
pydantic==2.5.0
python-multipart==0.0.6
python-dotenv==1.0.0
gTTS==2.4.0
pypinyin==0.50.0
pykakasi==2.2.1
hangul-romanize==0.1.0
aiofiles==23.2.1
pandas==2.1.3
googletrans==3.1.0a0
```

### 2. `backend/.env`

```env
DATABASE_URL=sqlite:///./flashcard.db
BACKEND_PORT=8000
CORS_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
```

### 3. `backend/app/database.py`

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./flashcard.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 4. `backend/app/models.py`

```python
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    avatar = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    decks = relationship("Deck", back_populates="user", cascade="all, delete-orphan")

class Deck(Base):
    __tablename__ = "decks"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    language = Column(String(10), nullable=False)  # EN, ZH, KO, JA
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="decks")
    flashcards = relationship("Flashcard", back_populates="deck", cascade="all, delete-orphan")

class Flashcard(Base):
    __tablename__ = "flashcards"
    
    id = Column(Integer, primary_key=True, index=True)
    deck_id = Column(Integer, ForeignKey("decks.id", ondelete="CASCADE"))
    vietnamese = Column(Text, nullable=False)
    pronunciation = Column(String(500), nullable=True)  # pinyin, romaji, hangul
    target_language = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    deck = relationship("Deck", back_populates="flashcards")
```

### 5. `backend/app/schemas.py`

```python
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
```

### 6. `backend/app/crud.py`

```python
from sqlalchemy.orm import Session
from typing import List, Optional
from . import models, schemas

# User CRUD
def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user: schemas.UserUpdate):
    db_user = get_user(db, user_id)
    if db_user:
        for key, value in user.dict(exclude_unset=True).items():
            setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = get_user(db, user_id)
    if db_user:
        db.delete(db_user)
        db.commit()
        return True
    return False

# Deck CRUD
def get_decks_by_user(db: Session, user_id: int):
    decks = db.query(models.Deck).filter(models.Deck.user_id == user_id).all()
    for deck in decks:
        deck.flashcard_count = len(deck.flashcards)
    return decks

def get_deck(db: Session, deck_id: int):
    return db.query(models.Deck).filter(models.Deck.id == deck_id).first()

def create_deck(db: Session, deck: schemas.DeckCreate):
    db_deck = models.Deck(**deck.dict())
    db.add(db_deck)
    db.commit()
    db.refresh(db_deck)
    return db_deck

def update_deck(db: Session, deck_id: int, deck: schemas.DeckUpdate):
    db_deck = get_deck(db, deck_id)
    if db_deck:
        for key, value in deck.dict(exclude_unset=True).items():
            setattr(db_deck, key, value)
        db.commit()
        db.refresh(db_deck)
    return db_deck

def delete_deck(db: Session, deck_id: int):
    db_deck = get_deck(db, deck_id)
    if db_deck:
        db.delete(db_deck)
        db.commit()
        return True
    return False

# Flashcard CRUD
def get_flashcards_by_deck(db: Session, deck_id: int):
    return db.query(models.Flashcard).filter(models.Flashcard.deck_id == deck_id).all()

def get_flashcard(db: Session, flashcard_id: int):
    return db.query(models.Flashcard).filter(models.Flashcard.id == flashcard_id).first()

def create_flashcard(db: Session, flashcard: schemas.FlashcardCreate):
    db_flashcard = models.Flashcard(**flashcard.dict())
    db.add(db_flashcard)
    db.commit()
    db.refresh(db_flashcard)
    return db_flashcard

def create_flashcards_bulk(db: Session, flashcards: List[schemas.FlashcardCreate]):
    db_flashcards = [models.Flashcard(**fc.dict()) for fc in flashcards]
    db.add_all(db_flashcards)
    db.commit()
    return db_flashcards

def update_flashcard(db: Session, flashcard_id: int, flashcard: schemas.FlashcardUpdate):
    db_flashcard = get_flashcard(db, flashcard_id)
    if db_flashcard:
        for key, value in flashcard.dict(exclude_unset=True).items():
            setattr(db_flashcard, key, value)
        db.commit()
        db.refresh(db_flashcard)
    return db_flashcard

def delete_flashcard(db: Session, flashcard_id: int):
    db_flashcard = get_flashcard(db, flashcard_id)
    if db_flashcard:
        db.delete(db_flashcard)
        db.commit()
        return True
    return False
```

### 7. `backend/app/services/pronunciation.py`

```python
from pypinyin import pinyin, Style
import pykakasi
from hangul_romanize import Transliter
from hangul_romanize.rule import academic

def generate_pronunciation(text: str, language: str) -> str:
    """Auto-generate pronunciation based on language"""
    
    if language == "ZH":  # Chinese - Pinyin
        result = pinyin(text, style=Style.TONE)
        return ' '.join([item[0] for item in result])
    
    elif language == "JA":  # Japanese - Romaji
        kks = pykakasi.kakasi()
        result = kks.convert(text)
        return ' '.join([item['hepburn'] for item in result])
    
    elif language == "KO":  # Korean - Romanization
        transliter = Transliter(academic)
        return transliter.translit(text)
    
    elif language == "EN":  # English - no pronunciation needed
        return text
    
    return text
```

### 8. `backend/app/services/dictionary_service.py`

```python
from typing import List
from googletrans import Translator
from ..schemas import DictionaryResult
import asyncio
from functools import lru_cache

class DictionaryService:
    def __init__(self):
        self.translator = Translator()
        
        # Language mapping
        self.lang_map = {
            "EN": "en",
            "ZH": "zh-cn",
            "JA": "ja",
            "KO": "ko"
        }
    
    @lru_cache(maxsize=1000)
    def _translate_cached(self, query: str, target_lang: str) -> tuple:
        """Cache translations to avoid repeated API calls"""
        try:
            result = self.translator.translate(query, src='vi', dest=target_lang)
            return (result.text, result.pronunciation if result.pronunciation else result.text)
        except Exception as e:
            print(f"Translation error: {e}")
            return (None, None)
    
    def search_vietnamese(self, query: str, language: str, limit: int = 10) -> List[DictionaryResult]:
        """
        Search and translate Vietnamese to target language using Google Translate
        Returns multiple variations/suggestions
        """
        results = []
        target_lang = self.lang_map.get(language, "en")
        
        # Main translation
        translated, pronunciation = self._translate_cached(query, target_lang)
        
        if translated:
            results.append(DictionaryResult(
                vietnamese=query,
                pronunciation=pronunciation,
                target_language=translated,
                language=language
            ))
        
        # Generate variations by trying common phrases
        variations = self._generate_variations(query)
        
        for variation in variations[:limit-1]:  # Leave room for main result
            var_translated, var_pronunciation = self._translate_cached(variation, target_lang)
            if var_translated and var_translated != translated:
                results.append(DictionaryResult(
                    vietnamese=variation,
                    pronunciation=var_pronunciation,
                    target_language=var_translated,
                    language=language
                ))
        
        return results[:limit]
    
    def _generate_variations(self, query: str) -> List[str]:
        """Generate common variations of the query"""
        variations = []
        
        # Common greeting variations
        greetings = {
            "chào": ["xin chào", "chào bạn", "chào buổi sáng", "chào buổi tối"],
            "xin chào": ["chào", "chào bạn"],
        }
        
        # Common phrase patterns
        if query in greetings:
            variations.extend(greetings[query])
        
        # Add formal/informal variations
        if "bạn" in query:
            variations.append(query.replace("bạn", "anh"))
            variations.append(query.replace("bạn", "chị"))
        
        if "tôi" in query:
            variations.append(query.replace("tôi", "em"))
            variations.append(query.replace("tôi", "mình"))
        
        # Add verb variations
        verb_variations = {
            "ăn": ["ăn cơm", "ăn uống", "dùng bữa"],
            "uống": ["uống nước", "uống trà", "uống cà phê"],
            "học": ["học tập", "học習", "đi học"],
            "làm": ["làm việc", "làm bài", "hoạt động"],
        }
        
        for key, values in verb_variations.items():
            if key in query:
                variations.extend(values)
        
        return list(set(variations))  # Remove duplicates

dictionary_service = DictionaryService()
```

### 9. `backend/app/services/tts_service.py`

```python
from gtts import gTTS
import os
from pathlib import Path

class TTSService:
    def __init__(self):
        self.audio_dir = Path("audio_cache")
        self.audio_dir.mkdir(exist_ok=True)
    
    def text_to_speech(self, text: str, language: str) -> str:
        """Convert text to speech and return file path"""
        
        # Map languages to gTTS language codes
        lang_map = {
            "EN": "en",
            "ZH": "zh-CN",
            "JA": "ja",
            "KO": "ko"
        }
        
        lang_code = lang_map.get(language, "en")
        
        # Create filename based on text hash
        filename = f"{hash(text)}_{language}.mp3"
        filepath = self.audio_dir / filename
        
        # Check if file already exists
        if not filepath.exists():
            tts = gTTS(text=text, lang=lang_code, slow=False)
            tts.save(str(filepath))
        
        return str(filepath)

tts_service = TTSService()
```

### 10. `backend/app/routers/users.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_users(db, skip=skip, limit=limit)

@router.get("/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = crud.get_user(db, user_id=user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/", response_model=schemas.User, status_code=201)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db=db, user=user)

@router.put("/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user: schemas.UserUpdate, db: Session = Depends(get_db)):
    updated_user = crud.update_user(db, user_id=user_id, user=user)
    if updated_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    success = crud.delete_user(db, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}
```

### 11. `backend/app/routers/decks.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/decks", tags=["decks"])

@router.get("/user/{user_id}", response_model=List[schemas.Deck])
def read_user_decks(user_id: int, db: Session = Depends(get_db)):
    return crud.get_decks_by_user(db, user_id=user_id)

@router.get("/{deck_id}", response_model=schemas.Deck)
def read_deck(deck_id: int, db: Session = Depends(get_db)):
    deck = crud.get_deck(db, deck_id=deck_id)
    if deck is None:
        raise HTTPException(status_code=404, detail="Deck not found")
    deck.flashcard_count = len(deck.flashcards)
    return deck

@router.post("/", response_model=schemas.Deck, status_code=201)
def create_deck(deck: schemas.DeckCreate, db: Session = Depends(get_db)):
    return crud.create_deck(db=db, deck=deck)

@router.put("/{deck_id}", response_model=schemas.Deck)
def update_deck(deck_id: int, deck: schemas.DeckUpdate, db: Session = Depends(get_db)):
    updated_deck = crud.update_deck(db, deck_id=deck_id, deck=deck)
    if updated_deck is None:
        raise HTTPException(status_code=404, detail="Deck not found")
    return updated_deck

@router.delete("/{deck_id}")
def delete_deck(deck_id: int, db: Session = Depends(get_db)):
    success = crud.delete_deck(db, deck_id=deck_id)
    if not success:
        raise HTTPException(status_code=404, detail="Deck not found")
    return {"message": "Deck deleted successfully"}
```

### 12. `backend/app/routers/flashcards.py`

```python
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import csv
import io
from .. import crud, schemas
from ..database import get_db
from ..services.pronunciation import generate_pronunciation

router = APIRouter(prefix="/flashcards", tags=["flashcards"])

@router.get("/deck/{deck_id}", response_model=List[schemas.Flashcard])
def read_deck_flashcards(deck_id: int, db: Session = Depends(get_db)):
    return crud.get_flashcards_by_deck(db, deck_id=deck_id)

@router.get("/{flashcard_id}", response_model=schemas.Flashcard)
def read_flashcard(flashcard_id: int, db: Session = Depends(get_db)):
    flashcard = crud.get_flashcard(db, flashcard_id=flashcard_id)
    if flashcard is None:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    return flashcard

@router.post("/", response_model=schemas.Flashcard, status_code=201)
def create_flashcard(flashcard: schemas.FlashcardCreate, db: Session = Depends(get_db)):
    # Auto-generate pronunciation if not provided
    if not flashcard.pronunciation:
        deck = crud.get_deck(db, flashcard.deck_id)
        flashcard.pronunciation = generate_pronunciation(
            flashcard.target_language, 
            deck.language
        )
    return crud.create_flashcard(db=db, flashcard=flashcard)

@router.post("/bulk", status_code=201)
def create_flashcards_bulk(request: schemas.BulkImportRequest, db: Session = Depends(get_db)):
    """Bulk import flashcards from CSV"""
    deck = crud.get_deck(db, request.deck_id)
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    
    flashcards_to_create = []
    for fc in request.flashcards:
        # Auto-generate pronunciation if empty
        pronunciation = fc.pronunciation or generate_pronunciation(
            fc.target_language, 
            deck.language
        )
        flashcards_to_create.append(
            schemas.FlashcardCreate(
                deck_id=request.deck_id,
                vietnamese=fc.vietnamese,
                pronunciation=pronunciation,
                target_language=fc.target_language
            )
        )
    
    created = crud.create_flashcards_bulk(db, flashcards_to_create)
    return {"message": f"Created {len(created)} flashcards", "count": len(created)}

@router.post("/upload-csv/{deck_id}")
async def upload_csv(deck_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload CSV file and import flashcards"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be CSV")
    
    deck = crud.get_deck(db, deck_id)
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    
    contents = await file.read()
    csv_data = io.StringIO(contents.decode('utf-8'))
    csv_reader = csv.DictReader(csv_data)
    
    flashcards = []
    for row in csv_reader:
        pronunciation = row.get('pronunciation', '') or generate_pronunciation(
            row['target_language'],
            deck.language
        )
        flashcards.append(
            schemas.FlashcardCreate(
                deck_id=deck_id,
                vietnamese=row['vietnamese'],
                pronunciation=pronunciation,
                target_language=row['target_language']
            )
        )
    
    created = crud.create_flashcards_bulk(db, flashcards)
    return {"message": f"Imported {len(created)} flashcards", "count": len(created)}

@router.put("/{flashcard_id}", response_model=schemas.Flashcard)
def update_flashcard(flashcard_id: int, flashcard: schemas.FlashcardUpdate, db: Session = Depends(get_db)):
    updated = crud.update_flashcard(db, flashcard_id=flashcard_id, flashcard=flashcard)
    if updated is None:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    return updated

@router.delete("/{flashcard_id}")
def delete_flashcard(flashcard_id: int, db: Session = Depends(get_db)):
    success = crud.delete_flashcard(db, flashcard_id=flashcard_id)
    if not success:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    return {"message": "Flashcard deleted successfully"}
```

### 13. `backend/app/routers/dictionary.py`

```python
from fastapi import APIRouter, Query
from typing import List
from ..schemas import DictionaryResult
from ..services.dictionary_service import dictionary_service

router = APIRouter(prefix="/dictionary", tags=["dictionary"])

@router.get("/search", response_model=List[DictionaryResult])
def search_dictionary(
    query: str = Query(..., min_length=1),
    language: str = Query(..., regex="^(EN|ZH|KO|JA)$"),
    limit: int = Query(10, ge=1, le=50)
):
    """Search dictionary by Vietnamese keyword"""
    return dictionary_service.search_vietnamese(query, language, limit)
```

### 14. `backend/app/routers/tts.py`

```python
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import FileResponse
from ..services.tts_service import tts_service

router = APIRouter(prefix="/tts", tags=["tts"])

@router.get("/speak")
def text_to_speech(
    text: str = Query(..., min_length=1),
    language: str = Query(..., regex="^(EN|ZH|KO|JA)$")
):
    """Convert text to speech"""
    try:
        audio_path = tts_service.text_to_speech(text, language)
        return FileResponse(audio_path, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### 15. `backend/app/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv

from .database import engine, Base
from .routers import users, decks, flashcards, dictionary, tts

load_dotenv()

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Multilingual Flashcard API",
    description="API for learning multiple languages with flashcards",
    version="1.0.0"
)

# CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount audio files
app.mount("/audio", StaticFiles(directory="audio_cache"), name="audio")

# Routers
app.include_router(users.router, prefix="/api")
app.include_router(decks.router, prefix="/api")
app.include_router(flashcards.router, prefix="/api")
app.include_router(dictionary.router, prefix="/api")
app.include_router(tts.router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "Multilingual Flashcard API",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

---

## ⚛️ FRONTEND - NEXT.JS

### 1. `frontend/package.json`

```json
{
  "name": "flashcard-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.4",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "typescript": "5.3.3",
    "@types/node": "20.10.5",
    "@types/react": "18.2.45",
    "@types/react-dom": "18.2.18",
    "axios": "1.6.2",
    "@tanstack/react-query": "5.14.2",
    "zustand": "4.4.7",
    "framer-motion": "10.16.16",
    "tailwindcss": "3.3.6",
    "autoprefixer": "10.4.16",
    "postcss": "8.4.32",
    "class-variance-authority": "0.7.0",
    "clsx": "2.0.0",
    "tailwind-merge": "2.2.0",
    "lucide-react": "0.303.0",
    "papaparse": "5.4.1",
    "@types/papaparse": "5.3.14",
    "react-hot-toast": "2.4.1"
  }
}
```

### 2. `frontend/tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
    },
  },
  plugins: [],
}
export default config
```

### 3. `frontend/src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --border: 214.3 31.8% 91.4%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
}

body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}
```

### 4. `frontend/src/lib/api.ts`

```typescript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface User {
  id: number;
  name: string;
  avatar?: string;
  created_at: string;
}

export interface Deck {
  id: number;
  name: string;
  language: 'EN' | 'ZH' | 'KO' | 'JA';
  user_id: number;
  flashcard_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Flashcard {
  id: number;
  deck_id: number;
  vietnamese: string;
  pronunciation: string;
  target_language: string;
  created_at: string;
}

export interface DictionaryResult {
  vietnamese: string;
  pronunciation: string;
  target_language: string;
  language: string;
}

// User API
export const userApi = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: number) => api.get<User>(`/users/${id}`),
  create: (data: { name: string; avatar?: string }) => 
    api.post<User>('/users', data),
  update: (id: number, data: { name: string; avatar?: string }) => 
    api.put<User>(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};

// Deck API
export const deckApi = {
  getByUser: (userId: number) => api.get<Deck[]>(`/decks/user/${userId}`),
  getById: (id: number) => api.get<Deck>(`/decks/${id}`),
  create: (data: { name: string; language: string; user_id: number }) => 
    api.post<Deck>('/decks', data),
  update: (id: number, data: { name: string }) => 
    api.put<Deck>(`/decks/${id}`, data),
  delete: (id: number) => api.delete(`/decks/${id}`),
};

// Flashcard API
export const flashcardApi = {
  getByDeck: (deckId: number) => 
    api.get<Flashcard[]>(`/flashcards/deck/${deckId}`),
  getById: (id: number) => api.get<Flashcard>(`/flashcards/${id}`),
  create: (data: {
    deck_id: number;
    vietnamese: string;
    pronunciation?: string;
    target_language: string;
  }) => api.post<Flashcard>('/flashcards', data),
  bulkCreate: (data: {
    deck_id: number;
    flashcards: Array<{
      vietnamese: string;
      pronunciation: string;
      target_language: string;
    }>;
  }) => api.post('/flashcards/bulk', data),
  uploadCSV: (deckId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/flashcards/upload-csv/${deckId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id: number, data: {
    vietnamese: string;
    pronunciation: string;
    target_language: string;
  }) => api.put<Flashcard>(`/flashcards/${id}`, data),
  delete: (id: number) => api.delete(`/flashcards/${id}`),
};

// Dictionary API
export const dictionaryApi = {
  search: (query: string, language: string, limit: number = 10) =>
    api.get<DictionaryResult[]>('/dictionary/search', {
      params: { query, language, limit },
    }),
};

// TTS API
export const ttsApi = {
  speak: (text: string, language: string) =>
    `${API_URL}/tts/speak?text=${encodeURIComponent(text)}&language=${language}`,
};
```

### 5. `frontend/src/store/useStore.ts`

```typescript
import { create } from 'zustand';
import { User, Deck } from '@/lib/api';

interface AppState {
  currentUser: User | null;
  currentDeck: Deck | null;
  setCurrentUser: (user: User | null) => void;
  setCurrentDeck: (deck: Deck | null) => void;
}

export const useStore = create<AppState>((set) => ({
  currentUser: null,
  currentDeck: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  setCurrentDeck: (deck) => set({ currentDeck: deck }),
}));
```

### 6. `frontend/src/components/ui/Button.tsx`

```typescript
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-border bg-transparent hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        danger: 'bg-red-500 text-white hover:bg-red-600',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
```

### 7. `frontend/src/components/FlashCard.tsx`

```typescript
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { Flashcard } from '@/lib/api';
import { Button } from './ui/Button';

interface FlashCardProps {
  flashcard: Flashcard;
  language: string;
}

export function FlashCard({ flashcard, language }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const playAudio = (text: string) => {
    const audio = new Audio(
      `${process.env.NEXT_PUBLIC_API_URL}/tts/speak?text=${encodeURIComponent(
        text
      )}&language=${language}`
    );
    audio.play();
  };

  return (
    <div className="perspective-1000 w-full max-w-2xl mx-auto">
      <motion.div
        className="relative w-full h-96 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front Side */}
        <div
          className={`absolute inset-0 backface-hidden rounded-xl shadow-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-8 flex flex-col items-center justify-center ${
            isFlipped ? 'invisible' : 'visible'
          }`}
        >
          <p className="text-sm text-white/70 mb-2">Tiếng Việt</p>
          <h2 className="text-4xl font-bold text-white text-center mb-6">
            {flashcard.vietnamese}
          </h2>
          <p className="text-white/60 text-sm">Click để lật thẻ</p>
        </div>

        {/* Back Side */}
        <div
          className={`absolute inset-0 backface-hidden rounded-xl shadow-2xl bg-gradient-to-br from-green-500 to-teal-600 p-8 flex flex-col items-center justify-center ${
            isFlipped ? 'visible' : 'invisible'
          }`}
          style={{ transform: 'rotateY(180deg)' }}
        >
          <p className="text-sm text-white/70 mb-2">
            {language === 'ZH' && 'Tiếng Trung'}
            {language === 'JA' && 'Tiếng Nhật'}
            {language === 'KO' && 'Tiếng Hàn'}
            {language === 'EN' && 'Tiếng Anh'}
          </p>
          <h2 className="text-5xl font-bold text-white text-center mb-4">
            {flashcard.target_language}
          </h2>
          <p className="text-2xl text-white/80 mb-6">
            {flashcard.pronunciation}
          </p>
          <Button
            variant="secondary"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              playAudio(flashcard.target_language);
            }}
            className="rounded-full"
          >
            <Volume2 className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
```

### 8. `frontend/src/components/CSVImport.tsx`

```typescript
'use client';

import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from './ui/Button';
import { flashcardApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface CSVImportProps {
  deckId: number;
  onSuccess: () => void;
}

export function CSVImport({ deckId, onSuccess }: CSVImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await flashcardApi.uploadCSV(deckId, file);
      toast.success('Import CSV thành công!');
      onSuccess();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('Import CSV thất bại!');
      console.error(error);
    }
  };

  return (
    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-lg font-semibold mb-2">Import từ file CSV</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Format: vietnamese,pronunciation,target_language
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden"
        id="csv-upload"
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        variant="outline"
      >
        Chọn file CSV
      </Button>
    </div>
  );
}
```

### 9. `frontend/src/components/DictionarySearch.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { dictionaryApi, DictionaryResult, flashcardApi } from '@/lib/api';
import { Button } from './ui/Button';
import toast from 'react-hot-toast';

interface DictionarySearchProps {
  deckId: number;
  language: string;
  onSuccess: () => void;
}

export function DictionarySearch({
  deckId,
  language,
  onSuccess,
}: DictionarySearchProps) {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: results, isLoading } = useQuery({
    queryKey: ['dictionary', searchTerm, language],
    queryFn: () => dictionaryApi.search(searchTerm, language).then((res) => res.data),
    enabled: searchTerm.length > 0,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(query);
  };

  const handleAddFlashcard = async (result: DictionaryResult) => {
    try {
      await flashcardApi.create({
        deck_id: deckId,
        vietnamese: result.vietnamese,
        pronunciation: result.pronunciation,
        target_language: result.target_language,
      });
      toast.success('Đã thêm flashcard!');
      onSuccess();
    } catch (error) {
      toast.error('Thêm flashcard thất bại!');
      console.error(error);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm từ bằng tiếng Việt..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <Button type="submit" disabled={!query}>
          Tìm kiếm
        </Button>
      </form>

      {isLoading && (
        <p className="text-center text-muted-foreground">Đang tìm kiếm...</p>
      )}

      {results && results.length > 0 && (
        <div className="border border-border rounded-lg divide-y">
          {results.map((result, index) => (
            <div
              key={index}
              className="p-4 flex items-center justify-between hover:bg-accent transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium">{result.vietnamese}</p>
                <p className="text-2xl mt-1">{result.target_language}</p>
                <p className="text-sm text-muted-foreground">
                  {result.pronunciation}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => handleAddFlashcard(result)}
                className="ml-4"
              >
                <Plus className="w-4 h-4 mr-1" />
                Thêm
              </Button>
            </div>
          ))}
        </div>
      )}

      {results && results.length === 0 && (
        <p className="text-center text-muted-foreground">
          Không tìm thấy kết quả
        </p>
      )}
    </div>
  );
}
```

### 10. `frontend/src/app/layout.tsx`

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: 'Multilingual Flashcard App',
  description: 'Learn Chinese, Japanese, Korean, and English with flashcards',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 11. `frontend/src/app/providers.tsx`

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
```

### 12. `frontend/src/app/page.tsx`

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { userApi, User } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Plus, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Home() {
  const router = useRouter();
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: () => userApi.getAll().then((res) => res.data),
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    try {
      await userApi.create({ name: newUserName });
      toast.success('Tạo user thành công!');
      setNewUserName('');
      setShowCreateUser(false);
      refetch();
    } catch (error) {
      toast.error('Tạo user thất bại!');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa user này?')) return;

    try {
      await userApi.delete(id);
      toast.success('Xóa user thành công!');
      refetch();
    } catch (error) {
      toast.error('Xóa user thất bại!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            🎴 Multilingual Flashcard
          </h1>
          <p className="text-lg text-gray-600">
            Học đi mấy con đĩ
          </p>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Chọn User Profile</h2>
          <Button onClick={() => setShowCreateUser(!showCreateUser)}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm User
          </Button>
        </div>

        {showCreateUser && (
          <form
            onSubmit={handleCreateUser}
            className="mb-6 bg-white p-6 rounded-lg shadow-md"
          >
            <div className="flex gap-4">
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Tên user mới..."
                className="flex-1 px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button type="submit">Tạo</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateUser(false)}
              >
                Hủy
              </Button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users?.map((user: User) => (
            <div
              key={user.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer group"
            >
              <div
                onClick={() => router.push(`/users/${user.id}`)}
                className="flex-1"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">
                  {user.name}
                </h3>
                <p className="text-sm text-gray-500 text-center">
                  Tham gia: {new Date(user.created_at).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => router.push(`/users/${user.id}`)}
                >
                  Xem decks
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  Xóa
                </Button>
              </div>
            </div>
          ))}
        </div>

        {users?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Chưa có user nào</p>
            <Button onClick={() => setShowCreateUser(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo user đầu tiên
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
```

### 13. `frontend/src/app/users/[userId]/page.tsx`

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { userApi, deckApi, Deck } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Plus, BookOpen, ArrowLeft, Trash2, Edit } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

const LANGUAGES = [
  { code: 'EN', name: 'Tiếng Anh', flag: '🇬🇧', color: 'from-blue-500 to-cyan-500' },
  { code: 'ZH', name: 'Tiếng Trung', flag: '🇨🇳', color: 'from-red-500 to-orange-500' },
  { code: 'JA', name: 'Tiếng Nhật', flag: '🇯🇵', color: 'from-pink-500 to-rose-500' },
  { code: 'KO', name: 'Tiếng Hàn', flag: '🇰🇷', color: 'from-purple-500 to-indigo-500' },
];

export default function UserDecksPage() {
  const router = useRouter();
  const params = useParams();
  const userId = parseInt(params.userId as string);

  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [deckName, setDeckName] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('EN');

  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userApi.getById(userId).then((res) => res.data),
  });

  const { data: decks, isLoading, refetch } = useQuery({
    queryKey: ['decks', userId],
    queryFn: () => deckApi.getByUser(userId).then((res) => res.data),
  });

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckName.trim()) return;

    try {
      await deckApi.create({
        name: deckName,
        language: selectedLanguage,
        user_id: userId,
      });
      toast.success('Tạo deck thành công!');
      setDeckName('');
      setShowCreateDeck(false);
      refetch();
    } catch (error) {
      toast.error('Tạo deck thất bại!');
    }
  };

  const handleDeleteDeck = async (deckId: number) => {
    if (!confirm('Bạn có chắc muốn xóa deck này?')) return;

    try {
      await deckApi.delete(deckId);
      toast.success('Xóa deck thành công!');
      refetch();
    } catch (error) {
      toast.error('Xóa deck thất bại!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-2xl text-white font-bold">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">{user?.name}</h1>
              <p className="text-gray-500">{decks?.length || 0} bộ flashcard</p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Bộ Flashcard</h2>
          <Button onClick={() => setShowCreateDeck(!showCreateDeck)}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo Deck Mới
          </Button>
        </div>

        {showCreateDeck && (
          <form
            onSubmit={handleCreateDeck}
            className="mb-6 bg-white p-6 rounded-lg shadow-md"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tên bộ flashcard
                </label>
                <input
                  type="text"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  placeholder="Ví dụ: Từ vựng HSK 1"
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Chọn ngôn ngữ
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {LANGUAGES.map((lang) => (
                    <div
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang.code)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedLanguage === lang.code
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-2 text-center">{lang.flag}</div>
                      <div className="text-center text-sm font-medium">
                        {lang.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Tạo Deck
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateDeck(false)}
                >
                  Hủy
                </Button>
              </div>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks?.map((deck: Deck) => {
            const language = LANGUAGES.find((l) => l.code === deck.language);
            return (
              <div
                key={deck.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div
                  className={`h-32 bg-gradient-to-br ${language?.color} p-6 flex items-center justify-center cursor-pointer`}
                  onClick={() => router.push(`/users/${userId}/decks/${deck.id}`)}
                >
                  <div className="text-center">
                    <div className="text-5xl mb-2">{language?.flag}</div>
                    <div className="text-white font-semibold">
                      {language?.name}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 line-clamp-1">
                    {deck.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {deck.flashcard_count || 0} thẻ
                  </p>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/users/${userId}/decks/${deck.id}`)}
                    >
                      <BookOpen className="w-4 h-4 mr-1" />
                      Xem
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/users/${userId}/decks/${deck.id}/study`)}
                    >
                      Học
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteDeck(deck.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {decks?.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">Chưa có deck nào</p>
            <Button onClick={() => setShowCreateDeck(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo deck đầu tiên
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
```

### 14. `frontend/src/app/users/[userId]/decks/[deckId]/page.tsx`

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { deckApi, flashcardApi, Flashcard } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Plus, Trash2, Edit, Play, Upload, Search } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { CSVImport } from '@/components/CSVImport';
import { DictionarySearch } from '@/components/DictionarySearch';

export default function DeckDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = parseInt(params.userId as string);
  const deckId = parseInt(params.deckId as string);

  const [showAddCard, setShowAddCard] = useState(false);
  const [showImportCSV, setShowImportCSV] = useState(false);
  const [showDictionarySearch, setShowDictionarySearch] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

  const [vietnamese, setVietnamese] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');

  const { data: deck } = useQuery({
    queryKey: ['deck', deckId],
    queryFn: () => deckApi.getById(deckId).then((res) => res.data),
  });

  const { data: flashcards, refetch } = useQuery({
    queryKey: ['flashcards', deckId],
    queryFn: () => flashcardApi.getByDeck(deckId).then((res) => res.data),
  });

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vietnamese.trim() || !targetLanguage.trim()) return;

    try {
      if (editingCard) {
        await flashcardApi.update(editingCard.id, {
          vietnamese,
          pronunciation,
          target_language: targetLanguage,
        });
        toast.success('Cập nhật flashcard thành công!');
        setEditingCard(null);
      } else {
        await flashcardApi.create({
          deck_id: deckId,
          vietnamese,
          pronunciation,
          target_language: targetLanguage,
        });
        toast.success('Tạo flashcard thành công!');
      }
      
      setVietnamese('');
      setPronunciation('');
      setTargetLanguage('');
      setShowAddCard(false);
      refetch();
    } catch (error) {
      toast.error('Thao tác thất bại!');
    }
  };

  const handleEditCard = (card: Flashcard) => {
    setEditingCard(card);
    setVietnamese(card.vietnamese);
    setPronunciation(card.pronunciation);
    setTargetLanguage(card.target_language);
    setShowAddCard(true);
  };

  const handleDeleteCard = async (cardId: number) => {
    if (!confirm('Bạn có chắc muốn xóa thẻ này?')) return;

    try {
      await flashcardApi.delete(cardId);
      toast.success('Xóa flashcard thành công!');
      refetch();
    } catch (error) {
      toast.error('Xóa flashcard thất bại!');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push(`/users/${userId}`)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{deck?.name}</h1>
              <p className="text-gray-500">
                {flashcards?.length || 0} thẻ • {deck?.language}
              </p>
            </div>
            <Button
              onClick={() => router.push(`/users/${userId}/decks/${deckId}/study`)}
              size="lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Bắt đầu học
            </Button>
          </div>
        </div>

        <div className="mb-6 flex gap-4 flex-wrap">
          <Button
            variant={showAddCard ? 'secondary' : 'default'}
            onClick={() => {
              setShowAddCard(!showAddCard);
              setShowImportCSV(false);
              setShowDictionarySearch(false);
              setEditingCard(null);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm thẻ thủ công
          </Button>
          <Button
            variant={showImportCSV ? 'secondary' : 'outline'}
            onClick={() => {
              setShowImportCSV(!showImportCSV);
              setShowAddCard(false);
              setShowDictionarySearch(false);
            }}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button
            variant={showDictionarySearch ? 'secondary' : 'outline'}
            onClick={() => {
              setShowDictionarySearch(!showDictionarySearch);
              setShowAddCard(false);
              setShowImportCSV(false);
            }}
          >
            <Search className="w-4 h-4 mr-2" />
            Tìm từ điển
          </Button>
        </div>

        {showAddCard && (
          <form
            onSubmit={handleCreateCard}
            className="mb-6 bg-white p-6 rounded-lg shadow-md"
          >
            <h3 className="text-lg font-semibold mb-4">
              {editingCard ? 'Sửa flashcard' : 'Thêm flashcard mới'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tiếng Việt
                </label>
                <input
                  type="text"
                  value={vietnamese}
                  onChange={(e) => setVietnamese(e.target.value)}
                  placeholder="Ví dụ: xin chào"
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Phiên âm (tùy chọn - tự động sinh nếu để trống)
                </label>
                <input
                  type="text"
                  value={pronunciation}
                  onChange={(e) => setPronunciation(e.target.value)}
                  placeholder="Ví dụ: nǐ hǎo"
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Ngôn ngữ đích
                </label>
                <input
                  type="text"
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  placeholder="Ví dụ: 你好"
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  {editingCard ? 'Cập nhật' : 'Thêm thẻ'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddCard(false);
                    setEditingCard(null);
                    setVietnamese('');
                    setPronunciation('');
                    setTargetLanguage('');
                  }}
                >
                  Hủy
                </Button>
              </div>
            </div>
          </form>
        )}

        {showImportCSV && (
          <div className="mb-6">
            <CSVImport deckId={deckId} onSuccess={refetch} />
          </div>
        )}

        {showDictionarySearch && deck && (
          <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Tìm từ trong từ điển</h3>
            <DictionarySearch
              deckId={deckId}
              language={deck.language}
              onSuccess={refetch}
            />
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiếng Việt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngôn ngữ đích
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phiên âm
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {flashcards?.map((card: Flashcard) => (
                  <tr key={card.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {card.vietnamese}
                    </td>
                    <td className="px-6 py-4 text-2xl">
                      {card.target_language}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {card.pronunciation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCard(card)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteCard(card.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {flashcards?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Chưa có flashcard nào</p>
              <Button onClick={() => setShowAddCard(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm flashcard đầu tiên
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
```

### 15. `frontend/src/app/users/[userId]/decks/[deckId]/study/page.tsx`

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { deckApi, flashcardApi, Flashcard } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FlashCard } from '@/components/FlashCard';

export default function StudyModePage() {
  const router = useRouter();
  const params = useParams();
  const userId = parseInt(params.userId as string);
  const deckId = parseInt(params.deckId as string);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);

  const { data: deck } = useQuery({
    queryKey: ['deck', deckId],
    queryFn: () => deckApi.getById(deckId).then((res) => res.data),
  });

  const { data: flashcards } = useQuery({
    queryKey: ['flashcards', deckId],
    queryFn: () => flashcardApi.getByDeck(deckId).then((res) => res.data),
  });

  useEffect(() => {
    if (flashcards && flashcards.length > 0) {
      setShuffledCards(flashcards);
    }
  }, [flashcards]);

  const handleShuffle = () => {
    if (!flashcards) return;
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentIndex(0);
    setIsShuffled(true);
  };

  const handleReset = () => {
    if (!flashcards) return;
    setShuffledCards(flashcards);
    setCurrentIndex(0);
    setIsShuffled(false);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(shuffledCards.length - 1, prev + 1));
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [shuffledCards.length]);

  if (!flashcards || flashcards.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.push(`/users/${userId}/decks/${deckId}`)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>

          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Deck trống</h2>
            <p className="text-gray-500 mb-6">
              Hãy thêm flashcard trước khi bắt đầu học
            </p>
            <Button onClick={() => router.push(`/users/${userId}/decks/${deckId}`)}>
              Thêm flashcard
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const currentCard = shuffledCards[currentIndex];
  const progress = ((currentIndex + 1) / shuffledCards.length) * 100;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/users/${userId}/decks/${deckId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShuffle}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Xáo trộn
            </Button>
            {isShuffled && (
              <Button variant="outline" onClick={handleReset}>
                Khôi phục
              </Button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">{deck?.name}</h1>
            <span className="text-lg font-semibold">
              {currentIndex + 1} / {shuffledCards.length}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mb-8">
          {currentCard && deck && (
            <FlashCard flashcard={currentCard} language={deck.language} />
          )}
        </div>

        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Trước
          </Button>

          <div className="text-sm text-gray-500">
            Sử dụng phím ← → để điều hướng
          </div>

          <Button
            variant="outline"
            size="lg"
            onClick={handleNext}
            disabled={currentIndex === shuffledCards.length - 1}
          >
            Tiếp
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {currentIndex === shuffledCards.length - 1 && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <h3 className="text-xl font-bold text-green-800 mb-2">
              🎉 Hoàn thành!
            </h3>
            <p className="text-green-600 mb-4">
              Bạn đã xem hết {shuffledCards.length} thẻ
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Học lại
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/users/${userId}/decks/${deckId}`)}
              >
                Quay về deck
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
```

### 16. `frontend/src/lib/utils.ts`

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 📊 DATABASE SCHEMA

```sql
-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Decks table
CREATE TABLE decks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    language VARCHAR(10) NOT NULL CHECK(language IN ('EN', 'ZH', 'KO', 'JA')),
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Flashcards table
CREATE TABLE flashcards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deck_id INTEGER NOT NULL,
    vietnamese TEXT NOT NULL,
    pronunciation VARCHAR(500),
    target_language TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_decks_user_id ON decks(user_id);
CREATE INDEX idx_flashcards_deck_id ON flashcards(deck_id);
```

---

## 🚀 HƯỚNG DẪN SETUP LOCAL

### Backend Setup

```bash
# 1. Clone hoặc tạo folder project
cd flashcard-app/backend

# 2. Tạo virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Tạo file .env
echo "DATABASE_URL=sqlite:///./flashcard.db" > .env
echo "BACKEND_PORT=8000" >> .env
echo "CORS_ORIGINS=http://localhost:3000" >> .env

# 5. Run server
uvicorn app.main:app --reload --port 8000
```

Backend sẽ chạy tại: **http://localhost:8000**
API Docs: **http://localhost:8000/docs**

### Frontend Setup

```bash
# 1. Navigate to frontend
cd flashcard-app/frontend

# 2. Install dependencies
npm install

# 3. Tạo file .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local

# 4. Run development server
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:3000**

---

## ☁️ DEPLOYMENT FREE

### 🔧 Option 1: Railway.app (Recommended)

**Backend Deploy:**

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Navigate to backend folder
cd backend

# 4. Initialize project
railway init

# 5. Add environment variables
railway variables set DATABASE_URL=sqlite:///./data/flashcard.db
railway variables set CORS_ORIGINS=https://your-frontend.vercel.app

# 6. Deploy
railway up
```

**Railway Configuration (`railway.json`):**

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Frontend Deploy (Vercel):**

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Navigate to frontend
cd frontend

# 3. Deploy
vercel

# 4. Set environment variable
vercel env add NEXT_PUBLIC_API_URL production
# Nhập: https://your-backend.railway.app/api

# 5. Deploy production
vercel --prod
```

---

### 🔧 Option 2: Render.com

**Backend Deploy:**

1. Push code lên GitHub
2. Vào Render.com → New → Web Service
3. Connect GitHub repo
4. Settings:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables:**
     ```
     DATABASE_URL=sqlite:///./data/flashcard.db
     CORS_ORIGINS=https://your-frontend.vercel.app
     ```

**Frontend:** Deploy trên Vercel như option 1

---

### 🔧 Option 3: Fly.io (Alternative)

**Backend Deploy:**

```bash
# 1. Install flyctl
curl -L https://fly.io/install.sh | sh

# 2. Login
flyctl auth login

# 3. Navigate to backend
cd backend

# 4. Launch app
flyctl launch

# 5. Deploy
flyctl deploy
```

**`fly.toml` configuration:**

```toml
app = "flashcard-api"

[build]
  builder = "paketobuildpacks/builder:base"

[env]
  PORT = "8000"

[[services]]
  http_checks = []
  internal_port = 8000
  protocol = "tcp"

  [[services.ports]]
    force_https = true
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443
```

---

## 📚 API DOCUMENTATION

### Users Endpoints

```
GET    /api/users           - Lấy tất cả users
GET    /api/users/{id}      - Lấy user theo ID
POST   /api/users           - Tạo user mới
PUT    /api/users/{id}      - Cập nhật user
DELETE /api/users/{id}      - Xóa user
```

### Decks Endpoints

```
GET    /api/decks/user/{user_id}  - Lấy decks của user
GET    /api/decks/{id}            - Lấy deck theo ID
POST   /api/decks                 - Tạo deck mới
PUT    /api/decks/{id}            - Cập nhật deck
DELETE /api/decks/{id}            - Xóa deck
```

### Flashcards Endpoints

```
GET    /api/flashcards/deck/{deck_id}  - Lấy flashcards của deck
GET    /api/flashcards/{id}            - Lấy flashcard theo ID
POST   /api/flashcards                 - Tạo flashcard mới
POST   /api/flashcards/bulk            - Tạo nhiều flashcards
POST   /api/flashcards/upload-csv/{deck_id}  - Upload CSV
PUT    /api/flashcards/{id}            - Cập nhật flashcard
DELETE /api/flashcards/{id}            - Xóa flashcard
```

### Dictionary Endpoints

```
GET    /api/dictionary/search?query={query}&language={lang}&limit={limit}
```

### TTS Endpoints

```
GET    /api/tts/speak?text={text}&language={lang}
```

---

## 🎨 FEATURES HIGHLIGHTS

### ✅ Đã implement:

1. ✅ Quản lý Users (CRUD)
2. ✅ Quản lý Decks (CRUD)
3. ✅ Quản lý Flashcards (CRUD)
4. ✅ CSV Import
5. ✅ Dictionary Search
6. ✅ Auto-generate pronunciation
7. ✅ Text-to-Speech
8. ✅ Flip card animation
9. ✅ Professional UI với Tailwind + shadcn/ui
10. ✅ TypeScript support
11. ✅ API documentation

### 🚀 Có thể mở rộng thêm:

- Study mode với spaced repetition
- Progress tracking
- Statistics & analytics
- Dark mode
- Mobile responsive optimization
- PWA support
- Offline mode

---

## 📚 DICTIONARY INTEGRATION - GOOGLE TRANSLATE API

### ✅ Đã Implement: Google Translate API (FREE & UNLIMITED)

Dictionary service hiện tại sử dụng **Google Translate API** để tự động dịch **BẤT KỲ từ tiếng Việt nào** sang 4 ngôn ngữ:

#### Features:
- ✅ **Unlimited vocabulary** - dịch bất kỳ từ nào
- ✅ **Auto pronunciation** - tự động sinh phiên âm
- ✅ **Caching** - cache 1000 translations gần nhất để tăng tốc
- ✅ **Smart variations** - suggest các biến thể của từ
- ✅ **100% FREE** - không cần API key

#### How it works:

```python
# User search: "mèo" (tiếng Việt)
↓
Google Translate API
↓
Results:
- Chinese: 猫 (māo)
- Japanese: 猫 (neko)
- Korean: 고양이 (goyangi)
- English: cat
```

#### Variations Generator:

Service tự động suggest các biến thể phổ biến:

```python
Search "chào" → Returns:
1. chào (main translation)
2. xin chào
3. chào bạn
4. chào buổi sáng
5. chào buổi tối
```

### 🔧 Advanced: Combine với Local Dictionary

Nếu muốn kết hợp cả local dictionary (fast) và Google Translate (unlimited):

```python
class HybridDictionaryService:
    def search_vietnamese(self, query: str, language: str, limit: int = 10):
        results = []
        
        # 1. Try local dictionary first (instant)
        local_results = self._search_local_dict(query, language)
        results.extend(local_results)
        
        # 2. If not enough results, use Google Translate
        if len(results) < limit:
            online_results = self._search_google_translate(query, language)
            results.extend(online_results)
        
        return results[:limit]
```

### 📊 API Usage & Limits

**Google Translate (googletrans library):**
- ✅ **FREE** - no API key needed
- ✅ No daily/monthly limits
- ✅ Uses unofficial Google Translate API
- ⚠️ Rate limit: ~100-200 requests/minute (enough cho 10 users)
- ⚠️ Cần internet connection

**Caching Strategy:**
```python
@lru_cache(maxsize=1000)  # Cache 1000 recent translations
```
- Mỗi translation chỉ call API 1 lần
- Lần sau dùng lại sẽ instant từ cache
- Cache tự động expire khi restart server

### 🚀 Alternative: Deep Translator (More Stable)

Nếu `googletrans` bị lỗi, có thể dùng `deep-translator`:

```bash
pip install deep-translator
```

```python
from deep_translator import GoogleTranslator

class DictionaryService:
    def _translate(self, query: str, target_lang: str):
        translator = GoogleTranslator(source='vi', target=target_lang)
        return translator.translate(query)
```

**Advantages:**
- ✅ More stable than googletrans
- ✅ Better error handling
- ✅ Still FREE

---

## 📝 CSV FORMAT EXAMPLE

```csv
vietnamese,pronunciation,target_language
xin chào,nǐ hǎo,你好
cảm ơn,xiè xiè,谢谢
tạm biệt,zài jiàn,再见
bạn khỏe không,nǐ hǎo ma,你好吗
```

---

## 🎯 QUICK START CHECKLIST

- [ ] Clone/tạo project structure
- [ ] Setup Backend (Python + FastAPI)
- [ ] Setup Frontend (Next.js)
- [ ] Test local (Backend: 8000, Frontend: 3000)
- [ ] Deploy Backend (Railway/Render)
- [ ] Deploy Frontend (Vercel)
- [ ] Update CORS origins
- [ ] Test production

---

## 💡 TIPS & TRICKS

### Performance:
- SQLite đủ cho 10 users
- Cache TTS audio files
- Lazy load flashcards

### Security:
- Validate CSV input
- Rate limit API calls
- Sanitize user inputs

### UX:
- Keyboard shortcuts (Space to flip)
- Swipe gestures on mobile
- Progress indicators

---

## 🆘 TROUBLESHOOTING

**Issue:** CORS error
```bash
# Backend .env
CORS_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
```

**Issue:** CSV import fails
```bash
# Check CSV format: vietnamese,pronunciation,target_language
# No spaces, UTF-8 encoding
```

**Issue:** TTS not working
```bash
# Check gTTS installation
pip install gTTS==2.4.0
```

---

## 📞 SUPPORT

Nếu có vấn đề:
1. Check console logs (F12)
2. Check API docs: `/docs`
3. Check environment variables
4. Check network requests

---

**🎉 Chúc bạn học tốt! Good luck with your language learning journey! 加油！頑張って！화이팅！**