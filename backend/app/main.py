from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import gspread

from .config import get_settings
from .routers import chat, consultations
from .routers import calls

settings = get_settings()

app = FastAPI(
    title="MotorsBazaar Voice Agent API",
    description="Backend for second-hand car consultation voice agent",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(consultations.router)
app.include_router(calls.router)


@app.exception_handler(gspread.exceptions.APIError)
async def google_api_error_handler(request: Request, exc: gspread.exceptions.APIError):
    return JSONResponse(
        status_code=429,
        content={"detail": "Google Sheets rate limit reached. Please try again shortly."},
        headers={"Retry-After": "10"},
    )


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "service": "MotorsBazaar Voice Agent API",
        "version": "1.0.0",
    }


@app.get("/")
async def root():
    return {"message": "MotorsBazaar API running. Visit /docs for API reference."}
