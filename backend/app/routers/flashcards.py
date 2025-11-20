from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import csv
import io
from .. import crud, schemas
from ..database import get_db
from ..services.pronunciation import generate_pronunciation
from ..services.ai_example_generator import generate_example_sentences, generate_dialogue


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
    
    try:
        contents = await file.read()
        csv_data = io.StringIO(contents.decode('utf-8'))
        csv_reader = csv.DictReader(csv_data)
        
        flashcards = []
        errors = []
        
        for line_num, row in enumerate(csv_reader, start=2):  # Start at 2 (header is line 1)
            try:
                # Strip whitespace from all fields
                vietnamese = row.get('vietnamese', '').strip()
                target_language = row.get('target_language', '').strip()
                pronunciation = row.get('pronunciation', '').strip()
                
                # Skip empty rows
                if not vietnamese and not target_language:
                    continue
                
                # Validate required fields
                if not vietnamese:
                    errors.append(f"Line {line_num}: Missing 'vietnamese' field")
                    continue
                
                if not target_language:
                    errors.append(f"Line {line_num}: Missing 'target_language' field")
                    continue
                
                # Auto-generate pronunciation if empty
                if not pronunciation:
                    pronunciation = generate_pronunciation(target_language, deck.language)
                
                flashcards.append(
                    schemas.FlashcardCreate(
                        deck_id=deck_id,
                        vietnamese=vietnamese,
                        pronunciation=pronunciation,
                        target_language=target_language
                    )
                )
            except Exception as e:
                errors.append(f"Line {line_num}: {str(e)}")
        
        if not flashcards and errors:
            raise HTTPException(
                status_code=400, 
                detail=f"No valid flashcards found. Errors: {'; '.join(errors)}"
            )
        
        created = crud.create_flashcards_bulk(db, flashcards)
        
        response = {
            "message": f"Imported {len(created)} flashcards",
            "count": len(created)
        }
        
        if errors:
            response["warnings"] = errors
        
        return response
        
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="File encoding error. Please save CSV as UTF-8"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing CSV: {str(e)}"
        )

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

@router.post("/{flashcard_id}/generate-example")
def generate_example(
    flashcard_id: int,
    example_type: str = "sentence",  # "sentence" or "dialogue"
    db: Session = Depends(get_db)
):
    """
    Generate example sentence or dialogue for a flashcard using AI
    example_type: "sentence" or "dialogue"
    """
    flashcard = crud.get_flashcard(db, flashcard_id)
    if not flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    
    deck = crud.get_deck(db, flashcard.deck_id)
    
    # Language mapping
    lang_map = {
        "EN": "English",
        "ZH": "Chinese",
        "JA": "Japanese",
        "KO": "Korean"
    }
    
    language_name = lang_map.get(deck.language, "English")
    
    try:
        if example_type == "sentence":
            # Generate example sentences using AI
            examples = generate_example_sentences(
                flashcard.vietnamese,
                flashcard.target_language,
                flashcard.pronunciation,
                language_name
            )
        else:  # dialogue
            # Generate dialogue using AI
            examples = generate_dialogue(
                flashcard.vietnamese,
                flashcard.target_language,
                flashcard.pronunciation,
                language_name
            )
        
        return {
            "flashcard_id": flashcard_id,
            "type": example_type,
            "examples": examples
        }
    
    except Exception as e:
        print(f"Error generating example: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating example: {str(e)}")