from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    avatar = Column(String(500), nullable=True)

    # ❤️ Loyalty System
    points = Column(Integer, nullable=False, server_default="0")   # bPoint
    theme = Column(String(100), nullable=False, server_default="default")  # Theme màu

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_activity_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    decks = relationship("Deck", back_populates="user", cascade="all, delete-orphan")


class Deck(Base):
    __tablename__ = "decks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    language = Column(String(50), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="decks")
    flashcards = relationship("Flashcard", back_populates="deck", cascade="all, delete-orphan")


class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True)
    deck_id = Column(Integer, ForeignKey("decks.id", ondelete="CASCADE"))
    
    vietnamese = Column(Text, nullable=False)
    pronunciation = Column(String(500), nullable=False)
    target_language = Column(Text, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    deck = relationship("Deck", back_populates="flashcards")
