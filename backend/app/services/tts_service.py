from gtts import gTTS
import os
from pathlib import Path
import hashlib

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
        
        # Create filename based on text hash to avoid special characters
        text_hash = hashlib.md5(text.encode('utf-8')).hexdigest()
        filename = f"{text_hash}_{language}.mp3"
        filepath = self.audio_dir / filename
        
        # Check if file already exists
        if not filepath.exists():
            try:
                tts = gTTS(text=text, lang=lang_code, slow=False)
                tts.save(str(filepath))
                print(f"✅ Created audio file: {filepath}")
            except Exception as e:
                print(f"❌ TTS Error: {e}")
                raise
        else:
            print(f"♻️ Using cached audio: {filepath}")
        
        return str(filepath)

tts_service = TTSService()