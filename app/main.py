from fastapi import FastAPI, HTTPException

from app.config import settings
from app.schemas.review import ReviewRequest, ReviewResponse
from app.services import review_service

app = FastAPI(
    title=settings.app_name,
    description="AI-assisted code review powered by a local Ollama model.",
    version="0.1.0",
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