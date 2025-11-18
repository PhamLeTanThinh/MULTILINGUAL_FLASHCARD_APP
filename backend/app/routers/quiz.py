from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from deep_translator import GoogleTranslator
from .. import crud
from ..database import get_db
from ..services.pronunciation import generate_pronunciation
import random

router = APIRouter(prefix="/quiz", tags=["quiz"])

@router.get("/generate-options/{deck_id}")
def generate_quiz_options(
    deck_id: int,
    word: str = Query(..., description="The word to generate similar options for"),
    word_vietnamese: str = Query(..., description="Vietnamese meaning of the word"),
    language: str = Query(..., regex="^(EN|ZH|KO|JA)$"),
    count: int = Query(3, ge=1, le=5, description="Number of wrong options to generate"),
    db: Session = Depends(get_db)
):
    """
    Generate similar wrong answer options using AI translation
    Uses semantic similarity to create confusing but incorrect options
    """
    deck = crud.get_deck(db, deck_id)
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    
    # Language mapping
    lang_map = {
        "EN": "en",
        "ZH": "zh-CN",
        "JA": "ja",
        "KO": "ko"
    }
    
    target_lang = lang_map.get(language, "en")
    
    try:
        # Strategy: Generate semantically similar Vietnamese words using word association
        similar_patterns = generate_similar_words(word_vietnamese, language)
        
        options = []
        translator = GoogleTranslator(source='vi', target=target_lang)
        
        for similar_viet in similar_patterns[:count * 2]:
            try:
                translated = translator.translate(similar_viet)
                
                # Don't include the original word
                if translated and translated != word and translated.strip():
                    pronunciation = generate_pronunciation(translated, language)
                    options.append({
                        "text": translated,
                        "pronunciation": pronunciation,
                        "vietnamese": similar_viet
                    })
                    
                    if len(options) >= count:
                        break
            except Exception as e:
                print(f"Translation error for {similar_viet}: {e}")
                continue
        
        # If still not enough, add more generic similar words
        while len(options) < count:
            fallback_words = get_fallback_similar_words(word_vietnamese, language)
            for fallback in fallback_words:
                if len(options) >= count:
                    break
                try:
                    translated = translator.translate(fallback)
                    if translated and translated != word:
                        pronunciation = generate_pronunciation(translated, language)
                        options.append({
                            "text": translated,
                            "pronunciation": pronunciation,
                            "vietnamese": fallback
                        })
                except:
                    continue
        
        return {"options": options[:count]}
        
    except Exception as e:
        print(f"Error generating options: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating options: {str(e)}")


def generate_similar_words(base_word: str, language: str) -> List[str]:
    """
    Generate semantically similar Vietnamese words based on the base word
    Uses word associations, synonyms, and related concepts
    """
    similar_words = []
    base_lower = base_word.lower().strip()
    
    # Greeting words - if base is a greeting, return other greetings
    if any(greeting in base_lower for greeting in ["chào", "xin chào", "hello", "hi"]):
        similar_words.extend([
            "chào buổi sáng",
            "chào buổi chiều", 
            "chào buổi tối",
            "xin chào bạn",
            "chúc buổi sáng tốt lành",
            "chúc buổi tối vui vẻ",
            "rất vui được gặp bạn"
        ])
    
    # Thank you words
    elif any(thank in base_lower for thank in ["cảm ơn", "thank"]):
        similar_words.extend([
            "cảm ơn bạn",
            "cảm ơn rất nhiều",
            "xin cảm ơn",
            "cảm ơn bạn nhiều",
            "rất cảm ơn",
            "biết ơn bạn"
        ])
    
    # Goodbye words
    elif any(bye in base_lower for bye in ["tạm biệt", "bye", "goodbye"]):
        similar_words.extend([
            "tạm biệt nhé",
            "hẹn gặp lại",
            "chào tạm biệt",
            "gặp lại sau",
            "chúc ngủ ngon",
            "chào nhé"
        ])
    
    # Apology words
    elif any(sorry in base_lower for sorry in ["xin lỗi", "sorry"]):
        similar_words.extend([
            "xin lỗi bạn",
            "thật xin lỗi",
            "rất xin lỗi",
            "xin lỗi nhiều",
            "tôi xin lỗi"
        ])
    
    # Love/Like words
    elif any(love in base_lower for love in ["yêu", "thích", "love", "like"]):
        similar_words.extend([
            "tôi thích bạn",
            "tôi yêu em",
            "yêu thương",
            "thích lắm",
            "rất thích",
            "mến bạn"
        ])
    
    # Food/Eating words
    elif any(food in base_lower for food in ["ăn", "cơm", "eat", "food", "món"]):
        similar_words.extend([
            "ăn cơm",
            "dùng bữa",
            "ăn tối",
            "ăn sáng",
            "ăn trưa",
            "thức ăn",
            "bữa ăn"
        ])
    
    # Drinking words
    elif any(drink in base_lower for drink in ["uống", "drink", "nước"]):
        similar_words.extend([
            "uống nước",
            "uống trà",
            "uống cà phê",
            "đồ uống",
            "thức uống"
        ])
    
    # Question words
    elif any(q in base_lower for q in ["khỏe", "how", "thế nào"]):
        similar_words.extend([
            "bạn khỏe không",
            "bạn thế nào",
            "ổn không",
            "có khỏe không",
            "mọi thứ thế nào"
        ])
    
    # Actions/Verbs
    elif any(action in base_lower for action in ["đi", "về", "làm", "học"]):
        if "đi" in base_lower:
            similar_words.extend(["đi chơi", "đi học", "đi làm", "đi về", "ra đi"])
        elif "về" in base_lower:
            similar_words.extend(["về nhà", "trở về", "quay về", "về quê"])
        elif "làm" in base_lower:
            similar_words.extend(["làm việc", "làm bài", "làm ơn", "làm gì"])
        elif "học" in base_lower:
            similar_words.extend(["học tập", "đi học", "học bài", "học hành"])
    
    # Numbers/Counting
    elif any(num in base_lower for num in ["bao nhiêu", "many", "much", "số"]):
        similar_words.extend([
            "bao nhiêu tiền",
            "giá bao nhiêu",
            "có bao nhiêu",
            "mấy cái",
            "số lượng"
        ])
    
    # Feelings/Emotions
    elif any(feel in base_lower for feel in ["vui", "buồn", "happy", "sad", "tốt", "xấu"]):
        similar_words.extend([
            "vui vẻ",
            "hạnh phúc",
            "buồn bã",
            "tức giận",
            "phấn khích",
            "thoải mái"
        ])
    
    # Time words
    elif any(time in base_lower for time in ["sáng", "tối", "trưa", "morning", "evening"]):
        similar_words.extend([
            "buổi sáng",
            "buổi chiều",
            "buổi tối",
            "ban ngày",
            "ban đêm"
        ])
    
    # General similar structure - add variations
    else:
        # Split into words and create variations
        words = base_lower.split()
        if len(words) >= 1:
            main_word = words[0]
            similar_words.extend([
                f"{main_word} rất nhiều",
                f"{main_word} một chút",
                f"rất {main_word}",
                f"{main_word} lắm",
                f"có {main_word}",
                f"{main_word} không"
            ])
    
    # Shuffle to add randomness
    random.shuffle(similar_words)
    
    return similar_words


def get_fallback_similar_words(base_word: str, language: str) -> List[str]:
    """
    Fallback method to generate generic similar words if main method fails
    """
    generic_similar = [
        "rất tốt",
        "không tốt",
        "có thể",
        "không thể",
        "rất nhiều",
        "một chút",
        "hơi bị",
        "khá là",
        "thật sự",
        "hơi",
        "rất",
        "quá",
        "lắm",
        "mới",
        "cũ",
        "nhanh",
        "chậm",
        "cao",
        "thấp",
        "lớn",
        "nhỏ"
    ]
    
    random.shuffle(generic_similar)
    return generic_similar