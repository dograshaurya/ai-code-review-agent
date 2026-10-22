from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.schemas.review import ReviewRequest, ReviewResponse
from app.schemas.chat import ChatRequest, ChatResponse
from app.services import chat_service
from app.services import review_service

app = FastAPI(
    title=settings.app_name,
    description="AI-assisted code review powered by a local Ollama model.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok", "model": settings.llm_model}


@app.post("/api/v1/reviews", response_model=ReviewResponse)
async def create_review(request: ReviewRequest):
    try:
        return await review_service.review_code(request)
    except review_service.ReviewServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

@app.post("/api/v1/chat", response_model=ChatResponse)
async def chat_with_review_agent(request: ChatRequest):
    try:
        return await chat_service.answer_question(request)
    except chat_service.ChatServiceError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc