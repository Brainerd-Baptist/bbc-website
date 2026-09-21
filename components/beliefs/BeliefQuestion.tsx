"use client";

import { useState, useRef } from "react";

const EXAMPLE_QUESTIONS = [
  "What do you believe about baptism?",
  "Is communion open to everyone?",
  "What translation of the Bible do you use?",
  "What's the difference between Life Groups and Sunday school?",
];

export default function BeliefQuestion() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  async function handleAsk(q?: string) {
    const text = q ?? question;
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setAnswer("");
    if (q) setQuestion(q);

    try {
      const res = await fetch("/api/belief-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setAnswer(data.answer);
    } catch {
      setError("Something went wrong. Try asking again.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setQuestion("");
    setAnswer("");
    setError("");
    inputRef.current?.focus();
  }

  return (
    <section className="py-24 px-6" style={{ background: "var(--brand-ink)" }}>
      <div className="max-w-2xl mx-auto">
        <p className="eyebrow text-center mb-3" style={{ color: "var(--accent-text)" }}>Have a Question?</p>
        <h2
          className="font-condensed font-900 text-white text-center mb-4"
          style={{ fontSize: "clamp(2.4rem, 6vw, 3.2rem)", letterSpacing: "-0.02em", lineHeight: 1 }}
        >
          Ask Us What We Believe
        </h2>
        <p className="text-white/45 text-center mb-10 text-sm max-w-sm mx-auto">
          No question is too small or too basic. Ask anything about our beliefs, practices, or what to expect.
        </p>

        {answer ? (
          <div className="rounded-2xl p-7 border border-white/10" style={{ background: "var(--surface-on-dark)" }}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--accent-text)" }}>
              {question}
            </p>
            <p className="text-white/80 text-sm leading-relaxed">{answer}</p>
            <button
              onClick={handleReset}
              className="mt-6 text-white/30 text-xs hover:text-white/55 transition-colors underline underline-offset-2"
            >
              Ask another question
            </button>
          </div>
        ) : (
          <div>
            {/* Example chips */}
            <div className="flex flex-wrap gap-2 mb-5 justify-center">
              {EXAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleAsk(q)}
                  className="text-xs px-4 py-2 rounded-full border border-white/15 text-white/50 hover:border-white/35 hover:text-white/75 transition"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="relative">
              <textarea
                ref={inputRef}
                rows={3}
                placeholder="What do you want to know about what we believe?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAsk();
                  }
                }}
                className="w-full px-5 py-4 rounded-2xl border border-white/15 text-sm text-white placeholder:text-white/25 focus:border-white/30 resize-none"
                style={{ background: "var(--surface-on-dark)" }}
              />
              <button
                onClick={() => handleAsk()}
                disabled={!question.trim() || loading}
                className="absolute bottom-4 right-4 font-condensed font-700 tracking-wide uppercase text-xs text-white px-5 py-2 rounded-full transition disabled:opacity-30"
                style={{ background: "var(--accent)" }}
              >
                {loading ? "…" : "Ask"}
              </button>
            </div>

            {error && (
              <p className="text-danger-on-dark text-xs text-center mt-3">{error}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
