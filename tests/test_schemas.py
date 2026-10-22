import pytest
from pydantic import ValidationError

from app.schemas.review import ReviewFinding, ReviewRequest


def test_review_request_accepts_valid_code():
    request = ReviewRequest(code="print('hello')")

    assert request.language == "python"
    assert request.code == "print('hello')"
    assert "bugs" in request.focus


def test_review_request_rejects_empty_code():
    with pytest.raises(ValidationError):
        ReviewRequest(code="")


def test_review_request_rejects_invalid_focus():
    with pytest.raises(ValidationError):
        ReviewRequest(code="print('hello')", focus=["performance"])


def test_review_finding_accepts_valid_finding():
    finding = ReviewFinding(
        category="bug",
        severity="high",
        title="Division by zero",
        description="The divisor may be zero.",
        line_number=2,
        suggestion="Check the divisor before dividing.",
    )

    assert finding.severity == "high"
    assert finding.line_number == 2


def test_review_finding_rejects_invalid_severity():
    with pytest.raises(ValidationError):
        ReviewFinding(
            category="bug",
            severity="urgent",
            title="Example",
            description="Example description",
            suggestion="Example suggestion",
        )

def test_review_response_accepts_empty_findings():
    from app.schemas.review import ReviewResponse

    response = ReviewResponse(
        summary="No actionable issues found.",
        findings=[],
        model="test-model",
    )

    assert response.findings == []


def test_review_response_rejects_invalid_finding():
    from app.schemas.review import ReviewResponse

    with pytest.raises(ValidationError):
        ReviewResponse(
            summary="Review completed.",
            findings=[
                {
                    "category": "bug",
                    "severity": "urgent",
                    "title": "Invalid severity",
                    "description": "This should fail validation.",
                    "suggestion": "Use a supported severity.",
                }
            ],
            model="test-model",
        )
