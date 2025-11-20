from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse   # 👈 thêm dòng này
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas
from ..database import get_db
import csv
import io

router = APIRouter(prefix="/decks", tags=["decks"])

@router.get("/user/{user_id}", response_model=List[schemas.Deck])
def read_user_decks(user_id: int, db: Session = Depends(get_db)):
    decks = crud.get_decks_by_user(db, user_id=user_id)
    for deck in decks:
        deck.flashcard_count = len(deck.flashcards)
    return decks

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


# 🚀 NEW: Export CSV cho 1 deck
@router.get("/{deck_id}/export-csv")
def export_deck_csv(deck_id: int, db: Session = Depends(get_db)):
    """
    Xuất toàn bộ flashcards của 1 deck ra file CSV.
    Columns: vietnamese, pronunciation, target_language
    """
    deck = crud.get_deck(db, deck_id=deck_id)
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    flashcards = crud.get_flashcards_by_deck(db, deck_id)

    def iter_csv():
        buffer = io.StringIO()
        writer = csv.writer(buffer)

        # Header
        writer.writerow(["vietnamese", "pronunciation", "target_language"])
        yield buffer.getvalue()
        buffer.seek(0)
        buffer.truncate(0)

        # Rows
        for fc in flashcards:
            writer.writerow([
                fc.vietnamese or "",
                fc.pronunciation or "",
                fc.target_language or "",
            ])
            yield buffer.getvalue()
            buffer.seek(0)
            buffer.truncate(0)

    filename = f"deck_{deck_id}.csv"

    return StreamingResponse(
        iter_csv(),
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename=\"{filename}\"'
        },
    )
