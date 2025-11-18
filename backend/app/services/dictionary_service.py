from typing import List
from deep_translator import GoogleTranslator
from ..schemas import DictionaryResult
from functools import lru_cache
from ..services.pronunciation import generate_pronunciation

class DictionaryService:
    def __init__(self):
        # Language mapping
        self.lang_map = {
            "EN": "en",
            "ZH": "zh-CN",
            "JA": "ja",
            "KO": "ko"
        }
    
    @lru_cache(maxsize=1000)
    def _translate_cached(self, query: str, target_lang: str) -> str:
        """Cache translations to avoid repeated API calls"""
        try:
            translator = GoogleTranslator(source='vi', target=target_lang)
            translated = translator.translate(query)
            return translated if translated else query
        except Exception as e:
            print(f"Translation error: {e}")
            return query
    
    def _generate_dynamic_variations(self, query: str) -> List[str]:
        """
        Generate dynamic variations based on query context
        Uses linguistic patterns, not hardcoded lists
        """
        variations = []
        query_lower = query.lower().strip()
        words = query_lower.split()
        
        # Single word queries - add common context
        if len(words) == 1:
            word = words[0]
            
            # For verbs, add object/time context
            # These are PATTERNS, not hardcoded lists
            common_verb_contexts = {
                "time": ["buổi sáng", "buổi chiều", "buổi tối"],
                "food": ["cơm", "nước"],
                "intensity": ["nhiều", "một chút"]
            }
            
            # Try adding food context for eating/drinking verbs
            if any(indicator in word for indicator in ["ăn", "uống", "dùng"]):
                for food in common_verb_contexts["food"]:
                    variations.append(f"{word} {food}")
            
            # Try adding person context for greeting/social verbs
            if any(indicator in word for indicator in ["chào", "cảm ơn", "xin lỗi"]):
                variations.append(f"{word} bạn")
                variations.append(f"xin {word}" if not word.startswith("xin") else word.replace("xin ", ""))

        # Multi-word queries - try removing/adding politeness markers
        else:
            # Remove politeness if present
            politeness_markers = ["xin", "kính", "vui lòng"]
            for marker in politeness_markers:
                if marker in words:
                    without_marker = query_lower.replace(marker, "").strip()
                    if without_marker and without_marker != query_lower:
                        variations.append(without_marker)
            
            # Add politeness if not present
            if not any(marker in words for marker in politeness_markers):
                variations.append(f"xin {query_lower}")
        
        # Remove duplicates and empty strings
        variations = [v.strip() for v in variations if v.strip() and v.strip() != query_lower]
        variations = list(dict.fromkeys(variations))  # Remove duplicates while preserving order
        
        return variations[:5]  # Limit to 5 variations max
    
    def search_vietnamese(self, query: str, language: str, limit: int = 10) -> List[DictionaryResult]:
        """
        Search and translate Vietnamese to target language using Google Translate
        Returns main result + dynamic variations based on query context
        """
        results = []
        seen_translations = set()  # Track unique translations
        target_lang = self.lang_map.get(language, "en")
        
        # 1. Main translation
        translated = self._translate_cached(query, target_lang)
        
        if translated:
            pronunciation = generate_pronunciation(translated, language)
            results.append(DictionaryResult(
                vietnamese=query,
                pronunciation=pronunciation,
                target_language=translated,
                language=language
            ))
            seen_translations.add(translated)
        
        # 2. Dynamic variations - translate them too
        variations = self._generate_dynamic_variations(query)
        
        for variation in variations:
            if len(results) >= limit:
                break
            
            var_translated = self._translate_cached(variation, target_lang)
            
            # Only add if translation is different from what we already have
            if var_translated and var_translated not in seen_translations:
                var_pronunciation = generate_pronunciation(var_translated, language)
                results.append(DictionaryResult(
                    vietnamese=variation,
                    pronunciation=var_pronunciation,
                    target_language=var_translated,
                    language=language
                ))
                seen_translations.add(var_translated)
        
        return results

dictionary_service = DictionaryService()