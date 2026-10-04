"use client";

/**
 * LivePlayer — client component for the /live page.
 *
 * Tab system (during live / pre / post):
 *   Watch    — YouTube embed + Give / Prayer CTAs
 *   Passage  — CSB scripture text fetched from /api/scripture
 *   Outline  — Parsed from Curtis's Drive doc
 *   Notes    — Personal note-taking, saved to localStorage
 *   Prayer   — Inline prayer request form → /api/prayer → PCO
 *
 * Service schedule (ET):
 *   Sunday  8:30–9:45 AM   (Choir & Orchestra)
 *   Sunday 11:00–12:15 PM  (Band-Led)
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type FormEvent,
  type ReactNode,
} from "react";
import type { SermonData } from "@/lib/sermon";
// NOT from "@/lib/sermon" — that file imports google-auth-library at module
// scope (Node-only, needs child_process), which breaks the client bundle
// the moment a "use client" component imports any runtime value from it.
// See lib/sermon-shared.ts's doc comment.
import { YOUTUBE_CHANNEL_ID, formatSermonDate } from "@/lib/sermon-shared";
import {
  type LiveState,
  type ServiceWindow,
  type LiveStateInfo as StateInfo,
  getEasternState,
  getEasternDateString,
} from "@/lib/live-schedule";
import SermonNotes from "@/components/sermons/SermonNotes";

const DEFAULT_ACCENT = "#00abc9";

// ── Service schedule ────────────────────────────────────────────────────────
// SERVICES / PRE_MINUTES / POST_MINUTES / getEasternState now live in
// lib/live-schedule.ts (imported above) so the homepage banner and nav
// badge can run the exact same clock — see that file's doc comment.

// ── Tab system ────────────────────────────────────────────────────────────────

type Tab = "watch" | "passage" | "notes" | "prayer";

// Ordered for mobile thumb reach: the tabs people touch mid-service
// sit right after Watch, not stranded at the far right.
// Note: an "Outline" tab (auto-extracted from Curtis's raw notes doc) was
// removed 2026-10-03 — the extraction was pulling raw yellow-highlight
// fragments and regex-matched scripture lines straight out of the notes
// doc, often mid-sentence and out of context. Going back to the drawing
// board on that rather than shipping junk. See OutlineTab / getSermonNotesByDate
// in lib/sermon.ts, still intact but no longer rendered anywhere.
//
// Icons are small outline SVGs, not emoji — emoji render inconsistently
// across platforms (color, baseline, even which glyph shows up at all)
// and read as decoration rather than UI. Matches the stroke-based icon
// style SermonNotes.tsx's own toolbar already uses (IconBold, IconBullets,
// etc.) — the Notes icon here is literally the same pencil path as that
// toolbar's "Your Notes" header icon, so the same glyph means the same
// thing everywhere notes show up.
function TabIconWatch() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8.5l6 3.5-6 3.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}
function TabIconNotes() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  );
}
function TabIconPassage() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6c-1.5-1.3-3.5-2-6-2v14c2.5 0 4.5.7 6 2m0-14c1.5-1.3 3.5-2 6-2v14c-2.5 0-4.5.7-6 2m0-14v14"/>
    </svg>
  );
}
function TabIconPrayer() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v7"/><path d="M12 21c-2-1.5-4-4-4-7.5V8l4-2 4 2v5.5c0 3.5-2 6-4 7.5z"/>
    </svg>
  );
}

const TABS: { id: Tab; label: string; icon: () => ReactNode }[] = [
  { id: "watch",   label: "Watch",   icon: TabIconWatch },
  { id: "notes",   label: "Notes",   icon: TabIconNotes },
  { id: "passage", label: "Passage", icon: TabIconPassage },
  { id: "prayer",  label: "Prayer",  icon: TabIconPrayer },
];

// ── Scripture fetching ────────────────────────────────────────────────────────

interface ScriptureResult {
  reference: string;
  verses: Array<{ chapter: number; verse: number; text: string }>;
  translation_name: string;
}

function useScripture(passage: string) {
  const [data, setData]     = useState<ScriptureResult | null>(null);
  const [loading, setLoad]  = useState(false);
  const [error, setError]   = useState(false);

  useEffect(() => {
    if (!passage) return;
    setLoad(true);
    setError(false);
    fetch(`/api/scripture?p=${encodeURIComponent(passage)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoad(false));
  }, [passage]);

  return { data, loading, error };
}

// ── Notes (localStorage) ──────────────────────────────────────────────────────

/** Stable per-date draft key for notes taken during the live stream.
 *
 * MUST be keyed by TODAY's real Eastern-time date, never by sermon.date —
 * sermon.date comes from getLatestSermon(), which during the live window
 * is always last week's already-synced sermon (this week's doesn't sync
 * until Mon/Tue/Wed). Found 2026-10-03: this used to fall through to the
 * resolved sermon's own slug whenever one existed (slugFromWatchUrl), which
 * by Sunday morning it always does — last week's sermon was synced days
 * earlier — so live notes were silently writing into last week's real,
 * permanent bbc-notes-${slug} storage instead of a draft. See
 * claude/sunday-morning-live-pipeline-audit-2026-10-03.md. Always using
 * today's actual date here (never a resolved slug) makes that collision
 * structurally impossible; SermonNotes.tsx's mount effect migrates this
 * draft onto the real bbc-notes-${slug} key once that page exists. */
function draftNoteKey(todayEasternDate: string): string {
  return `live-draft-${todayEasternDate}`;
}

// ── Prayer form ───────────────────────────────────────────────────────────────

type PrayerStatus = "idle" | "sending" | "sent" | "error";

function usePrayerForm() {
  const [status, setStatus] = useState<PrayerStatus>("idle");

  const submit = useCallback(
    async (name: string, request: string, email: string, isPrivate: boolean) => {
      setStatus("sending");
      try {
        const res = await fetch("/api/prayer", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ name, request, email, isPrivate }),
        });
        setStatus(res.ok ? "sent" : "error");
      } catch {
        setStatus("error");
      }
    },
    [],
  );

  return { status, submit };
}

// ── Root component ────────────────────────────────────────────────────────────

interface Props {
  sermon: SermonData;
  /** True when we're in the live window but today's Tagging-sheet row
   * isn't in yet, so `sermon` is the stale last-synced (last week's)
   * fallback rather than today's real info — see app/live/page.tsx and
   * lib/live-today.ts. Lets the bulletin say so honestly instead of
   * presenting last week's facts as if they were today's. */
  isStaleFallback?: boolean;
}

export default function LivePlayer({ sermon, isStaleFallback = false }: Props) {
  const [mounted, setMounted] = useState(false);
  const [info, setInfo]       = useState<StateInfo>({ state: "off", service: null, minutesUntil: 0 });
  const intervalRef           = useRef<ReturnType<typeof setInterval> | null>(null);

  // ?preview=post|live|pre forces the active view (dev/QA testing only)
  const [previewState, setPreviewState] = useState<LiveState | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("preview");
    if (p === "live" || p === "post" || p === "pre") setPreviewState(p);

    setMounted(true);
    setInfo(getEasternState(new Date()));
    intervalRef.current = setInterval(() => setInfo(getEasternState(new Date())), 30_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  if (!mounted) return <OffHours sermon={sermon} />;

  const { state, service, minutesUntil } = info;
  const effectiveState = previewState ?? state;

  if (effectiveState === "live" || effectiveState === "pre" || effectiveState === "post") {
    return (
      <ActiveView
        sermon={sermon}
        state={effectiveState}
        service={service}
        minutesUntil={minutesUntil}
        isStaleFallback={isStaleFallback}
      />
    );
  }
  return <OffHours sermon={sermon} />;
}

// ── Active view (live / pre / post) ──────────────────────────────────────────

function ActiveView({
  sermon,
  state,
  service,
  minutesUntil,
  isStaleFallback,
}: {
  sermon:       SermonData;
  state:        "live" | "pre" | "post";
  service:      ServiceWindow | null;
  minutesUntil: number;
  isStaleFallback: boolean;
}) {
  const [tab, setTab] = useState<Tab>("watch");

  // ── Second-by-second countdown for pre-service ───────────────────────────
  const [secsUntil, setSecsUntil] = useState(minutesUntil * 60);

  // Re-sync when the 30s poller delivers a fresh minutesUntil
  useEffect(() => { setSecsUntil(minutesUntil * 60); }, [minutesUntil]);

  // Tick down every second while in pre-service state
  useEffect(() => {
    if (state !== "pre") return;
    const id = setInterval(() => setSecsUntil((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [state]);
  const embedUrl = `https://www.youtube.com/embed/live_stream?channel=${YOUTUBE_CHANNEL_ID}&autoplay=1&rel=0&modestbranding=1`;

  return (
    // pt-16 clears the fixed Navbar (h-16, 64px, fixed top-0 z-50 in
    // ConditionalLayout/Navbar.tsx). OffHours below already had this (pt-24
    // on its own hero div); this live/pre/post view never did, so the fixed
    // navbar's logo sat directly on top of the status bar's first 64px —
    // reported live this morning as the logo and "We're Live" bar looking
    // "scrunched together" on /live's Notes tab (and every other tab).
    // h-screen (not min-h-screen): the notes/passage/prayer panes below are
    // meant to scroll *within themselves* (flex-1 overflow-y-auto), with the
    // video and tab bar staying put — reported 2026-10-04 as "the notes are
    // still scrolling the whole page, rather than a window that scrolls
    // within the page." That requires an actual bounded height to flex
    // against; min-h-screen only sets a *minimum*, so once notes content
    // grew taller than the viewport the whole column (and the page) grew
    // with it instead of clipping. h-screen together with min-h-0 on every
    // flex ancestor below (the classic flexbox-doesn't-shrink gotcha — a
    // flex item's default min-height is `auto`, i.e. "at least as tall as my
    // content", which silently overrides `overflow-y-auto` until you
    // override it back to 0) is what actually makes overflow-y-auto clip.
    <div className="h-screen bg-theater-bg text-fg-on-dark flex flex-col pt-16">

      {/* ── Status bar ───────────────────────────────────────────────── */}
      <div className={`flex items-center justify-center gap-2.5 py-2.5 text-xs font-semibold tracking-widest uppercase ${
        state === "live" ? "bg-accent text-accent-fg" : state === "post" ? "bg-theater-raised" : "bg-brand-navy"
      }`}>
        {state === "live" && (
          <><span className="w-1.5 h-1.5 rounded-full bg-accent-fg animate-pulse" />
          We&apos;re Live — {service?.label}</>
        )}
        {state === "pre" && (
          <><span className="w-1.5 h-1.5 rounded-full bg-accent" />
          {service?.label} starts in {Math.floor(secsUntil / 60)}m {secsUntil % 60 < 10 ? `0${secsUntil % 60}` : secsUntil % 60}s</>
        )}
        {state === "post" && (
          <><span className="w-1.5 h-1.5 rounded-full bg-fg-on-dark-muted" />
          {service ? `Service ended — ${service.label}` : "Service ended"}</>
        )}
      </div>

      {/* ── Main content: stream + bulletin side-by-side on desktop ──── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">

        {/* Stream column */}
        <div className="lg:flex-1 flex flex-col min-h-0">
          {/* YouTube embed */}
          {/* The embed well. Was bg-black, which reads as a hole punched in a
                 #0d1525 page while the iframe loads; --theater-sunken is a well,
                 not a hole. The border makes the seam with YouTube's own chrome
                 look intentional rather than like a rendering fault — YouTube will
                 not theme, so the seam is permanent and should be owned. */}
            <div
              className="relative w-full bg-theater-sunken border-y border-border-on-dark"
              style={{ aspectRatio: "16/9" }}
            >
            {state === "post" ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-theater-bg px-6 text-center">
                <p className="text-fg-on-dark-muted text-sm">The service just ended.</p>
                <h2 className="text-lg font-bold">The replay uploads to YouTube shortly.</h2>
                <a
                  href={sermon.watchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-sm"
                >
                  Watch on YouTube
                </a>
              </div>
            ) : (
              <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Brainerd Baptist Live Stream"
              />
            )}
          </div>

          {/* Mobile: tab bar + tab content */}
          <div className="lg:hidden flex flex-col flex-1 min-h-0">
            <div className="flex border-b border-border-on-dark bg-theater-bg overflow-x-auto scrollbar-hide">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 min-w-[64px] flex flex-col items-center gap-0.5 py-2.5 px-1 text-[10px] font-semibold tracking-wide transition-colors ${
                    tab === t.id
                      ? "text-accent border-b-2 border-accent"
                      : "text-fg-on-dark-muted hover:text-fg-on-dark"
                  }`}
                >
                  <span className="leading-none">{t.icon()}</span>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              {tab === "watch"   && <WatchTab   sermon={sermon} isStaleFallback={isStaleFallback} />}
              {tab === "passage" && <PassageTab sermon={sermon} />}
              {tab === "notes"   && <LiveNotesTab sermon={sermon} />}
              {tab === "prayer"  && <PrayerTab  sermon={sermon} />}
            </div>
          </div>

          {/* Desktop: Give + Prayer row below stream */}
          <div className="hidden lg:block">
            <WatchTab sermon={sermon} isStaleFallback={isStaleFallback} />
          </div>
        </div>

        {/* Bulletin sidebar — desktop only ─────────────────────────────── */}
        <div className="hidden lg:flex flex-col w-[380px] xl:w-[420px] border-l border-border-on-dark bg-theater-sunken overflow-y-auto min-h-0">
          {/* Sermon header */}
          <div className="px-6 pt-6 pb-4 border-b border-border-on-dark">
            {sermon.series && (
              <p className="label-micro text-fg-on-dark-muted mb-1">
                {sermon.series}{sermon.part ? ` · ${sermon.part}` : ""}
              </p>
            )}
            {sermon.passage && (
              <a
                href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(sermon.passage)}&version=CSB`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent text-xs font-semibold tracking-widest uppercase hover:opacity-75 transition-opacity block mb-1"
              >
                {sermon.passage}
              </a>
            )}
            <h2 className="text-fg-on-dark font-bold text-lg leading-snug" style={{ letterSpacing: "-0.02em" }}>
              {sermon.title}
            </h2>
            <p className="text-fg-on-dark-muted text-xs mt-1">Follow along · {service?.label ?? "Live Service"}</p>
            {isStaleFallback && (
              <p className="text-[11px] text-fg-on-dark-muted mt-2 px-2.5 py-1.5 rounded-md bg-surface-on-dark leading-snug">
                Showing last week&apos;s message — today&apos;s title posts here by Wednesday.
              </p>
            )}
          </div>

          {/* Bulletin tab bar */}
          <div className="flex border-b border-border-on-dark">
            {(["passage", "notes", "prayer"] as Tab[]).map((t) => {
              const meta = TABS.find((x) => x.id === t)!;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 text-[11px] font-semibold tracking-wide transition-colors ${
                    tab === t
                      ? "text-accent border-b-2 border-accent"
                      : "text-fg-on-dark-muted hover:text-fg-on-dark"
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5 align-middle">{meta.icon()} {meta.label}</span>
                </button>
              );
            })}
          </div>

          {/* Bulletin tab content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {(tab === "watch" || tab === "passage") && <PassageTab sermon={sermon} />}
            {tab === "notes"   && <LiveNotesTab sermon={sermon} />}
            {tab === "prayer"  && <PrayerTab  sermon={sermon} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Watch tab ─────────────────────────────────────────────────────────────────

function WatchTab({ sermon, isStaleFallback = false }: { sermon: SermonData; isStaleFallback?: boolean }) {
  const date = formatSermonDate(sermon.date);
  return (
    <div className="px-5 py-6 max-w-xl mx-auto">
      {isStaleFallback && (
        <p className="text-[11px] text-fg-on-dark-muted mb-3 px-2.5 py-1.5 rounded-md bg-surface-on-dark leading-snug inline-block">
          Showing last week&apos;s message — today&apos;s title posts here by Wednesday.
        </p>
      )}
      {sermon.passage && (
        <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-2">
          {sermon.passage}
        </p>
      )}
      {sermon.series && (
        <p className="text-fg-on-dark-muted text-xs font-semibold tracking-widest uppercase mb-1">
          {sermon.series}{sermon.part ? ` · ${sermon.part}` : ""}
        </p>
      )}
      <h2 className="text-xl font-bold text-fg-on-dark mb-1 leading-tight">{sermon.title}</h2>
      <p className="text-sm text-fg-on-dark-muted mb-4">{date} · {sermon.speaker || "Curtis Hill"}</p>
      {sermon.summary && (
        <p className="text-sm text-fg-on-dark-muted leading-relaxed mb-6">
          {sermon.summary}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <a
          href="https://tithe.ly/give_new/www/#/tithely/give-one-time/1348891"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-center text-sm"
        >
          Give Online
        </a>
        <a
          href="https://brainerdbaptist.org/connect"
          className="btn-outline-white text-center text-sm"
        >
          Connect Card
        </a>
      </div>
    </div>
  );
}

// ── Passage tab ───────────────────────────────────────────────────────────────

function PassageTab({ sermon }: { sermon: SermonData }) {
  const { data, loading, error } = useScripture(sermon.passage);

  if (!sermon.passage) {
    return (
      <div className="px-5 py-10 text-center text-fg-on-dark-muted text-sm">
        No passage listed for this week.
      </div>
    );
  }

  return (
    <div className="px-5 py-6 max-w-xl mx-auto">
      <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-1">
        Scripture
      </p>
      <h3 className="text-lg font-bold text-fg-on-dark mb-5">{sermon.passage}</h3>

      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-surface-on-dark rounded animate-pulse" style={{ width: `${85 - i * 8}%` }} />
          ))}
        </div>
      )}

      {error && (
        <p className="text-fg-on-dark-muted text-sm">
          Couldn&apos;t load passage.{" "}
          <a
            href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(sermon.passage)}&version=CSB`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline"
          >
            Read on Bible Gateway →
          </a>
        </p>
      )}

      {data && !loading && (
        <>
          <div className="space-y-2">
            {data.verses.map((v) => (
              <p key={`${v.chapter}-${v.verse}`} className="text-sm leading-relaxed text-fg-on-dark-body">
                <sup className="text-fg-on-dark-muted text-[10px] mr-1 select-none">{v.verse}</sup>
                {v.text}
              </p>
            ))}
          </div>
          <p className="mt-5 label-micro text-fg-on-dark-muted">
            {data.translation_name}
          </p>
        </>
      )}
    </div>
  );
}

// ── Notes tab ─────────────────────────────────────────────────────────────────

/** /live's Notes tab, the same rich editor used on /sermons/[slug] —
 * formatting, numbered/bulleted lists, one-click PDF download, and real
 * email-with-attachment, instead of the old plain textarea + mailto: link.
 *
 * Always saves under today's date-based draft key, NEVER the resolved
 * sermon's slug — see draftNoteKey()'s comment for why: `sermon` here is
 * whatever getLatestSermon() resolved, which during the live window is
 * last week's already-synced sermon with a real slug, so falling through
 * to that slug (the old behavior) silently wrote live notes into last
 * week's permanent notes. SermonNotes.tsx migrates this draft onto the
 * real bbc-notes-${slug} key once this week's sermon is synced and its
 * page is opened. */
function LiveNotesTab({ sermon }: { sermon: SermonData }) {
  const todayKey = draftNoteKey(getEasternDateString(new Date()));

  return (
    <div className="px-5 py-6 max-w-xl mx-auto">
      <SermonNotes
        slug={todayKey}
        noteKey={todayKey}
        accentColor={DEFAULT_ACCENT}
        sermonTitle={sermon.title}
        speaker={sermon.speaker}
        series={sermon.series}
        date={sermon.date}
        passage={sermon.passage}
        youtubeId={sermon.youtubeId ?? undefined}
      />
    </div>
  );
}

// ── Prayer tab ────────────────────────────────────────────────────────────────

function PrayerTab({ sermon }: { sermon: SermonData }) {
  const { status, submit } = usePrayerForm();
  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [request,   setRequest]   = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !request.trim()) return;
    submit(name, request, email, isPrivate);
  };

  if (status === "sent") {
    return (
      <div className="px-5 py-14 max-w-xl mx-auto text-center">
        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4 text-accent">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <h3 className="text-lg font-bold text-fg-on-dark mb-2">We&apos;re praying for you</h3>
        <p className="text-sm text-fg-on-dark-muted">
          Your request has been received. Our prayer team will lift this up.
        </p>
      </div>
    );
  }

  return (
    <div className="px-5 py-6 max-w-xl mx-auto">
      <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-1">Prayer Request</p>
      <p className="text-fg-on-dark-muted text-sm mb-5">
        Our prayer team reviews every request during and after the service.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-fg-on-dark-muted mb-1.5 uppercase tracking-wide">
            Your Name <span className="text-accent">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="First name is fine"
            className="w-full rounded-lg bg-surface-on-dark border border-border-on-dark text-sm text-fg-on-dark placeholder-fg-on-dark-muted px-4 py-2.5 focus:border-accent/60 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-fg-on-dark-muted mb-1.5 uppercase tracking-wide">
            Prayer Request <span className="text-accent">*</span>
          </label>
          <textarea
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            required
            placeholder="Share what's on your heart…"
            rows={4}
            className="w-full rounded-lg bg-surface-on-dark border border-border-on-dark text-sm text-fg-on-dark placeholder-fg-on-dark-muted px-4 py-2.5 focus:border-accent/60 transition-colors resize-none leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-fg-on-dark-muted mb-1.5 uppercase tracking-wide">
            Email <span className="text-fg-on-dark-muted font-normal normal-case">(optional — for follow-up)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg bg-surface-on-dark border border-border-on-dark text-sm text-fg-on-dark placeholder-fg-on-dark-muted px-4 py-2.5 focus:border-accent/60 transition-colors"
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="w-4 h-4 rounded accent-accent"
          />
          <span className="text-sm text-fg-on-dark-muted">Keep this request private (prayer team only)</span>
        </label>

        {status === "error" && (
          <p className="text-danger-on-dark text-sm">Something went wrong. Please try again.</p>
        )}

        <button
          type="submit"
          disabled={status === "sending" || !name.trim() || !request.trim()}
          className="btn-primary w-full text-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "sending" ? "Sending…" : "Submit Prayer Request"}
        </button>
      </form>
    </div>
  );
}

// ── Off-hours view ────────────────────────────────────────────────────────────

function OffHours({ sermon }: { sermon: SermonData }) {
  const date = formatSermonDate(sermon.date);

  return (
    <div className="min-h-screen bg-theater-bg text-fg-on-dark">
      {/* Hero */}
      <div className="relative flex flex-col items-center justify-center text-center px-4 pt-24 pb-16">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 50% at 50% 30%, var(--theater-glow) 0%, transparent 70%)" }}
        />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-border-on-dark bg-surface-on-dark rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-fg-on-dark-muted mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-fg-on-dark-muted" />
            Live Sundays 8:30 &amp; 11:00 AM ET
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-fg-on-dark mb-4 leading-tight">
            Watch Brainerd<br className="hidden sm:block" /> Baptist Live
          </h1>
          <p className="text-fg-on-dark-muted text-lg mb-10 leading-relaxed">
            We&rsquo;d love to have you in the room. Can&rsquo;t make it? Catch up on the
            sermon here anytime.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/visit"
              className="btn-primary inline-flex items-center gap-2"
            >
              Plan a Visit
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7h8M8 4l3 3-3 3"/></svg>
            </a>
            <a
              href={sermon.watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-fg-on-dark transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
              Watch Latest Sermon
            </a>
          </div>
        </div>
      </div>

      {/* Latest sermon card */}
      {sermon.youtubeId && (
        <div className="max-w-4xl mx-auto px-4 pb-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-fg-on-dark-muted mb-5 text-center">Most Recent Sermon</p>
          <div className="rounded-2xl overflow-hidden border border-border-on-dark shadow-xl shadow-black/40 bg-theater-raised">
            <div className="grid md:grid-cols-5">
              <div className="md:col-span-2 relative min-h-[200px] bg-brand-navy flex items-center justify-center">
                {sermon.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sermon.thumbnail} alt={sermon.title} className="absolute inset-0 w-full h-full object-cover opacity-70" />
                )}
                <div className="absolute inset-0 bg-brand-navy/50" />
                <a href={sermon.watchUrl} target="_blank" rel="noopener noreferrer" className="relative z-10" aria-label={`Watch ${sermon.title}`}>
                  <div className="w-14 h-14 rounded-full bg-accent hover:bg-accent-solid-hover flex items-center justify-center transition shadow-lg hover:scale-105">
                    <svg width="18" height="18" viewBox="0 0 24 24" style={{ fill: "var(--fg-on-accent)" }}><polygon points="5,3 19,12 5,21"/></svg>
                  </div>
                </a>
              </div>
              <div className="md:col-span-3 p-7 md:p-9 flex flex-col justify-center">
                {sermon.series && (
                  <p className="label-micro text-fg-on-dark-muted mb-1">
                    {sermon.series}{sermon.part ? ` · ${sermon.part}` : ""}
                  </p>
                )}
                {sermon.passage && <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-2">{sermon.passage}</p>}
                <h3 className="text-xl md:text-2xl font-bold text-fg-on-dark mb-3 leading-tight">{sermon.title}</h3>
                <p className="text-sm text-fg-on-dark-muted mb-4">{date} · {sermon.speaker || "Curtis Hill"}</p>
                {sermon.summary && (
                  <p className="text-sm text-fg-on-dark-muted leading-relaxed mb-5 line-clamp-3">
                    {sermon.summary}
                  </p>
                )}
                <a href={sermon.watchUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm inline-block self-start">
                  Watch Now
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service times */}
      <div className="border-t border-border-on-dark py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase text-fg-on-dark-muted mb-7 text-center">Sunday Services</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { time: "8:30 AM", style: "Choir & Orchestra", note: "Traditional format" },
              { time: "11:00 AM", style: "Band-Led Worship",  note: "Contemporary format" },
            ].map((svc) => (
              <div key={svc.time} className="rounded-xl border border-border-on-dark bg-surface-on-dark p-6">
                <span className="text-2xl font-bold text-fg-on-dark block mb-1">{svc.time}</span>
                <span className="text-accent text-sm font-semibold block">{svc.style}</span>
                <span className="text-fg-on-dark-muted text-xs">{svc.note}</span>
              </div>
            ))}
          </div>
          <div className="mt-7 text-center">
            <a href="/plan-your-visit" className="text-sm font-semibold text-accent hover:text-fg-on-dark transition-colors inline-flex items-center gap-1.5">
              Get directions &amp; parking info
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7h8M8 4l3 3-3 3"/></svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
