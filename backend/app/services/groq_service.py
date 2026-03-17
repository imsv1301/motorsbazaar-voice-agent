import json
import re
from groq import Groq
from ..config import get_settings
from ..models.chat import ChatRequest, ChatResponse, ExtractedConsultation
from ..prompts.system_hindi import HINDI_SYSTEM_PROMPT
from ..prompts.system_gujarati import GUJARATI_SYSTEM_PROMPT


def _get_system_prompt(language: str) -> str:
    if language == "gujarati":
        return GUJARATI_SYSTEM_PROMPT
    return HINDI_SYSTEM_PROMPT


def _extract_consultation_data(text: str) -> ExtractedConsultation | None:
    """Parse CONSULTATION_COMPLETE:{...} block from LLM response."""
    pattern = r"CONSULTATION_COMPLETE:\s*(\{.*?\})"
    match = re.search(pattern, text, re.DOTALL)
    if not match:
        return None
    try:
        data = json.loads(match.group(1))
        return ExtractedConsultation(
            name=data.get("name", "Unknown"),
            contact=data.get("contact", ""),
            query_type=data.get("query_type", "buy"),
            budget=data.get("budget") or None,
            car_preference=data.get("car_preference") or None,
            details=data.get("details") or None,
        )
    except (json.JSONDecodeError, KeyError):
        return None


def _clean_reply(text: str) -> str:
    """Remove the CONSULTATION_COMPLETE JSON block from the displayed reply."""
    return re.sub(r"CONSULTATION_COMPLETE:\s*\{.*?\}", "", text, flags=re.DOTALL).strip()


class GroqService:
    def __init__(self):
        settings = get_settings()
        self.client = Groq(api_key=settings.groq_api_key)

    def chat(self, request: ChatRequest) -> ChatResponse:
        system_prompt = _get_system_prompt(request.language)

        messages = [{"role": "system", "content": system_prompt}]

        # Include last 20 messages to stay within context limits
        for msg in request.conversation_history[-20:]:
            messages.append({"role": msg.role, "content": msg.content})

        messages.append({"role": "user", "content": request.user_message})

        response = self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=400,
        )

        raw_reply = response.choices[0].message.content or ""
        extracted = _extract_consultation_data(raw_reply)
        clean_reply = _clean_reply(raw_reply) if extracted else raw_reply

        # Provide a warm closing message when consultation is complete
        if extracted and not clean_reply:
            if request.language == "gujarati":
                clean_reply = f"ખૂબ ખૂબ આભાર {extracted.name} ભાઈ/બહેન! અμας ટૂંક સમयमाँ आ૫ ना नंबर पर संपर्क करशुं. MotorsBazaar माँ आ૫ना आगमन ना आभार!"
            else:
                clean_reply = f"बहुत धन्यवाद {extracted.name} जी! हम जल्द ही आपके नंबर पर संपर्क करेंगे। MotorsBazaar में आपका आना सफल हो!"

        return ChatResponse(
            reply=clean_reply,
            is_complete=extracted is not None,
            extracted_data=extracted,
        )
