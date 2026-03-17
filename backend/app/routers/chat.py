from fastapi import APIRouter, HTTPException, Depends
from ..models.chat import ChatRequest, ChatResponse
from ..services.groq_service import GroqService
from ..services.sheets_service import SheetsService

router = APIRouter(prefix="/api/chat", tags=["chat"])


def get_groq() -> GroqService:
    return GroqService()


def get_sheets() -> SheetsService:
    return SheetsService()


@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    groq: GroqService = Depends(get_groq),
    sheets: SheetsService = Depends(get_sheets),
):
    try:
        result = groq.chat(request)

        # Auto-save to Google Sheets when consultation is complete
        if result.is_complete and result.extracted_data:
            data = result.extracted_data.model_dump()
            data["language"] = request.language
            try:
                sheets.add(data)
            except Exception as sheet_err:
                # Don't fail the whole request if saving fails
                print(f"[sheets] Failed to save consultation: {sheet_err}")

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
