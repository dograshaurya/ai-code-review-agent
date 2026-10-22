@'
# AI Code Review Agent

An AI-powered code review API built with FastAPI and Ollama. It analyzes submitted code for potential bugs, security risks, and code-quality issues using a locally hosted language model.

## Features

- AI-assisted code review for bugs, security, and code quality
- Configurable programming language and review focus
- Structured findings with severity, descriptions, line numbers, and suggested fixes
- Request and response validation with Pydantic
- Local LLM inference through Ollama
- HTTP error handling and request timeouts
- Automated tests for API endpoints, schemas, and error handling

## Tech Stack

- Python
- FastAPI
- Pydantic
- Ollama
- Qwen 2.5 3B
- HTTPX
- Pytest

## Requirements

- Python 3.11 or later
- Ollama installed and running
- Git

## Setup

Clone the repository:

```bash
git clone https://github.com/dograshaurya/ai-code-review-agent.git
cd ai-code-review-agent