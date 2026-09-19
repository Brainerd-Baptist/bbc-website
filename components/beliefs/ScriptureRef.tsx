"use client";

import { useState, useRef, useEffect } from "react";

type PopupData = {
  text: string;
  translation: string;
  loading: boolean;
  error: boolean;
};

export default function ScriptureRef({ reference }: { reference: string }) {
  const [popup, setPopup] = useState<PopupData | null>(null);
  const [above, setAbove] = useState(true);
  const cache = useRef<Record<string, string>>({});
  const btnRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLSpanElement>(null);

  async function handleClick() {
    if (popup) {
      setPopup(null);
      return;
    }

    // Decide whether popup opens above or below based on space
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setAbove(rect.top > 180);
    }

    // Return cached result instantly
    if (cache.current[reference]) {
      const [text, translation] = cache.current[reference].split("\0");
      setPopup({ text, translation, loading: false, error: false });
      return;
    }

    setPopup({ text: "", translation: "", loading: true, error: false });

    try {
      // Convert en/em dashes to hyphens for the API
      const apiRef = reference.replace(/[–—]/g, "-");
      const res = await fetch(`/api/scripture?p=${encodeURIComponent(apiRef)}`);
      if (!res.ok) throw new Error("not found");
      const data = await res.json();

      // Prefer full text; fall back to joining verses
      const text =
        data.text?.trim() ||
        (data.verses as Array<{ text: string }>)
          ?.map((v) => v.text)
          .join(" ")
          .trim() ||
        "";

      if (!text) throw new Error("empty");
      const translation = (data.translation_id as string)?.toUpperCase() || "WEB";
      cache.current[reference] = `${text}\0${translation}`;
      setPopup({ text, translation, loading: false, error: false });
    } catch {
      setPopup({ text: "", translation: "", loading: false, error: true });
    }
  }

  // Close on outside click or Escape
  useEffect(() => {
    if (!popup) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPopup(null);
    }
    function onDown(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (
        !btnRef.current?.contains(target) &&
        !popupRef.current?.contains(target)
      ) {
        setPopup(null);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [popup]);

  return (
    <span className="relative inline-block">
      <button
        ref={btnRef}
        type="button"
        onClick={handleClick}
        className="text-xs font-semibold tracking-wide underline decoration-dotted underline-offset-2 transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00abc9] rounded"
        style={{ color: "#00abc9" }}
        aria-expanded={!!popup}
        aria-haspopup="true"
      >
        {reference}
      </button>

      {popup && (
        <span
          ref={popupRef}
          role="tooltip"
          className={`
            absolute z-50 w-72 max-w-[calc(100vw-2rem)]
            rounded-2xl shadow-2xl border border-white/10 p-5
            ${above ? "bottom-full mb-2" : "top-full mt-2"}
            left-1/2 -translate-x-1/2
          `}
          style={{ background: "#00142a" }}
        >
          {/* Arrow */}
          <span
            className={`
              absolute left-1/2 -translate-x-1/2 w-0 h-0
              border-x-[6px] border-x-transparent
              ${above
                ? "top-full border-t-[7px] border-t-[#00142a]"
                : "bottom-full border-b-[7px] border-b-[#00142a]"}
            `}
          />

          <span
            className="block text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: "#00abc9" }}
          >
            {reference}{popup.translation ? ` · ${popup.translation}` : ""}
          </span>

          {popup.loading ? (
            <span className="block text-white/40 text-xs italic">Loading…</span>
          ) : popup.error ? (
            <span className="block text-white/40 text-xs italic">
              Couldn't load this passage right now.
            </span>
          ) : (
            <span className="block text-white/80 text-sm leading-relaxed">
              {popup.text}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
