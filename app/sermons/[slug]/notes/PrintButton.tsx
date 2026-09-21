"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        fontSize: "0.72rem",
        fontFamily: "'Inter', system-ui, sans-serif",
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase" as const,
        color: "var(--fg-on-dark)",
        background: "var(--brand-band)",
        border: "none",
        padding: "0.6rem 1.1rem",
        borderRadius: "9999px",
        cursor: "pointer",
        boxShadow: "var(--shadow-md)",
        transition: "opacity 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.opacity = "0.88";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--shadow-sm-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.opacity = "1";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--shadow-md)";
      }}
      aria-label="Print or save as PDF"
    >
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="10" height="7" rx="1"/>
        <path d="M4 5V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        <path d="M4 9h1M4 11h6"/>
      </svg>
      Print · Save PDF
    </button>
  );
}
