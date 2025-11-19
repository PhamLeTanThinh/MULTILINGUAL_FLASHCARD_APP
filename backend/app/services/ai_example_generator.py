import os
import requests
from typing import List, Dict
from dotenv import load_dotenv

load_dotenv()

# Language code mapping
TATOEBA_LANG_CODES = {
    "Chinese": "cmn",
    "Japanese": "jpn",
    "Korean": "kor",
    "English": "eng"
}


def search_tatoeba(word: str, from_lang: str, to_lang: str = "vie", limit: int = 10) -> List[Dict]:
    """
    Search Tatoeba database for example sentences
    
    Args:
        word: The word to search for
        from_lang: Source language code (cmn, jpn, kor, eng)
        to_lang: Target language code (default: vie for Vietnamese)
        limit: Maximum number of results
    
    Returns:
        List of sentence examples with translations
    """
    try:
        # Tatoeba API endpoint
        url = "https://tatoeba.org/en/api_v0/search"
        
        params = {
            "query": word,
            "from": from_lang,
            "to": to_lang,
            "orphans": "no",
            "unapproved": "no",
            "has_audio": "",
            "trans_filter": "limit",
            "trans_to": to_lang,
            "sort": "relevance"
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        results = []
        
        if "results" in data:
            for item in data["results"][:limit]:
                sentence = {
                    "target": item["text"],
                    "vietnamese": "",
                    "id": item["id"]
                }
                
                # Get Vietnamese translation
                if "translations" in item and item["translations"]:
                    # Find Vietnamese translation
                    for trans in item["translations"]:
                        if trans and isinstance(trans, list) and len(trans) > 0:
                            for t in trans:
                                if t.get("lang") == to_lang:
                                    sentence["vietnamese"] = t.get("text", "")
                                    break
                        if sentence["vietnamese"]:
                            break
                
                # Only add if has Vietnamese translation
                if sentence["vietnamese"]:
                    results.append(sentence)
        
        print(f"✅ Found {len(results)} examples from Tatoeba")
        return results
        
    except requests.exceptions.RequestException as e:
        print(f"⚠️ Tatoeba API error: {e}")
        return []
    except Exception as e:
        print(f"⚠️ Tatoeba parsing error: {e}")
        return []


def add_pronunciation(sentences: List[Dict], pronunciation: str, language: str) -> List[Dict]:
    """Add pronunciation to sentences based on language"""
    
    for sentence in sentences:
        target_text = sentence["target"]
        
        if language == "Japanese":
            try:
                import pykakasi
                kks = pykakasi.kakasi()
                result = kks.convert(target_text)
                sentence["pronunciation"] = " ".join([item["hira"] for item in result])
            except:
                sentence["pronunciation"] = pronunciation
                
        elif language == "Chinese":
            try:
                from pypinyin import lazy_pinyin
                sentence["pronunciation"] = " ".join(lazy_pinyin(target_text))
            except:
                sentence["pronunciation"] = pronunciation
                
        elif language == "Korean":
            try:
                from hangul_romanize import Transliter
                from hangul_romanize.rule import academic
                transliter = Transliter(academic)
                sentence["pronunciation"] = transliter.translit(target_text)
            except:
                sentence["pronunciation"] = pronunciation
        else:
            sentence["pronunciation"] = target_text
        
        sentence["context"] = f"Example from Tatoeba (ID: {sentence.get('id', 'N/A')})"
    
    return sentences


def generate_example_sentences(
    vietnamese: str,
    target_language: str,
    pronunciation: str,
    language: str
) -> List[Dict]:
    """
    Generate example sentences from Tatoeba database
    """
    
    lang_code = TATOEBA_LANG_CODES.get(language, "eng")
    
    print(f"🔍 Searching Tatoeba for: {target_language} ({language})")
    
    tatoeba_results = search_tatoeba(target_language, lang_code, "vie", limit=10)
    
    if len(tatoeba_results) >= 3:
        sentences = tatoeba_results[:3]
        sentences = add_pronunciation(sentences, pronunciation, language)
        print(f"✅ Using {len(sentences)} examples from Tatoeba")
        return sentences
    elif len(tatoeba_results) > 0:
        sentences = add_pronunciation(tatoeba_results, pronunciation, language)
        return sentences
    else:
        raise Exception(f"No examples found in Tatoeba for: {target_language}")


def generate_dialogue(
    vietnamese: str,
    target_language: str,
    pronunciation: str,
    language: str
) -> List[Dict]:
    """
    Generate dialogue from Tatoeba examples
    """
    
    lang_code = TATOEBA_LANG_CODES.get(language, "eng")
    tatoeba_examples = search_tatoeba(target_language, lang_code, "vie", limit=5)
    
    if not tatoeba_examples or len(tatoeba_examples) < 3:
        raise Exception(f"Not enough examples found in Tatoeba for dialogue: {target_language}")
    
    # Convert examples to dialogue format
    dialogue = []
    speakers = ["A", "B"]
    
    for i, example in enumerate(tatoeba_examples[:5]):
        dialogue.append({
            "speaker": speakers[i % 2],
            "target": example["target"],
            "pronunciation": example.get("pronunciation", pronunciation),
            "vietnamese": example["vietnamese"]
        })
    
    dialogue = add_pronunciation(dialogue, pronunciation, language)
    print(f"✅ Created dialogue from {len(dialogue)} Tatoeba examples")
    return dialogue