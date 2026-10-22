from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ReviewRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    code: str = Field(min_length=1, max_length=30000)
    language: str = Field(default="python", min_length=1, max_length=50)
    focus: list[Literal["bugs", "security", "quality"]] = Field(
        default_factory=lambda: ["bugs", "security", "quality"],
        min_length=1,
    )


class ReviewFinding(BaseModel):
    model_config = ConfigDict(extra="forbid")

    category: Literal["bug", "security", "quality"]
    severity: Literal["critical", "high", "medium", "low", "info"]
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=2000)
    line_number: int | None = Field(default=None, ge=1)
    suggestion: str = Field(min_length=1, max_length=2000)


class ReviewResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    summary: str = Field(min_length=1, max_length=2000)
    findings: list[ReviewFinding] = Field(max_length=100)
    model: str = Field(min_length=1, max_length=100)