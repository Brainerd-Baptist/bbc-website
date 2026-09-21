"use client";

import { useState } from "react";

const inputClass =
  "border border-[#00205B]/20 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-[#00abc9]/40 text-[#00205B] bg-white placeholder:text-[#00205B]/40 transition";

interface Props {
  /** POST endpoint, e.g. "/api/contact/general" */
  endpoint: string;
  /** Extra fixed fields merged into the request body (e.g. { staffName, category }) */
  extraFields?: Record<string, string>;
  /** Show a phone field. Default false. */
  showPhone?: boolean;
  /** Placeholder text for the message textarea. */
  messagePlaceholder?: string;
  /** Label for the message field. Default "Message". */
  messageLabel?: string;
  /** Whether the message field is required. Default true. */
  messageRequired?: boolean;
  /** Copy shown in the success state. */
  successTitle?: string;
  successBody?: string;
  /** Submit button label. */
  submitLabel?: string;
}

export default function SimpleContactForm({
  endpoint,
  extraFields,
  showPhone = false,
  messagePlaceholder = "How can we help?",
  messageLabel = "Message",
  messageRequired = true,
  successTitle = "You're all set!",
  successBody = "Thanks for reaching out. Someone from our team will be in touch soon.",
  submitLabel = "Send",
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          ...(showPhone ? { phone } : {}),
          message,
          ...(extraFields || {}),
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Unable to submit. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl bg-[#00abc9]/10 border border-[#00abc9]/30 px-8 py-10 text-center space-y-3">
        <div className="flex justify-center">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#00abc9]/20">
            <svg className="w-6 h-6 text-[#00abc9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        </div>
        <p className="text-[#00205B] font-semibold text-lg">{successTitle}</p>
        <p className="text-[#00205B]/70 text-sm leading-relaxed max-w-sm mx-auto">{successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#00205B]">
            Name <span className="text-[#00abc9]">*</span>
          </label>
          <input
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Smith"
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#00205B]">
            Email <span className="text-[#00abc9]">*</span>
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            className={inputClass}
          />
        </div>
      </div>

      {showPhone && (
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#00205B]">Phone</label>
          <input
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(423) 555-0100"
            className={inputClass}
          />
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[#00205B]">
          {messageLabel} {messageRequired && <span className="text-[#00abc9]">*</span>}
        </label>
        <textarea
          required={messageRequired}
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={messagePlaceholder}
          className={`${inputClass} resize-none`}
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto font-condensed font-700 tracking-wide uppercase text-sm text-white px-8 py-3.5 rounded-full transition-all disabled:opacity-50"
        style={{ background: "#00abc9" }}
      >
        {submitting ? "Sending…" : submitLabel}
      </button>
    </form>
  );
}
