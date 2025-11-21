from fastapi import APIRouter, Query
from typing import List
from ..schemas import DictionaryResult
from ..services.dictionary_service import dictionary_service

router = APIRouter(prefix="/dictionary", tags=["dictionary"])

@router.get("/search", response_model=List[DictionaryResult])
def search_dictionary(
    query: str = Query(..., min_length=1),
    language: str = Query(..., regex="^(EN|ZH|KO|JA)$"),
    limit: int = Query(10, ge=1, le=50),
    kanji_only: bool = Query(False)   # <-- thêm dòng này
):
    """Search dictionary by Vietnamese keyword"""
    return dictionary_service.search_vietnamese(
        query,
        language,
        limit,
        kanji_only=kanji_only           # <-- thêm dòng này
    )
