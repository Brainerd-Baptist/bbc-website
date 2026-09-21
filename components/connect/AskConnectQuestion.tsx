"use client";

import { useState, useRef } from "react";
import Link from "next/link";

const EXAMPLE_QUESTIONS = [
  "What time are Sunday services?",
  "What should I expect if I'm visiting for the first time?",
  "Is there childcare during service?",
  "How do I get connected to a Life Group?",
];

export default function AskConnectQuestion() {
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
      const res = await fetch("/api/site-question", {
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
    <div>
      {answer ? (
        <div className="rounded-2xl p-7 border border-[#00205B]/10 bg-[#00205B]/[0.03]">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4 text-[#00abc9]">
            {question}
          </p>
          <p className="text-[#00205B]/80 text-sm leading-relaxed">{answer}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
            <button
              onClick={handleReset}
              className="text-[#00205B]/40 text-xs hover:text-[#00205B]/70 transition-colors underline underline-offset-2"
            >
              Ask another question
            </button>
            <Link
              href="/connect/staff"
              className="text-[#00abc9] text-xs font-medium hover:text-[#00205B] transition-colors underline underline-offset-2"
            >
              Talk to a person instead
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap gap-2 mb-5 justify-center">
            {EXAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleAsk(q)}
                className="text-xs px-4 py-2 rounded-full border border-[#00205B]/15 text-[#00205B]/55 hover:border-[#00abc9]/50 hover:text-[#00205B] transition-all"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="relative">
            <textarea
              ref={inputRef}
              rows={3}
              placeholder="What do you want to know?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
              className="w-full px-5 py-4 pr-24 rounded-2xl border border-[#00205B]/20 text-sm text-[#00205B] placeholder:text-[#00205B]/35 focus:outline-none focus:ring-2 focus:ring-[#00abc9]/40 resize-none bg-white"
            />
            <button
              onClick={() => handleAsk()}
              disabled={!question.trim() || loading}
              className="absolute bottom-4 right-4 font-condensed font-700 tracking-wide uppercase text-xs text-white px-5 py-2 rounded-full transition-all disabled:opacity-30"
              style={{ background: "#00abc9" }}
            >
              {loading ? "…" : "Ask"}
            </button>
          </div>

          {error && <p className="text-red-500 text-xs text-center mt-3">{error}</p>}

          <p className="text-center mt-6">
            <Link
              href="/connect/staff"
              className="text-[#00205B]/40 text-xs hover:text-[#00abc9] transition-colors underline underline-offset-2"
            >
              Prefer to talk to a person? Contact a pastor or staff member
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
