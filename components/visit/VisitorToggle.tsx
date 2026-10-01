"use client";

export type VisitorType = "first" | "returning";

export default function VisitorToggle({
  value,
  onChange,
}: {
  value: VisitorType;
  onChange: (v: VisitorType) => void;
}) {
  return (
    <section className="py-10 px-6 bg-surface border-b border-border">
      <div className="max-w-md mx-auto text-center">
        <p className="text-fg-muted text-xs uppercase tracking-widest font-semibold mb-4">
          Tell us a little about you
        </p>
        <div
          className="inline-flex rounded-full p-1 border border-border-strong bg-surface-raised"
          role="group"
          aria-label="Visitor type"
        >
          <button
            type="button"
            onClick={() => onChange("first")}
            aria-pressed={value === "first"}
            className="font-condensed font-700 tracking-wide uppercase text-sm px-6 py-3 rounded-full transition-colors"
            style={{
              background: value === "first" ? "var(--accent-solid)" : "transparent",
              color: value === "first" ? "var(--fg-on-accent)" : "var(--fg-muted)",
            }}
          >
            First Time Here
          </button>
          <button
            type="button"
            onClick={() => onChange("returning")}
            aria-pressed={value === "returning"}
            className="font-condensed font-700 tracking-wide uppercase text-sm px-6 py-3 rounded-full transition-colors"
            style={{
              background: value === "returning" ? "var(--accent-solid)" : "transparent",
              color: value === "returning" ? "var(--fg-on-accent)" : "var(--fg-muted)",
            }}
          >
            Been Around a While
          </button>
        </div>
      </div>
    </section>
  );
}
