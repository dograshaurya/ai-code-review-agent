from pydantic import BaseModel, ConfigDict, Field


class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    code: str = Field(min_length=1, max_length=30000)
    language: str = Field(default="python", min_length=1, max_length=50)
    question: str = Field(min_length=1, max_length=2000)
    review_summary: str = Field(default="", max_length=2000)
    findings: list[dict] = Field(default_factory=list, max_length=100)


class ChatResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    answer: str = Field(min_length=1, max_length=10000)
    model: str = Field(min_length=1, max_length=100)