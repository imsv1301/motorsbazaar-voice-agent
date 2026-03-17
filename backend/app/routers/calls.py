"""
Twilio Voice Call Handler
-------------------------
When a customer calls your Twilio number, Twilio hits POST /api/calls/incoming.
Priya greets them, collects their details turn-by-turn, and on completion saves
the lead to Google Sheets and hangs up.

Flow:
  1. Twilio → POST /api/calls/incoming  (first call, no SpeechResult)
  2. Priya speaks a greeting via <Say>, listens via <Gather>
  3. Twilio → POST /api/calls/incoming  (with SpeechResult = what customer said)
  4. Repeat until is_complete == True → save to Sheets, hangup
"""

from fastapi import APIRouter, Form
from fastapi.responses import Response
from twilio.twiml.voice_response import VoiceResponse, Gather

from ..services.groq_service import GroqService
from ..services.sheets_service import SheetsService
from ..models.chat import ChatRequest, ConversationMessage

router = APIRouter(prefix="/api/calls", tags=["calls"])

groq_service = GroqService()

# In-memory store: CallSid → { history, language }
# NOTE: On Render free tier a single instance handles all calls, so this works fine.
# For multi-instance production, replace with Redis.
_active_calls: dict[str, dict] = {}

# Twilio voice + language settings for Hindi (India)
VOICE = "Polly.Aditi"        # Amazon Polly Hindi voice (available on Twilio)
LANG  = "hi-IN"              # BCP-47 language code for speech recognition


def _twiml_response(text: str, action_url: str, final: bool = False) -> Response:
    """Build a TwiML response that speaks `text` and (unless final) listens."""
    vr = VoiceResponse()
    if final:
        vr.say(text, voice=VOICE, language=LANG)
        vr.hangup()
    else:
        gather = Gather(
            input="speech",
            action=action_url,
            method="POST",
            language=LANG,
            speech_timeout="auto",   # auto-detect end of speech
            timeout=6,               # seconds to wait before timeout
        )
        gather.say(text, voice=VOICE, language=LANG)
        vr.append(gather)
        # If customer says nothing, prompt again
        vr.redirect(action_url, method="POST")
    return Response(content=str(vr), media_type="application/xml")


@router.post("/incoming")
async def incoming_call(
    CallSid: str = Form(...),
    SpeechResult: str = Form(default=""),
    Called: str = Form(default=""),
):
    """
    Twilio hits this endpoint for every turn of the conversation.
    First hit: CallSid present, SpeechResult empty → trigger greeting.
    Subsequent hits: SpeechResult contains what the customer said.
    """
    action_url = "/api/calls/incoming"

    # ── New call: initialise state ──────────────────────────────────────────
    if CallSid not in _active_calls:
        _active_calls[CallSid] = {
            "history": [],
            "language": "hindi",   # always Hindi for phone calls
        }
        # Send a silent "hello" to trigger Priya's opening greeting
        user_message = "नमस्ते"
    else:
        user_message = SpeechResult.strip() if SpeechResult else ""

    call_state = _active_calls[CallSid]

    # ── If customer said nothing this turn, re-prompt ───────────────────────
    if not user_message and CallSid in _active_calls:
        fallback = "क्षमा करें, मुझे सुनाई नहीं दिया। कृपया दोबारा बोलें।"
        return _twiml_response(fallback, action_url)

    # ── Get Priya's response from Groq ──────────────────────────────────────
    chat_req = ChatRequest(
        user_message=user_message,
        conversation_history=call_state["history"],
        language=call_state["language"],
    )
    result = groq_service.chat(chat_req)

    # Update conversation history
    call_state["history"].append(
        ConversationMessage(role="user", content=user_message)
    )
    call_state["history"].append(
        ConversationMessage(role="assistant", content=result.reply)
    )

    # ── Consultation complete: save lead & hang up ──────────────────────────
    if result.is_complete and result.extracted_data:
        # Save to Google Sheets
        try:
            sheets = SheetsService()
            sheets.add({
                "language": call_state["language"],
                "name": result.extracted_data.name,
                "contact": result.extracted_data.contact,
                "query_type": result.extracted_data.query_type,
                "budget": result.extracted_data.budget,
                "car_preference": result.extracted_data.car_preference,
                "details": result.extracted_data.details,
            })
        except Exception:
            pass  # Don't crash the call if Sheets write fails

        # Cleanup memory
        del _active_calls[CallSid]

        farewell = result.reply or (
            f"बहुत धन्यवाद {result.extracted_data.name} जी! "
            "हम जल्द ही आपसे संपर्क करेंगे। MotorsBazaar में आपका धन्यवाद!"
        )
        return _twiml_response(farewell, action_url, final=True)

    # ── Continue conversation ───────────────────────────────────────────────
    return _twiml_response(result.reply, action_url)
