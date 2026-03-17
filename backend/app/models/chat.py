from pydantic import BaseModel
from typing import Optional


class ConversationMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    language: str  # "hindi" or "gujarati"
    conversation_history: list[ConversationMessage]
    user_message: str


class ExtractedConsultation(BaseModel):
    name: str
    contact: str
    query_type: str  # "buy" or "sell"
    budget: Optional[str] = None
    car_preference: Optional[str] = None
    details: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    is_complete: bool = False
    extracted_data: Optional[ExtractedConsultation] = None
