
"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
type Finding = {
  category: "bug" | "security" | "quality";
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  description: string;
  line_number: number | null;
  suggestion: string;
};

type ReviewResult = {
  summary: string;
  findings: Finding[];
  model: string;
};

const sampleCode = `def get_user(username):
    query = "SELECT * FROM users WHERE username = '" + username + "'"
    return execute_query(query)

def divide(a, b):
    return a / b`;

const categories = [
  { id: "bugs", label: "Bugs" },
  { id: "security", label: "Security" },
  { id: "quality", label: "Code quality" },
] as const;

const severityColors: Record<string, string> = {
  critical: "text-red-300 bg-red-400/10 border-red-400/20",
  high: "text-orange-300 bg-orange-400/10 border-orange-400/20",
  medium: "text-amber-300 bg-amber-400/10 border-amber-400/20",
  low: "text-sky-300 bg-sky-400/10 border-sky-400/20",
  info: "text-slate-300 bg-slate-400/10 border-slate-400/20",
};

export default function Home() {
  const [code, setCode] = useState(sampleCode);
  const [language, setLanguage] = useState("python");
  const [focus, setFocus] = useState<string[]>([
    "bugs",
    "security",
    "quality",
  ]);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  const [question, setQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");

  async function runReview() {
    if (!code.trim()) {
      setError("Paste some code before starting a review.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL ??
          "http://localhost:8000/api/v1/reviews",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, language, focus }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "The review request failed.",
        );
      }

      setResult(data as ReviewResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} Make sure the FastAPI backend and Ollama are running.`
          : "Unable to connect to the review API.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function sendChatMessage(message?: string) {
  const userQuestion = (message ?? question).trim();

  if (!userQuestion || chatLoading) return;

  setMessages((previous) => [
    ...previous,
    { role: "user", content: userQuestion },
  ]);
  setQuestion("");
  setChatError("");
  setChatLoading(true);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/chat`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          question: userQuestion,
          review_summary: result?.summary ?? "",
          findings: result?.findings ?? [],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Unable to get an answer.");
    }

    setMessages((previous) => [
      ...previous,
      { role: "assistant", content: data.answer },
    ]);
  } catch (err) {
    setChatError(
      err instanceof Error ? err.message : "Something went wrong."
    );
  } finally {
    setChatLoading(false);
  }
}

  function toggleFocus(id: string) {
    setFocus((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  return (
    <main className="min-h-screen bg-[#090b10] text-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-[#090b10]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300 ring-1 ring-violet-400/20">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="M8 8 4 12l4 4M16 8l4 4-4 4M14 5l-4 14" />
              </svg>
            </div>
            <div>
              <h1 className="font-semibold tracking-tight">
                Review<span className="text-violet-300">Pilot</span>
              </h1>
              <p className="text-xs text-slate-500">
                AI Code Review Copilot
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-1.5 text-xs text-emerald-300 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Local AI workspace
          </div>

          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            API docs ↗
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-5 py-8 lg:px-8">
        <section className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
            Developer workspace
          </p>
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Ship better code.
                <span className="block text-slate-500">
                  Catch issues before they ship.
                </span>
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Analyze code for potential bugs, security vulnerabilities,
                and maintainability issues with your local AI model.
              </p>
            </div>
            <button
              onClick={runReview}
              disabled={loading || focus.length === 0}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/40 transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Reviewing code...
                </>
              ) : (
                <>✳ Run code review</>
              )}
            </button>
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <section className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#10131b]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold">Source code</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Paste the code you want to inspect
                </p>
              </div>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="rounded-lg border border-white/10 bg-[#171b26] px-3 py-2 text-sm text-slate-200 outline-none focus:border-violet-400/60"
                aria-label="Programming language"
              >
                {[
                  "python",
                  "javascript",
                  "typescript",
                  "php",
                  "java",
                  "go",
                  "rust",
                  "sql",
                ].map((item) => (
                  <option key={item} value={item}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              <span className="ml-2 text-xs text-slate-500">
                review_target.{language === "python" ? "py" : language}
              </span>
              <button
                onClick={() => setCode("")}
                className="ml-auto text-xs text-slate-500 transition hover:text-white"
              >
                Clear
              </button>
            </div>

            <div className="flex min-h-[380px] bg-[#0c0f16] py-4">
              <div
                aria-hidden="true"
                className="select-none border-r border-white/[0.05] px-3 text-right font-mono text-xs leading-6 text-slate-600 sm:px-4"
              >
                {Array.from(
                  { length: Math.max(1, code.split("\n").length) },
                  (_, index) => (
                    <div key={index}>{index + 1}</div>
                  ),
                )}
              </div>
              <textarea
                value={code}
                onChange={(event) => setCode(event.target.value)}
                spellCheck={false}
                aria-label="Code to review"
                placeholder="Paste your code here..."
                className="min-h-[380px] w-full resize-y bg-transparent px-4 font-mono text-[13px] leading-6 text-slate-200 outline-none placeholder:text-slate-700"
              />
            </div>

            <div className="border-t border-white/[0.07] p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Review focus
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const selected = focus.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      onClick={() => toggleFocus(category.id)}
                      aria-pressed={selected}
                      className={`rounded-lg border px-3 py-2 text-xs transition ${
                        selected
                          ? "border-violet-400/30 bg-violet-400/10 text-violet-200"
                          : "border-white/[0.08] bg-white/[0.02] text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {selected ? "✓ " : "+ "}
                      {category.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-slate-600">
                Review suggestions are AI-generated and should be verified.
              </p>
            </div>
          </section>

          <section className="flex min-h-[500px] flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-[#10131b]">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold">Review results</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Findings and recommended improvements
                </p>
              </div>
              <span className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-xs text-slate-400">
                {result ? `${result.findings.length} findings` : "Awaiting review"}
              </span>
            </div>

            {error && (
              <div
                role="alert"
                className="m-5 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4 text-sm leading-6 text-red-200"
              >
                {error}
              </div>
            )}

            {loading && (
              <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-4 h-9 w-9 animate-spin rounded-full border-2 border-violet-400/20 border-t-violet-400" />
                <p className="text-sm font-medium">Analyzing your code</p>
                <p className="mt-2 text-xs text-slate-500">
                  Looking for bugs, security risks, and quality issues...
                </p>
              </div>
            )}

            {!loading && !result && !error && (
              <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/[0.07] text-2xl text-violet-300">
                  ✳
                </div>
                <h4 className="text-base font-medium">Ready for review</h4>
                <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                  Run your first review to see findings, severity levels, and
                  suggested fixes here.
                </p>
                <button
                  onClick={runReview}
                  className="mt-5 text-sm font-medium text-violet-300 hover:text-violet-200"
                >
                  Analyze sample code →
                </button>
              </div>
            )}

            {!loading && result && (
              <div className="flex-1 space-y-5 overflow-y-auto p-5">
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    AI summary
                  </p>
                  <p className="text-sm leading-6 text-slate-300">
                    {result.summary}
                  </p>
                  <p className="mt-3 text-xs text-slate-600">
                    Model: {result.model}
                  </p>
                </div>

                {result.findings.length === 0 ? (
                  <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.04] p-5">
                    <p className="font-medium text-emerald-300">
                      No actionable findings returned
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      This does not guarantee that the code is free of defects.
                    </p>
                  </div>
                ) : (
                  result.findings.map((finding, index) => (
                    <article
                      key={`${finding.title}-${index}`}
                      className="rounded-xl border border-white/[0.08] bg-[#0c0f16] p-4"
                    >
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                            severityColors[finding.severity] ??
                            severityColors.info
                          }`}
                        >
                          {finding.severity}
                        </span>
                        <span className="text-xs text-slate-500">
                          {finding.category}
                        </span>
                        {finding.line_number != null && (
                          <span className="ml-auto font-mono text-xs text-slate-500">
                            Line {finding.line_number}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-slate-100">
                        {finding.title}
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {finding.description}
                      </p>
                      <div className="mt-4 rounded-lg border border-emerald-400/10 bg-emerald-400/[0.04] p-3">
                        <p className="mb-1 text-xs font-semibold text-emerald-300">
                          Suggested fix
                        </p>
                        <p className="text-sm leading-6 text-slate-300">
                          {finding.suggestion}
                        </p>
                      </div>
                    </article>
                  ))
                )}
              </div>
            )}
          </section>
        </div>
        {/* AI Chat Copilot */}
        <section className="mt-6 rounded-2xl border border-white/[0.09] bg-[#10131b] p-5">
          <div className="mb-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">AI Chat Copilot</h3>
              <button
                type="button"
                onClick={() => {
                  setMessages([]);
                  setChatError("");
                  setQuestion("");
                }}
                disabled={chatLoading || messages.length === 0}
                className="text-xs text-slate-500 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Clear chat
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Ask questions about your code and review findings.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
            {[
              "Explain the most serious issue",
              "Show me how to fix it",
              "Check for security risks",
            ].map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void sendChatMessage(prompt)}
                disabled={chatLoading || !code.trim()}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300 transition hover:border-violet-400/40 hover:bg-violet-400/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
          </div>

          <div className="mb-4 max-h-80 space-y-3 overflow-y-auto">
            {messages.length === 0 && (
              <p className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-slate-400">
                Try asking: “Explain the most serious issue” or “Show me how to fix this code.”
              </p>
            )}

            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={`rounded-xl p-3 text-sm ${
                  item.role === "user"
                    ? "ml-8 bg-violet-500/15 text-violet-100"
                    : "mr-4 bg-white/[0.04] text-slate-300"
                }`}
              >
                <p className="mb-1 text-xs font-semibold text-slate-500">
                  {item.role === "user" ? "YOU" : "REVIEWPILOT"}
                </p>
                {item.role === "assistant" ? (
                    <div className="break-words text-sm leading-6 [&_h1]:mb-2 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_ol]:my-2 [&_p]:my-2 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-black/40 [&_pre]:p-3 [&_code]:font-mono [&_code]:text-violet-200">
                      <ReactMarkdown>{item.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap break-words">{item.content}</p>
                  )}
              </div>
            ))}

            {chatLoading && (
              <p className="text-sm text-violet-300">ReviewPilot is thinking...</p>
            )}
          </div>

          {chatError && (
            <p role="alert" className="mb-3 text-sm text-red-400">
              {chatError}
            </p>
          )}

          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              void sendChatMessage();
            }}
          >
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask about your code..."
              maxLength={2000}
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0c0f16] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-400/60"
            />

            <button
              type="submit"
              disabled={chatLoading || !question.trim()}
              className="rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {chatLoading ? "Thinking..." : "Ask AI"}
            </button>
          </form>
        </section>    
        <footer className="mt-6 flex flex-col justify-between gap-2 border-t border-white/[0.06] pt-5 text-xs text-slate-600 sm:flex-row">
          <span>ReviewPilot · AI Code Review Copilot</span>
          <span>FastAPI · Ollama · Qwen 2.5</span>
        </footer>
      </div>
    </main>
  );
}
