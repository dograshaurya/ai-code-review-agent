from fastapi.testclient import TestClient
import pytest
from app.main import app
from app.schemas.review import ReviewFinding, ReviewResponse
from app.services import review_service
import json
import httpx

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_review_endpoint_returns_structured_result(monkeypatch):
    async def fake_review_code(request):
        return ReviewResponse(
            summary="One potential bug found.",
            findings=[
                ReviewFinding(
                    category="bug",
                    severity="high",
                    title="Division by zero",
                    description="The divisor could be zero.",
                    line_number=2,
                    suggestion="Check the divisor before dividing.",
                )
            ],
            model="test-model",
        )

    monkeypatch.setattr(review_service, "review_code", fake_review_code)

    response = client.post(
        "/api/v1/reviews",
        json={
            "language": "python",
            "focus": ["bugs"],
            "code": "return a / b",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["model"] == "test-model"
    assert len(data["findings"]) == 1
    assert data["findings"][0]["severity"] == "high"


def test_review_endpoint_rejects_empty_code():
    response = client.post(
        "/api/v1/reviews",
        json={
            "language": "python",
            "focus": ["bugs"],
            "code": "",
        },
    )

    assert response.status_code == 422

def test_review_endpoint_returns_502_when_review_fails(monkeypatch):
    async def failing_review_code(request):
        raise review_service.ReviewServiceError(
            "The code review failed. Check the Ollama service and model response."
        )

    monkeypatch.setattr(
        review_service, "review_code", failing_review_code
    )

    response = client.post(
        "/api/v1/reviews",
        json={
            "language": "python",
            "focus": ["bugs"],
            "code": "print('hello')",
        },
    )

    assert response.status_code == 502
    assert "code review failed" in response.json()["detail"].lower()


@pytest.mark.anyio
async def test_review_service_handles_malformed_json(monkeypatch):
    from app.schemas.review import ReviewRequest
    from app.services.review_service import (
        ReviewServiceError,
        review_code,
    )

    class MockResponse:
        def raise_for_status(self):
            pass

        def json(self):
            return {
                "message": {
                    "content": "{invalid json",
                }
            }

    class MockClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            pass

        async def post(self, *args, **kwargs):
            return MockResponse()

    monkeypatch.setattr(httpx, "AsyncClient", MockClient)

    with pytest.raises(ReviewServiceError):
        await review_code(ReviewRequest(code="print('hello')"))