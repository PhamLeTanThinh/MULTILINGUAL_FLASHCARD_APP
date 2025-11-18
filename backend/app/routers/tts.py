from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import FileResponse
from ..services.tts_service import tts_service
import os

router = APIRouter(prefix="/tts", tags=["tts"])

@router.get("/speak")
def text_to_speech(
    text: str = Query(..., min_length=1),
    language: str = Query(..., regex="^(EN|ZH|KO|JA)$")
):
    """Convert text to speech and return audio file"""
    try:
        audio_path = tts_service.text_to_speech(text, language)
        
        # Check if file exists
        if not os.path.exists(audio_path):
            raise HTTPException(status_code=404, detail="Audio file not found")
        
        return FileResponse(
            audio_path, 
            media_type="audio/mpeg",
            headers={
                "Cache-Control": "public, max-age=31536000",  # Cache for 1 year
                "Access-Control-Allow-Origin": "*"
            }
        )
    except Exception as e:
        print(f"TTS Error: {e}")
        raise HTTPException(status_code=500, detail=f"TTS Error: {str(e)}")