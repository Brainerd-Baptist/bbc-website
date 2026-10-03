"use client";

import { useState } from "react";
import ScripturePopup from "./ScripturePopup";

interface Props {
  passage: string;
  accentColor?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

/**
 * Wraps any passage reference (the hero chip, the Scripture chip, an inline
 * manuscript reference) so clicking it opens the passage inline — reusing
 * the same /api/scripture-backed popup everywhere a reference appears,
 * instead of sending people out to Bible Gateway in a new tab.
 */
export default function PassageLink({ passage, accentColor = "#00abc9", className, style, children }: Props) {
  const [open, setOpen] = useState(false);

  if (!passage) return <>{children}</>;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
        style={{
          background: "none", border: "none", padding: 0, margin: 0,
          font: "inherit", color: "inherit", cursor: "pointer", textAlign: "inherit",
          ...style,
        }}
      >
        {children}
      </button>
      {open && <ScripturePopup reference={passage} accentColor={accentColor} onClose={() => setOpen(false)} />}
    </>
  );
}
