"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.375rem",
        fontSize: "0.7rem",
        fontWeight: 600,
        letterSpacing: "0.03em",
        color: "#fff",
        background: "#00205B",
        border: "none",
        padding: "0.5rem 0.875rem",
        borderRadius: "9999px",
        cursor: "pointer",
        fontFamily: "system-ui, sans-serif",
      }}
      aria-label="Print or save as PDF"
    >
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="10" height="7" rx="1"/>
        <path d="M4 5V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        <path d="M4 9h1M4 11h6"/>
      </svg>
      Print / Save PDF
    </button>
  );
}
