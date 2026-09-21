"use client";

/**
 * Diagnostic overlay for the video mini-player, active only when the page
 * URL has ?debug=1 (or #debug). Refresh the sermon page with that query
 * param on your phone and this shows up as a small "🐞" chip — tap it to
 * expand a live log of dock-state transitions, current geometry, and any
 * JS errors, so if something still goes wrong we have a screenshot of
 * exactly what was happening right before it did, instead of just
 * "still crashing."
 *
 * Safe to ship permanently: it does nothing unless that query param is
 * present, and it never touches the player's own logic.
 */

import { useEffect, useRef, useState } from "react";
import type { DockState, DockRect } from "@/lib/useScrollDock";

interface Props {
  state: DockState;
  rect: DockRect | null;
  isPlaying: boolean;
  logRef: React.RefObject<{ t: number; msg: string }[]>;
  pushLog: (msg: string) => void;
}

function fmtTime(t: number) {
  const d = new Date(t);
  return d.toLocaleTimeString(undefined, { hour12: false }) + "." + String(d.getMilliseconds()).padStart(3, "0");
}

export default function PlayerDebugOverlay({ state, rect, isPlaying, logRef, pushLog }: Props) {
  const [open, setOpen] = useState(false);
  const [, forceTick] = useState(0);
  const [copied, setCopied] = useState(false);
  const errCountRef = useRef(0);

  // Capture JS errors / rejections into the same log so a crash leaves a
  // trail even if the page dies right after.
  useEffect(() => {
    function onError(e: ErrorEvent) {
      errCountRef.current++;
      pushLog(`ERROR: ${e.message} (${e.filename}:${e.lineno})`);
    }
    function onRejection(e: PromiseRejectionEvent) {
      errCountRef.current++;
      pushLog(`UNHANDLED REJECTION: ${String(e.reason)}`);
    }
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, [pushLog]);

  // Re-render periodically so the log/scroll numbers stay live while open.
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => forceTick((n) => n + 1), 300);
    return () => clearInterval(id);
  }, [open]);

  const scrollY = typeof window !== "undefined" ? Math.round(window.scrollY) : 0;
  const vw = typeof window !== "undefined" ? window.innerWidth : 0;
  const vh = typeof window !== "undefined" ? window.innerHeight : 0;
  const mem =
    typeof performance !== "undefined" && (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory
      ? Math.round((performance as unknown as { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize / 1048576)
      : null;

  const entries = [...logRef.current].reverse().slice(0, 60);

  function copyLog() {
    const text = [...logRef.current]
      .map((e) => `${fmtTime(e.t)}  ${e.msg}`)
      .join("\n");
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => {}
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        left: 8,
        bottom: 8,
        zIndex: 99999,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 11,
        color: "#e6f7ff",
        pointerEvents: "auto",
      }}
    >
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{
            background: "rgba(0,0,0,0.75)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 999,
            padding: "6px 10px",
            color: "#e6f7ff",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          🐞 {state}
          {errCountRef.current > 0 && (
            <span style={{ background: "#e5484d", borderRadius: 999, padding: "0 6px" }}>{errCountRef.current}</span>
          )}
        </button>
      ) : (
        <div
          style={{
            background: "rgba(0,0,0,0.88)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 10,
            padding: 10,
            width: "min(360px, calc(100vw - 32px))",
            maxHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>Video player debug</strong>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={copyLog} style={{ color: "#7dd3fc", background: "none", border: "none", padding: 0 }}>
                {copied ? "copied" : "copy log"}
              </button>
              <button onClick={() => setOpen(false)} style={{ color: "#fca5a5", background: "none", border: "none", padding: 0 }}>
                close
              </button>
            </div>
          </div>

          <div style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
            state: <b>{state}</b> · playing: <b>{String(isPlaying)}</b> · errors: <b>{errCountRef.current}</b>
            <br />
            scrollY: {scrollY} · viewport: {vw}×{vh}
            {mem !== null && <> · heap: {mem}MB</>}
            <br />
            rect: {rect ? `top ${Math.round(rect.top)}, h ${Math.round(rect.height)}` : "—"}
          </div>

          <div
            style={{
              overflowY: "auto",
              borderTop: "1px solid rgba(255,255,255,0.15)",
              paddingTop: 6,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {entries.length === 0 && <span style={{ color: "rgba(255,255,255,0.4)" }}>no events yet</span>}
            {entries.map((e, i) => (
              <div key={i} style={{ color: e.msg.startsWith("ERROR") || e.msg.startsWith("UNHANDLED") ? "#fca5a5" : "rgba(255,255,255,0.75)" }}>
                {fmtTime(e.t)} {e.msg}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
