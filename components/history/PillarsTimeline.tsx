"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  PILLARS,
  STORY,
  TIMELINE_EVENTS,
  TIMELINE_MARKS,
  type PillarKey,
} from "@/lib/history-timeline";

/* ── Pillar styling ─────────────────────────────────────────────────────────
   Colours come from the site's theme tokens so light/dark just work. Each pillar
   also has its own icon shape, so nothing relies on colour alone. */
const PILLAR_COLOR: Record<PillarKey, string> = {
  begin: "var(--gold-a)",
  build: "var(--accent-text)",
  plant: "var(--success-text)",
  mission: "var(--danger-text)",
  together: "var(--fg)",
};

const PILLAR_KEYS = Object.keys(PILLARS) as PillarKey[];

function PillarIcon({ p, size = 14 }: { p: PillarKey; size?: number }) {
  const paths: Record<PillarKey, React.ReactNode> = {
    begin: (
      <>
        <circle cx="10" cy="10" r="7" fill="currentColor" />
        <circle cx="10" cy="10" r="2.6" fill="var(--surface-raised)" />
      </>
    ),
    build: <path d="M10 2 18 9v9H2V9z" fill="currentColor" />,
    plant: <path d="M10 2c3 3 5 6 5 9a5 5 0 0 1-10 0c0-3 2-6 5-9z" fill="currentColor" />,
    together: (
      <path
        d="M2 4h7v5H2zM11 4h7v5h-7zM2 11h3v5H2zM7 11h7v5H7zM16 11h2v5h-2z"
        fill="currentColor"
      />
    ),
    mission: <path d="M10 1.5 18.5 10 10 18.5 1.5 10z" fill="currentColor" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="flex-none"
      style={{ color: PILLAR_COLOR[p] }}
    >
      {paths[p]}
    </svg>
  );
}

/* ── Rows (events + anniversary marks + the 2013-to-today gap), in year order ── */
type Row =
  | { kind: "event"; year: number; order: number; index: number }
  | { kind: "mark"; year: number; order: number; index: number }
  | { kind: "gap"; year: number; order: number };

const NAV_OFFSET = 64; // fixed site nav (h-16)

const NUMBER_PICKS = ["85,000", "$40,670", "700", "$562,500", "$287,087"];

const sentences = (t: string) => t.split(/(?<=[.?!])\s+/);
const TOTAL_SENTENCES = STORY.reduce(
  (a, c) => a + c.paragraphs.reduce((b, q) => b + sentences(q.text).length, 0),
  0,
);
const RATES = [1, 1.15, 0.9];

export default function PillarsTimeline() {
  const [active, setActive] = useState<Set<PillarKey>>(new Set(PILLAR_KEYS));
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [flash, setFlash] = useState<string | null>(null);
  const [now, setNow] = useState<string | null>(null);
  const [decade, setDecade] = useState<number | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // ── Rows ──
  const rows = useMemo<Row[]>(() => {
    const r: Row[] = [
      ...TIMELINE_EVENTS.map((e, index): Row => ({ kind: "event", year: e.year, order: 1, index })),
      ...TIMELINE_MARKS.map(
        (m, index): Row => ({ kind: "mark", year: m.year, order: m.future ? 3 : 0, index }),
      ),
      { kind: "gap", year: 2014, order: 0 },
    ];
    return r.sort((a, b) => a.year - b.year || a.order - b.order);
  }, []);

  const decadeStarts = useMemo(() => {
    const seen = new Map<number, number>(); // decade -> row index
    rows.forEach((row, i) => {
      const d = Math.floor(row.year / 10) * 10;
      if (!seen.has(d)) seen.set(d, i);
    });
    return seen;
  }, [rows]);

  const scrollToEl = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const bar = barRef.current?.offsetHeight ?? 0;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET - bar - 12 });
  }, []);

  const togglePillar = (k: PillarKey) =>
    setActive((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  // ── Decade scroll-spy ──
  useEffect(() => {
    const onScroll = () => {
      const bar = (barRef.current?.getBoundingClientRect().bottom ?? 0) + 40;
      let cur: number | null = null;
      decadeStarts.forEach((rowIdx, d) => {
        const el = document.getElementById(`row-${rowIdx}`);
        if (el && el.getBoundingClientRect().top <= bar) cur = d;
      });
      setDecade(cur);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [decadeStarts]);

  const decadeList = useMemo(() => {
    const l: number[] = [];
    for (let y = 1920; y <= 2020; y += 10) l.push(y);
    return l;
  }, []);

  const decadeHasContent = (d: number) =>
    TIMELINE_EVENTS.some((e) => active.has(e.pillar) && Math.floor(e.year / 10) * 10 === d) ||
    TIMELINE_MARKS.some((m) => Math.floor(m.year / 10) * 10 === d) ||
    d === 2010;

  // ── Narration ──
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const canSpeak = useSyncExternalStore(
    () => () => {},
    () => "speechSynthesis" in window,
    () => true,
  );
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceName, setVoiceName] = useState<string>("");
  const [rate, setRate] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const [cap, setCap] = useState({ title: "", text: "", progress: 0, chapter: -1 });
  const pos = useRef({ c: 0, p: 0, s: 0 });
  const tok = useRef(0);
  const playingRef = useRef(false);
  const rateRef = useRef(1);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    synthRef.current = synth;
    const load = () => {
      const vs = synth.getVoices().filter((v) => /^en(-|_|$)/i.test(v.lang));
      if (!vs.length) return;
      const rank = (v: SpeechSynthesisVoice) =>
        /natural|neural|premium|enhanced/i.test(v.name)
          ? 0
          : /google us|samantha|aaron|daniel|ava|allison|evan/i.test(v.name)
            ? 1
            : /en-us/i.test(v.lang)
              ? 2
              : 3;
      vs.sort((a, b) => rank(a) - rank(b));
      let saved: string | null = null;
      try {
        saved = localStorage.getItem("bbcVoice");
      } catch {}
      const pick = vs.find((v) => v.name === saved) ?? vs[0];
      voiceRef.current = pick;
      setVoices(vs);
      setVoiceName(pick.name);
    };
    load();
    synth.addEventListener?.("voiceschanged", load);
    return () => {
      synth.removeEventListener?.("voiceschanged", load);
      synth.cancel();
    };
  }, []);

  const doneCount = () => {
    const { c, p, s } = pos.current;
    let n = 0;
    for (let i = 0; i < c; i++) STORY[i].paragraphs.forEach((q) => (n += sentences(q.text).length));
    for (let i = 0; i < p; i++) n += sentences(STORY[c].paragraphs[i].text).length;
    return n + s;
  };

  const focusRef = (ref: string | null) => {
    setNow(null);
    if (!ref) return;
    let id: string | null = null;
    if (ref === "#gap") id = "gap-row";
    else if (ref.startsWith("#mark")) {
      const y = Number(ref.slice(5));
      const mi = TIMELINE_MARKS.findIndex((m) => m.year === y);
      if (mi >= 0) id = `mark-${mi}`;
    } else {
      const i = TIMELINE_EVENTS.findIndex((e) => e.title === ref);
      if (i >= 0) {
        const p = TIMELINE_EVENTS[i].pillar;
        setActive((s) => (s.has(p) ? s : new Set(s).add(p)));
        id = `ev-${i}`;
      }
    }
    if (!id) return;
    setNow(id);
    // wait a frame so a re-shown pillar has rendered before measuring
    requestAnimationFrame(() => {
      const el = document.getElementById(id!);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const bar = barRef.current?.offsetHeight ?? 0;
      if (r.top < NAV_OFFSET + bar + 20 || r.bottom > window.innerHeight - 110) scrollToEl(id!);
    });
  };

  const speakRef = useRef<() => void>(() => {});
  const speak = () => {
    const synth = synthRef.current;
    if (!synth) return;
    const my = ++tok.current;
    synth.cancel();
    const { c, p, s } = pos.current;
    const ch = STORY[c];
    const para = ch.paragraphs[p];
    const ss = sentences(para.text);
    const text = ss[s];
    setCap({
      title: `Chapter ${c + 1} · ${ch.title}`,
      text,
      progress: (doneCount() / TOTAL_SENTENCES) * 100,
      chapter: c,
    });
    if (s === 0) focusRef(para.ref);
    const utt = new SpeechSynthesisUtterance(text);
    if (voiceRef.current) utt.voice = voiceRef.current;
    utt.lang = voiceRef.current ? voiceRef.current.lang : "en-US";
    utt.rate = rateRef.current * 0.95;
    utt.onend = () => {
      if (my !== tok.current || !playingRef.current) return;
      const last = pos.current.s === ss.length - 1;
      const gapMs = last ? (pos.current.p === ch.paragraphs.length - 1 ? 1100 : 550) : 150;
      if (++pos.current.s >= ss.length) {
        pos.current.s = 0;
        if (++pos.current.p >= ch.paragraphs.length) {
          pos.current.p = 0;
          if (++pos.current.c >= STORY.length) {
            playingRef.current = false;
            tok.current++;
            setPlaying(false);
            pos.current = {
              c: STORY.length - 1,
              p: STORY[STORY.length - 1].paragraphs.length - 1,
              s: 0,
            };
            setCap((x) => ({ ...x, progress: 100, text: "The end. Thank you for listening." }));
            return;
          }
        }
      }
      setTimeout(() => {
        if (my === tok.current && playingRef.current) speakRef.current();
      }, gapMs);
    };
    utt.onerror = (e) => {
      if (my !== tok.current) return;
      if (e.error !== "interrupted" && e.error !== "canceled") {
        playingRef.current = false;
        setPlaying(false);
      }
    };
    synth.speak(utt);
  };
  useEffect(() => {
    speakRef.current = speak;
  });

  const start = (c: number) => {
    pos.current = { c, p: 0, s: 0 };
    playingRef.current = true;
    setPlaying(true);
    setPlayerOpen(true);
    speak();
  };
  const pause = () => {
    playingRef.current = false;
    tok.current++;
    setPlaying(false);
    synthRef.current?.cancel();
  };
  const resume = () => {
    playingRef.current = true;
    setPlaying(true);
    speak();
  };
  const stop = () => {
    pause();
    setPlayerOpen(false);
    setNow(null);
  };
  const cycleRate = () => {
    const next = RATES[(RATES.indexOf(rateRef.current) + 1) % RATES.length];
    rateRef.current = next;
    setRate(next);
    if (playingRef.current) speak();
  };

  return (
    <div
      className="history-timeline"
      style={{ paddingBottom: playerOpen ? "6rem" : undefined }}
    >
      {/* Sticky filter + decade bar */}
      <div
        ref={barRef}
        className="sticky z-20 border-b backdrop-blur-md"
        style={{
          top: NAV_OFFSET,
          background: "var(--surface-overlay)",
          borderColor: "var(--border)",
        }}
      >
        <div className="max-w-4xl mx-auto px-5 py-3 flex flex-col gap-2.5">
          <div
            className="flex gap-2 overflow-x-auto sm:flex-wrap"
            style={{ scrollbarWidth: "none" }}
            role="group"
            aria-label="Show or hide pillars"
          >
            {PILLAR_KEYS.map((k) => {
              const on = active.has(k);
              const n = TIMELINE_EVENTS.filter((e) => e.pillar === k).length;
              return (
                <button
                  key={k}
                  type="button"
                  aria-pressed={on}
                  onClick={() => togglePillar(k)}
                  className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] font-medium transition-opacity"
                  style={{
                    borderColor: "var(--border-strong)",
                    background: on ? "var(--surface-raised)" : "transparent",
                    color: "var(--fg)",
                    opacity: on ? 1 : 0.5,
                  }}
                >
                  <PillarIcon p={k} />
                  {PILLARS[k].label}
                  <span className="tabular-nums text-fg-muted">{n}</span>
                </button>
              );
            })}
          </div>
          <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {decadeList.map((d) => (
              <button
                key={d}
                type="button"
                disabled={!decadeHasContent(d)}
                onClick={() => {
                  const idx = decadeStarts.get(d);
                  if (idx !== undefined) scrollToEl(`row-${idx}`);
                }}
                className="flex-1 min-w-[52px] text-left text-xs font-medium tabular-nums px-1.5 py-1 disabled:opacity-35"
                style={{
                  color: decade === d ? "var(--fg)" : "var(--fg-muted)",
                  borderTop: `3px solid ${decade === d ? "var(--fg)" : "var(--border-strong)"}`,
                }}
              >
                {d}s
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 pt-10 pb-16">
        {/* By the numbers */}
        <section aria-labelledby="nums-h" className="mb-10">
          <h2
            id="nums-h"
            className="font-condensed font-700 tracking-widest uppercase text-xs mb-3"
            style={{ color: "var(--fg-muted)" }}
          >
            Done together, by the numbers
          </h2>
          <ul
            className="grid gap-px rounded-2xl overflow-hidden border"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              background: "var(--border)",
              borderColor: "var(--border)",
            }}
          >
            {NUMBER_PICKS.map((n) => {
              const i = TIMELINE_EVENTS.findIndex((e) => e.figure === n);
              const e = TIMELINE_EVENTS[i];
              return (
                <li key={n}>
                  <button
                    type="button"
                    className="flex flex-col gap-1 w-full h-full text-left p-4 hover:bg-[var(--hover-subtle)]"
                    style={{ background: "var(--surface-raised)" }}
                    onClick={() => {
                      setActive((s) => (s.has("together") ? s : new Set(s).add("together")));
                      requestAnimationFrame(() => scrollToEl(`ev-${i}`));
                      setFlash(`ev-${i}`);
                      setTimeout(() => setFlash(null), 1600);
                    }}
                  >
                    <b
                      className="font-condensed font-800 text-3xl leading-none"
                      style={{ color: "var(--accent-text)" }}
                    >
                      {n}
                    </b>
                    <small className="text-[13px] leading-snug text-fg-muted">{e.figureLabel}</small>
                    <em className="not-italic text-xs tabular-nums text-fg-muted">{e.date}</em>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Hear the story */}
        <section
          id="listen"
          aria-labelledby="listen-h"
          className="rounded-2xl p-6 mb-10 grid gap-4"
          style={{ background: "var(--color-brand-navy)", color: "var(--color-white)" }}
        >
          <h2
            id="listen-h"
            className="font-condensed font-800"
            style={{ fontSize: "1.75rem", letterSpacing: "-0.01em" }}
          >
            Hear the story
          </h2>
          <p className="max-w-[62ch] opacity-90 leading-relaxed">
            A narrated version of the hundred years, told in nine short chapters. The timeline
            follows along as you listen.
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={!canSpeak}
              onClick={() => start(0)}
              className="rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
              style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
            >
              ▶ Play from the beginning
            </button>
            <button
              type="button"
              aria-expanded={showScript}
              aria-controls="story-script"
              onClick={() => setShowScript((v) => !v)}
              className="rounded-full border border-current px-5 py-2.5 text-sm font-semibold opacity-90"
            >
              {showScript ? "Hide the script" : "Read the script"}
            </button>
            {canSpeak && voices.length > 0 && (
              <>
                <label htmlFor="voiceSel" className="text-[13px] opacity-75">
                  Voice
                </label>
                <select
                  id="voiceSel"
                  value={voiceName}
                  onChange={(e) => {
                    const v = voices.find((x) => x.name === e.target.value) ?? null;
                    voiceRef.current = v;
                    setVoiceName(e.target.value);
                    try {
                      localStorage.setItem("bbcVoice", e.target.value);
                    } catch {}
                  }}
                  className="max-w-full rounded-md border px-2.5 py-1.5 text-[13px]"
                  style={{
                    background: "var(--surface-raised)",
                    color: "var(--fg)",
                    borderColor: "var(--border-strong)",
                  }}
                >
                  {voices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
          <ol
            className="grid gap-1.5"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))" }}
          >
            {STORY.map((c, i) => (
              <li key={c.title}>
                <button
                  type="button"
                  disabled={!canSpeak}
                  onClick={() => start(i)}
                  className={`w-full flex gap-2.5 items-baseline text-left rounded-md border px-2.5 py-2 text-[13px] font-medium disabled:opacity-50 ${
                    cap.chapter === i ? "border-accent bg-white/10" : "border-white/15 bg-white/5"
                  }`}
                >
                  <span className="font-condensed font-800 text-base opacity-70 tabular-nums">
                    {i + 1}
                  </span>
                  <span>
                    {c.title}
                    <small className="block text-xs opacity-65">{c.years}</small>
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <p className="text-[13px] opacity-75">
            {canSpeak
              ? "Uses your device's built-in reading voice. About 7 minutes."
              : "This browser can't read aloud. Open the script to read along instead."}
          </p>
          {showScript && (
            <div
              id="story-script"
              className="rounded-md p-4 overflow-auto"
              style={{
                background: "var(--surface-raised)",
                color: "var(--fg)",
                maxHeight: "26rem",
              }}
            >
              {STORY.map((c, i) => (
                <div key={c.title}>
                  <h3 className="font-condensed font-800 text-lg mt-4 mb-1.5 first:mt-0">
                    {i + 1}. {c.title}{" "}
                    <small className="font-sans font-normal text-fg-muted">({c.years})</small>
                  </h3>
                  {c.paragraphs.map((q, j) => (
                    <p key={j} className="mb-2 leading-relaxed">
                      {q.text}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          )}
        </section>

        <p className="text-fg-muted max-w-[62ch] mb-7 leading-relaxed">
          Tap a pillar to show or hide it. Tap a decade to jump there. Open any entry for the full
          story and where it came from.
        </p>

        {/* The spine */}
        <ol className="relative list-none m-0 p-0 history-spine">
          {rows.map((row, i) => {
            const rowId = `row-${i}`;
            if (row.kind === "mark") {
              const m = TIMELINE_MARKS[row.index];
              const isNow = now === `mark-${row.index}`;
              return (
                <li
                  key={rowId}
                  id={`mark-${row.index}`}
                  className="grid items-start py-3.5 history-row"
                >
                  <span id={rowId} className="sr-only" />
                  <span
                    className="font-condensed font-800 text-[1.35rem] text-right pr-1 tabular-nums"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {m.year}
                  </span>
                  <span
                    className="justify-self-center mt-2 rounded-full border-2 relative z-[1]"
                    style={{
                      width: 14,
                      height: 14,
                      borderColor: m.future ? "var(--gold-a)" : "var(--fg-muted)",
                      background: m.future ? "var(--gold-a)" : "var(--surface)",
                    }}
                  />
                  <span
                    className="pt-0.5"
                    style={{
                      fontStyle: m.future ? "normal" : "italic",
                      fontWeight: m.future ? 700 : 400,
                      color: m.future || isNow ? "var(--fg)" : "var(--fg-muted)",
                    }}
                  >
                    {m.label}
                  </span>
                </li>
              );
            }
            if (row.kind === "gap") {
              return (
                <li key={rowId} id="gap-row" className="py-2 history-gap">
                  <span id={rowId} className="sr-only" />
                  <div
                    className="rounded-xl border border-dashed px-5 py-3.5 text-sm text-fg-muted"
                    style={{
                      borderColor: now === "gap-row" ? "var(--gold-a)" : "var(--border-strong)",
                    }}
                  >
                    <strong style={{ color: "var(--fg)" }}>2013 to today: still being gathered.</strong>{" "}
                    The archive&apos;s anniversary histories end in 2013. Plants, missionaries and
                    buildings from these years will come from staff records and the people who were
                    there.
                  </div>
                </li>
              );
            }
            const e = TIMELINE_EVENTS[row.index];
            const evId = `ev-${row.index}`;
            const hidden = !active.has(e.pillar);
            const isOpen = open.has(row.index);
            const hasMore = e.more.length > 0;
            const highlighted = now === evId || flash === evId;
            return (
              <li
                key={rowId}
                id={evId}
                className="grid items-start py-2.5 history-row"
                style={{ display: hidden ? "none" : undefined }}
              >
                <span id={rowId} className="sr-only" />
                <span
                  className="font-condensed font-800 text-[1.35rem] text-right pr-1 pt-3 tabular-nums"
                  style={{ color: "var(--fg)" }}
                >
                  {e.year}
                </span>
                <span
                  className="justify-self-center mt-3.5 p-1 flex relative z-[1] rounded-full border"
                  style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}
                >
                  <PillarIcon p={e.pillar} size={18} />
                </span>
                <article
                  className="min-w-0 rounded-xl border px-5 py-3.5"
                  style={{
                    background: "var(--surface-raised)",
                    borderColor: "var(--border)",
                    outline: highlighted ? "2px solid var(--accent)" : undefined,
                    outlineOffset: highlighted ? 2 : undefined,
                  }}
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-fg-muted mb-1">
                    <span
                      className="label-micro"
                      style={{ color: PILLAR_COLOR[e.pillar] }}
                    >
                      {PILLARS[e.pillar].label}
                    </span>
                    <span>{e.date}</span>
                  </div>
                  {e.figure && (
                    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 mt-0.5 mb-1.5">
                      <b
                        className="font-condensed font-800 leading-none tabular-nums"
                        style={{ fontSize: "2.1rem", color: PILLAR_COLOR[e.pillar] }}
                      >
                        {e.figure}
                      </b>
                      <span className="text-[13px] text-fg-muted">{e.figureLabel}</span>
                    </div>
                  )}
                  <h3
                    className="font-condensed font-800 text-fg mb-1.5"
                    style={{ fontSize: "1.3rem", lineHeight: 1.2, textWrap: "balance" }}
                  >
                    {e.title}
                  </h3>
                  <p className="max-w-[65ch] text-fg-muted leading-relaxed">{e.summary}</p>
                  {hasMore && isOpen && (
                    <div
                      id={`d-${row.index}`}
                      className="mt-2.5 pt-2.5 border-t border-dashed space-y-2"
                      style={{ borderColor: "var(--border-strong)" }}
                    >
                      {e.more.map((x, k) => (
                        <p key={k} className="max-w-[65ch] text-fg-muted leading-relaxed">
                          {x}
                        </p>
                      ))}
                    </div>
                  )}
                  {hasMore && (
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`d-${row.index}`}
                      onClick={() =>
                        setOpen((s) => {
                          const n = new Set(s);
                          if (n.has(row.index)) n.delete(row.index);
                          else n.add(row.index);
                          return n;
                        })
                      }
                      className="mt-2.5 text-[13px] font-semibold"
                      style={{ color: "var(--accent-text)" }}
                    >
                      {isOpen ? "Show less" : "Read the full story"}
                    </button>
                  )}
                  <p className="mt-2.5 text-xs italic text-fg-muted">Source: {e.source}</p>
                </article>
              </li>
            );
          })}
        </ol>
        {active.size === 0 && (
          <p className="my-6 text-fg-muted">Turn on at least one pillar to see the timeline.</p>
        )}
      </div>

      {/* Sticky narration player */}
      {playerOpen && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-white/15"
          style={{ background: "var(--color-brand-navy)", color: "var(--color-white)" }}
        >
          <div className="h-[3px] bg-white/15">
            <i
              className="block h-full transition-[width] duration-300"
              style={{ width: `${cap.progress}%`, background: "var(--accent)" }}
            />
          </div>
          <div className="max-w-4xl mx-auto px-5 py-2.5 grid items-center gap-3 grid-cols-[auto_minmax(0,1fr)_auto] max-sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="max-sm:hidden">
              <PlayerBtn
                label="Previous chapter"
                onClick={() =>
                  start(
                    Math.max(
                      0,
                      pos.current.c - (pos.current.p === 0 && pos.current.s === 0 ? 1 : 0),
                    ),
                  )
                }
              >
                ⏮
              </PlayerBtn>
            </div>
            <div className="min-w-0">
              <div className="label-micro opacity-70">{cap.title}</div>
              <div className="text-[15px] leading-snug line-clamp-2">{cap.text}</div>
            </div>
            <div className="flex items-center gap-1.5">
              <PlayerBtn
                main
                label={playing ? "Pause" : "Play"}
                onClick={() => (playing ? pause() : resume())}
              >
                {playing ? "❚❚" : "▶"}
              </PlayerBtn>
              <PlayerBtn
                label="Next chapter"
                onClick={() => {
                  if (pos.current.c < STORY.length - 1) start(pos.current.c + 1);
                }}
              >
                ⏭
              </PlayerBtn>
              <PlayerBtn label="Reading speed" onClick={cycleRate}>
                {rate}×
              </PlayerBtn>
              <PlayerBtn label="Stop and close" onClick={stop}>
                ✕
              </PlayerBtn>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .history-row{grid-template-columns:72px 26px minmax(0,1fr)}
        .history-gap{margin-left:98px}
        .history-spine::before{content:"";position:absolute;left:84px;top:0;bottom:0;width:2px;background:var(--border-strong)}
        @media (max-width:560px){
          .history-row{grid-template-columns:48px 22px minmax(0,1fr)}
          .history-spine::before{left:58px}
          .history-gap{margin-left:70px}
        }
      `}</style>
    </div>
  );
}

function PlayerBtn({
  children,
  label,
  onClick,
  main,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  main?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`grid place-items-center w-10 h-10 rounded-full border text-[15px] font-semibold ${
        main ? "border-transparent" : "border-white/30"
      }`}
      style={main ? { background: "var(--accent)", color: "var(--accent-fg)" } : undefined}
    >
      {children}
    </button>
  );
}
