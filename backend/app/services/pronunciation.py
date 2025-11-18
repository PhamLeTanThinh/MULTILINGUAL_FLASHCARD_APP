from pypinyin import pinyin, Style
import pykakasi
from hangul_romanize import Transliter
from hangul_romanize.rule import academic

def generate_pronunciation(text: str, language: str) -> str:
    """Auto-generate pronunciation based on language"""
    
    try:
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
    except Exception as e:
        print(f"Pronunciation generation error: {e}")
        return text
    
    return text