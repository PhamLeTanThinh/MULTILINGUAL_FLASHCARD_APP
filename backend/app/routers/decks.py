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