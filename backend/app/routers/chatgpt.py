from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import os
import openai

router = APIRouter(prefix="/chatgpt", tags=["chatgpt"])

openai.api_key = os.getenv("OPENAI_API_KEY")

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

@router.post("")
async def chatgpt_endpoint(request: ChatRequest):
    # Thêm system prompt kiểm soát chủ đề
    system_prompt = {
        "role": "system",
        "content": "Bạn là trợ lý AI chỉ hỗ trợ các câu hỏi về học ngôn ngữ. Nếu câu hỏi không liên quan đến ngôn ngữ, hãy trả lời: 'Xin lỗi, tôi chỉ hỗ trợ học ngôn ngữ.'"
    }
    messages = [system_prompt] + [msg.dict() for msg in request.messages if msg.role != 'system']
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=512,
            temperature=0.7
        )
        reply = response.choices[0].message["content"]
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
