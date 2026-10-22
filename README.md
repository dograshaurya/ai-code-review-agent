# ReviewPilot — AI Code Review Copilot

ReviewPilot is an AI-powered code review assistant that analyzes source code, identifies potential bugs and security vulnerabilities, and suggests improvements. Its AI Chat Copilot lets developers ask follow-up questions about their code and review findings.

The project combines a FastAPI backend, a Next.js frontend, and a locally running Ollama language model.

## Features

- **AI Code Review:** Analyze submitted code for potential issues.
- **Security Analysis:** Identify potential vulnerabilities, including SQL injection risks.
- **Code Quality Checks:** Highlight possible bugs and code quality concerns.
- **Severity Classification:** Organize findings by severity, from critical to informational.
- **Line References:** Provide line numbers to help locate potential issues.
- **Suggested Fixes:** Offer recommendations for addressing findings.
- **AI Chat Copilot:** Ask questions about submitted code and existing review results.
- **Quick Actions:** Explain the most serious issue, suggest fixes, or check for security risks.
- **Markdown Responses:** Display structured AI explanations and code examples.
- **Input Validation:** Validate API requests and handle service errors.

> AI-generated findings are suggestions, not guaranteed diagnoses. Always verify findings and test proposed fixes before using them in production.

## Tech Stack

**Frontend**
- Next.js
- React
- TypeScript
- Tailwind CSS
- React Markdown

**Backend**
- Python
- FastAPI
- Pydantic
- Uvicorn

**AI**
- Ollama
- Qwen 2.5 3B model

**Testing**
- Pytest
- FastAPI TestClient

## Project Structure

```text
ai-code-review-agent/
├── app/
│   ├── main.py
│   ├── schemas/
│   │   ├── review.py
│   │   └── chat.py
│   └── services/
│       ├── review_service.py
│       └── chat_service.py
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── page.tsx
│   │       ├── layout.tsx
│   │       └── globals.css
│   ├── package.json
│   └── next.config.ts
├── tests/
├── requirements.txt
├── .gitignore
└── README.md
```

## Prerequisites

Install the following before running the project:

- Python and pip
- Node.js and npm
- Ollama
- Git

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/dograshaurya/ai-code-review-agent.git
cd ai-code-review-agent
```

### 2. Set up the Python backend

Create and activate a virtual environment.

**Windows PowerShell:**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install the dependencies:

```powershell
pip install -r requirements.txt
```

Start the FastAPI server:

```powershell
uvicorn app.main:app --reload
```

The backend runs at:

`http://localhost:8000`

Interactive API documentation is available at:

`http://localhost:8000/docs`

### 3. Set up the AI model

Install Ollama and download the model:

```powershell
ollama pull qwen2.5:3b
```

Make sure Ollama is running and accessible at `http://localhost:11434`.

### 4. Set up the frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the application:

`http://localhost:3000`

Keep the backend and Ollama running while using the application.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/api/v1/reviews` | Analyze submitted code |
| POST | `/api/v1/chat` | Ask questions about code and review findings |

### Code Review Request

`POST /api/v1/reviews`

Example request:

```json
{
  "code": "print('Hello, world!')",
  "language": "python",
  "focus": ["bugs", "security", "quality"]
}
```

### AI Chat Request

`POST /api/v1/chat`

Example request:

```json
{
  "code": "print('Hello, world!')",
  "language": "python",
  "question": "Explain this code",
  "review_summary": "",
  "findings": []
}
```

See `/docs` for the complete request and response schemas.

## Running Tests

From the project root, activate the Python virtual environment and run:

```powershell
python -m pytest
```

## Production Build

To verify the frontend build:

```powershell
cd frontend
npm run build
```

## Configuration

The backend uses application settings for the Ollama URL, model name, and request timeout. Review your settings configuration before changing these values.

The frontend supports `NEXT_PUBLIC_API_URL` for configuring the backend URL. When it is not set, the frontend defaults to `http://localhost:8000`.

Do not commit API keys, passwords, environment files containing secrets, or local virtual environments.

## Project Goals

ReviewPilot is a portfolio project exploring practical AI engineering, LLM integration, API development, frontend engineering, and AI-assisted developer tools.

## Disclaimer

ReviewPilot provides AI-generated suggestions for educational and development purposes. Its output may be incomplete or incorrect and should not replace manual code review, security testing, or professional judgment.
