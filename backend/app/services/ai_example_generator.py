import os
import google.generativeai as genai
from typing import List, Dict
from dotenv import load_dotenv
import json

load_dotenv()

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    # ✅ ĐỔI MODEL TỪ 'gemini-pro' SANG 'gemini-1.5-flash'
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None


def generate_example_sentences(
    vietnamese: str,
    target_language: str,
    pronunciation: str,
    language: str
) -> List[Dict]:
    """
    Generate 3 natural, COMPLEX example sentences using AI
    NO HARDCODING - 100% AI generated
    """
    if not model:
        raise Exception("Gemini API key not configured. Please set GEMINI_API_KEY in .env file")
    
    language_info = {
        "Chinese": {
            "name": "tiếng Trung (中文)",
            "instruction": "Tạo 3 câu tiếng Trung tự nhiên"
        },
        "Japanese": {
            "name": "tiếng Nhật (日本語)",
            "instruction": "Tạo 3 câu tiếng Nhật tự nhiên"
        },
        "Korean": {
            "name": "tiếng Hàn (한국어)",
            "instruction": "Tạo 3 câu tiếng Hàn tự nhiên"
        },
        "English": {
            "name": "tiếng Anh (English)",
            "instruction": "Create 3 natural English sentences"
        }
    }
    
    lang_info = language_info.get(language, language_info["English"])
    
    prompt = f"""You are a professional {lang_info['name']} teacher with 15 years of experience.

TASK: {lang_info['instruction']} using the word/phrase "{target_language}" (meaning in Vietnamese: "{vietnamese}").

Word Information:
- Original word/phrase: {target_language}
- Pronunciation: {pronunciation}
- Vietnamese meaning: {vietnamese}

CRITICAL REQUIREMENTS:

1. **SENTENCES MUST BE COMPLEX AND NATURAL**:
   - Each sentence must have 2-3 clauses connected together
   - Use conjunctions: because, so, when, although, if, in order to, etc.
   - Minimum length: 12-20 words per sentence
   - Sound like native speakers actually talk

2. **MUST HAVE REAL CONTEXT**:
   - Daily life situations: shopping, meeting friends, working, cooking, studying, entertainment
   - Include specific people, time, place
   - Show actions and results/reasons/purposes
   - Express emotions and thoughts

3. **USE VOCABULARY CORRECTLY IN CONTEXT**:
   - The word "{target_language}" must appear NATURALLY in the sentence
   - Correct grammatical position (verb, noun, adjective, etc.)
   - Appropriate for real-life situations
   - Not forced or illogical

4. **GRAMMAR MUST BE 100% CORRECT**:
   - Correct tenses and aspects
   - Correct particles (は、が、を、に、で for Japanese)
   - Correct conjunctions between clauses
   - Appropriate honorifics if needed

5. **THREE LEVELS OF COMPLEXITY**:
   - Sentence 1 (Medium): 2 clauses, simple conjunctions (and, but, so)
   - Sentence 2 (Complex): 3 clauses, advanced grammar (when...then, because...so, although...but)
   - Sentence 3 (Very Complex): Multiple clauses with conditionals/suppositions/purposes (if...then, in order to...must)

Return ONLY pure JSON (NO markdown, NO ```):
[
  {{
    "target": "Complex sentence 12-20 words with 2-3 clauses, using '{target_language}' naturally",
    "pronunciation": "Complete accurate pronunciation of every word",
    "vietnamese": "Natural, flowing Vietnamese translation",
    "context": "Describe the specific situation"
  }},
  {{
    "target": "More complex sentence with more clauses and advanced grammar",
    "pronunciation": "Complete pronunciation",
    "vietnamese": "Natural translation",
    "context": "Situation description"
  }},
  {{
    "target": "Very complex sentence with conditionals/suppositions or purposes",
    "pronunciation": "Complete pronunciation",
    "vietnamese": "Natural translation",
    "context": "Situation description"
  }}
]

RETURN ONLY THE JSON ARRAY, NO OTHER TEXT, NO EXPLANATIONS, NO MARKDOWN.
"""
    
    try:
        response = model.generate_content(prompt)
        result_text = response.text.strip()
        
        # Clean up response - remove markdown if present
        if result_text.startswith("```"):
            lines = result_text.split("\n")
            result_text = "\n".join(lines[1:-1]) if len(lines) > 2 else result_text
            if result_text.startswith("json"):
                result_text = result_text[4:].strip()
        
        # Remove any trailing markdown
        if result_text.endswith("```"):
            result_text = result_text[:-3].strip()
        
        # Parse JSON
        examples = json.loads(result_text)
        
        # Validate results
        if not isinstance(examples, list) or len(examples) < 3:
            print(f"Invalid response format. Got: {type(examples)}, length: {len(examples) if isinstance(examples, list) else 'N/A'}")
            raise ValueError("Invalid response format from AI")
        
        # Validate each example
        for i, ex in enumerate(examples[:3]):
            if not all(key in ex for key in ['target', 'pronunciation', 'vietnamese', 'context']):
                print(f"Example {i} missing required keys. Got: {ex.keys()}")
                raise ValueError(f"Example {i} has invalid structure")
            
            # Check minimum length
            if len(ex.get('target', '')) < 10:
                print(f"Example {i} too short: {ex.get('target', '')}")
                raise ValueError(f"Example {i} sentence too simple")
        
        return examples[:3]
    
    except json.JSONDecodeError as e:
        print(f"JSON Parse Error: {e}")
        print(f"Raw response: {result_text[:500]}")
        raise Exception(f"AI returned invalid JSON. Please check GEMINI_API_KEY or try again.")
    
    except Exception as e:
        print(f"AI generation error: {e}")
        print(f"Response text: {result_text[:500] if 'result_text' in locals() else 'No response'}")
        raise Exception(f"Failed to generate examples: {str(e)}. Please check your GEMINI_API_KEY.")


def generate_dialogue(
    vietnamese: str,
    target_language: str,
    pronunciation: str,
    language: str
) -> List[Dict]:
    """
    Generate a natural, REALISTIC dialogue using AI
    NO HARDCODING - 100% AI generated
    """
    if not model:
        raise Exception("Gemini API key not configured. Please set GEMINI_API_KEY in .env file")
    
    language_info = {
        "Chinese": "tiếng Trung (中文)",
        "Japanese": "tiếng Nhật (日本語)",
        "Korean": "tiếng Hàn (한국어)",
        "English": "tiếng Anh (English)"
    }
    
    lang_name = language_info.get(language, "tiếng Anh")
    
    prompt = f"""You are a professional scriptwriter specializing in {lang_name} dialogues.

TASK: Create a NATURAL, REALISTIC dialogue between 2 people (A and B) in a daily life situation, using the word "{target_language}" (meaning: "{vietnamese}").

Word Information:
- Word/phrase: {target_language}
- Pronunciation: {pronunciation}
- Vietnamese meaning: {vietnamese}

REQUIREMENTS:

1. **SPECIFIC AND REALISTIC SITUATION**:
   - Choose a situation appropriate to the vocabulary
   - Possible situations: meeting friends, dining out, shopping, asking for help, making phone calls, group meetings, etc.
   - Clear context (time, place, relationship between A and B)

2. **NATURAL DIALOGUE LIKE REAL PEOPLE**:
   - 4-5 exchanges between A and B
   - Each line is substantial (not just 1-2 words)
   - Natural reactions and real emotions
   - Include questions, answers, suggestions
   - Like how native speakers actually talk

3. **USE VOCABULARY CORRECTLY AND NATURALLY**:
   - The word "{target_language}" must appear NATURALLY in the dialogue
   - Not forced, must fit the situation
   - Show real practical usage of the word
   - Can appear multiple times if appropriate

4. **GRAMMAR AND STYLE**:
   - 100% correct grammar
   - Appropriate relationship level (formal/informal/friends/colleagues)
   - Appropriate sentence-ending particles
   - Natural expressions

Return ONLY pure JSON (NO markdown, NO ```):
[
  {{
    "speaker": "A",
    "target": "Long, natural line with specific context, using '{target_language}' naturally",
    "pronunciation": "Complete accurate pronunciation",
    "vietnamese": "Natural Vietnamese translation"
  }},
  {{
    "speaker": "B",
    "target": "Natural response with reactions or emotions",
    "pronunciation": "Complete pronunciation",
    "vietnamese": "Natural translation"
  }},
  {{
    "speaker": "A",
    "target": "Follow-up response or suggestion",
    "pronunciation": "Complete pronunciation",
    "vietnamese": "Natural translation"
  }},
  {{
    "speaker": "B",
    "target": "Agreement/disagreement/response with reason",
    "pronunciation": "Complete pronunciation",
    "vietnamese": "Natural translation"
  }}
]

RETURN ONLY THE JSON ARRAY, NO EXPLANATORY TEXT, NO MARKDOWN.
"""
    
    try:
        response = model.generate_content(prompt)
        result_text = response.text.strip()
        
        # Clean up response
        if result_text.startswith("```"):
            lines = result_text.split("\n")
            result_text = "\n".join(lines[1:-1]) if len(lines) > 2 else result_text
            if result_text.startswith("json"):
                result_text = result_text[4:].strip()
        
        if result_text.endswith("```"):
            result_text = result_text[:-3].strip()
        
        # Parse JSON
        dialogue = json.loads(result_text)
        
        if not isinstance(dialogue, list) or len(dialogue) < 3:
            raise ValueError("Invalid dialogue format")
        
        # Validate dialogue structure
        for i, line in enumerate(dialogue[:5]):
            if not all(key in line for key in ['speaker', 'target', 'pronunciation', 'vietnamese']):
                raise ValueError(f"Dialogue line {i} has invalid structure")
        
        return dialogue[:5]
    
    except json.JSONDecodeError as e:
        print(f"JSON Parse Error: {e}")
        print(f"Raw response: {result_text[:500]}")
        raise Exception(f"AI returned invalid JSON for dialogue. Please try again.")
    
    except Exception as e:
        print(f"AI generation error: {e}")
        print(f"Response text: {result_text[:500] if 'result_text' in locals() else 'No response'}")
        raise Exception(f"Failed to generate dialogue: {str(e)}")