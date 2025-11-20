from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)  # ← Thêm length limit
    avatar = Column(String(500), nullable=True)  # ← Thêm length limit
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # ← Đổi sang func.now()
    last_activity_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())  # ← Đổi sang func.now()
    
    decks = relationship("Deck", back_populates="user", cascade="all, delete-orphan")

class Deck(Base):
    __tablename__ = "decks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)  # ← Thêm length limit
    language = Column(String(50), nullable=False)  # ← Thêm length limit
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # ← Đổi sang func.now()
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())  # ← Đổi sang func.now()
    
    user = relationship("User", back_populates="decks")
    flashcards = relationship("Flashcard", back_populates="deck", cascade="all, delete-orphan")

class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True)
    deck_id = Column(Integer, ForeignKey("decks.id", ondelete="CASCADE"))
    vietnamese = Column(Text, nullable=False)  # ← Đổi sang Text (không giới hạn length)
    pronunciation = Column(String(500), nullable=False)  # ← Thêm length limit
    target_language = Column(Text, nullable=False)  # ← Đổi sang Text
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # ← Đổi sang func.now()
    
    deck = relationship("Deck", back_populates="flashcards")