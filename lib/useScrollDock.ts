"use client";

/**
 * Scroll-driven docking state machine for a "portal" video player.
 *
 * IMPORTANT — why this exists (read before touching the thresholds):
 * A previous implementation toggled the CSS `position` property of the
 * player's wrapper between static and fixed on every IntersectionObserver
 * firing. That forces the browser to tear the element out of normal layout
 * flow and reflow everything around it, repeatedly, during momentum scroll
 * on mobile Safari — which is what caused repeated production crashes
 * (see git history on components/sermons/SermonPlayer.tsx).
 *
 * This hook never changes `position`. The player element this hook drives
 * is expected to be `position: fixed` for its entire life. All this hook
 * does is decide, via a single rAF-throttled scroll/resize listener (never
 * an IntersectionObserver), which of three *rectangles* the caller should
 * position that already-fixed element at: "inline" (matches a spacer
 * element in the page), "docked" (a small corner/shelf position), or
 * "expanded" (a large centered overlay, entered manually — see below).
 *
 * Hysteresis bands keep the dock/undock transition from flickering right
 * at the scroll boundary the way the old IntersectionObserver(threshold:0)
 * setup did.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export type DockState = "inline" | "docked" | "expanded";

export interface DockRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface LogEntry {
  t: number;
  msg: string;
}

interface UseScrollDockArgs {
  spacerRef: React.RefObject<HTMLElement | null>;
  /** Docking only ever engages while this is true (i.e. while playing). */
  enabled: boolean;
  /** Keep a rolling log for the debug overlay. Free when false. */
  debug?: boolean;
}

// How far past the top of the viewport the spacer must scroll before we
// dock, and how far back it must return before we undock. The gap between
// these two numbers is the hysteresis band.
const DOCK_AT_BOTTOM_PX = 0; // spacer fully scrolled above viewport top
const UNDOCK_AT_BOTTOM_PX = 140; // must come back down meaningfully before undocking

export function useScrollDock({ spacerRef, enabled, debug }: UseScrollDockArgs) {
  const [state, setStateRaw] = useState<DockState>("inline");
  const [rect, setRect] = useState<DockRect | null>(null);
  const stateRef = useRef<DockState>("inline");

  const tickingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const logRef = useRef<LogEntry[]>([]);

  const pushLog = useCallback(
    (msg: string) => {
      if (!debug) return;
      logRef.current.push({ t: Date.now(), msg });
      if (logRef.current.length > 300) logRef.current.shift();
    },
    [debug]
  );

  const setState = useCallback(
    (next: DockState | ((prev: DockState) => DockState)) => {
      setStateRaw((prev) => {
        const resolved = typeof next === "function" ? (next as (p: DockState) => DockState)(prev) : next;
        if (resolved !== prev) {
          stateRef.current = resolved;
          pushLog(`state: ${prev} -> ${resolved}`);
        }
        return resolved;
      });
    },
    [pushLog]
  );

  const enabledRef = useRef(enabled);
  useEffect(() => {
    enabledRef.current = enabled;
    if (!enabled) setState("inline");
  }, [enabled, setState]);

  // This listener is attached once and always keeps `rect` current — even
  // while paused — so the player has a correct "inline" position to render
  // at from the very first paint. Only the dock/undock *transitions* are
  // gated behind `enabled` (docking only while actually playing); simply
  // measuring where the spacer is must never be gated, or the player has
  // nowhere valid to sit until playback starts.
  useEffect(() => {
    function measure() {
      tickingRef.current = false;
      const el = spacerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });

      if (!enabledRef.current) return; // stays "inline"; see effect above

      setState((prev) => {
        if (prev === "expanded") return prev; // only closed explicitly by the user
        if (prev === "inline" && r.bottom <= DOCK_AT_BOTTOM_PX) return "docked";
        if (prev === "docked" && r.bottom > UNDOCK_AT_BOTTOM_PX) return "inline";
        return prev;
      });
    }

    function onScrollOrResize() {
      if (tickingRef.current) return;
      tickingRef.current = true;
      rafRef.current = requestAnimationFrame(measure);
    }

    measure();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spacerRef]);

  return { state, rect, setState, pushLog, logRef, stateRef };
}
