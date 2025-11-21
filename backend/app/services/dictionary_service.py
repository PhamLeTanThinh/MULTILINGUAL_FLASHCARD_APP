from typing import List
from deep_translator import GoogleTranslator
from ..schemas import DictionaryResult
from functools import lru_cache
from ..services.pronunciation import generate_pronunciation
from pykakasi import kakasi


class DictionaryService:
    def __init__(self):
        # Language mapping
        self.lang_map = {
            "EN": "en",
            "ZH": "zh-CN",
            "JA": "ja",
            "KO": "ko"
        }

        # Converter dùng cho tiếng Nhật: Kanji/Katakana -> Hiragana
        self.kakasi = kakasi()
        self.kakasi.setMode("J", "H")  # Kanji -> Hiragana
        self.kakasi.setMode("K", "H")  # Katakana -> Hiragana
        self.kakasi.setMode("H", "H")  # Hiragana giữ nguyên
        self.kakasi_conv = self.kakasi.getConverter()

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

    def _has_kanji(self, text: str) -> bool:
        """Check if a Japanese string contains any Kanji (CJK Unified Ideographs)."""
        for ch in text:
            if '\u4e00' <= ch <= '\u9fff':
                return True
        return False

    def _to_kana(self, text: str) -> str:
        """
        Convert Japanese text (Kanji/Katakana/Hiragana mix) to pure Hiragana.
        Dùng cho chế độ 'không Kanji'.

        - Nếu CÓ Kanji: convert toàn bộ sang Hiragana (lấy cách đọc).
        - Nếu KHÔNG có Kanji (toàn Hiragana/Katakana): giữ nguyên
          → slang / từ vay mượn viết Katakana sẽ không bị đổi.
        """
        # Không có Kanji thì trả về nguyên bản (giữ Katakana)
        if not self._has_kanji(text):
            return text

        try:
            return self.kakasi_conv.do(text)
        except Exception:
            return text

    def search_vietnamese(
        self,
        query: str,
        language: str,
        limit: int = 10,
        kanji_only: bool = False
    ) -> List[DictionaryResult]:
        """
        Search and translate Vietnamese to target language using Google Translate.
        Chỉ trả về bản dịch chính (KHÔNG còn sinh biến thể như 'ăn nước').

        - Với tiếng Nhật (JA):
            + kanji_only = False -> hiển thị:
                * Nếu có Kanji: chuyển sang Hiragana (reading)
                * Nếu không có Kanji: giữ nguyên (Hiragana/Katakana)
            + kanji_only = True  -> hiển thị Kanji, và nếu không có Kanji thì bỏ kết quả
        - Các ngôn ngữ khác: giữ nguyên bản dịch Google Translate.
        """
        results: List[DictionaryResult] = []
        target_lang = self.lang_map.get(language, "en")

        lang_upper = language.upper()
        is_japanese = lang_upper == "JA"
        apply_kanji_filter = is_japanese and kanji_only

        query = query.strip()
        if not query:
            return results

        # 1. Main translation duy nhất
        translated = self._translate_cached(query, target_lang)

        if translated:
            # Nếu tiếng Nhật và bật Kanji-only → bỏ mục không có Kanji
            if apply_kanji_filter and not self._has_kanji(translated):
                return results  # không có kết quả phù hợp

            # Chọn text hiển thị
            if is_japanese and not kanji_only:
                # Chế độ "không Kanji":
                # - nếu có Kanji: convert sang Hiragana (reading)
                # - nếu không: giữ nguyên (slang Katakana không bị đổi)
                display_text = self._to_kana(translated)
            else:
                # Giữ nguyên (Kanji cho JA khi kanji_only=True, và các ngôn ngữ khác)
                display_text = translated

            pronunciation = generate_pronunciation(translated, language)
            results.append(DictionaryResult(
                vietnamese=query,
                pronunciation=pronunciation,
                target_language=display_text,
                language=language
            ))

        # Không còn xử lý variations nữa
        return results


dictionary_service = DictionaryService()
