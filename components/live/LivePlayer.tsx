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
} from "react";
import type { SermonData } from "@/lib/sermon";
import { YOUTUBE_CHANNEL_ID, formatSermonDate } from "@/lib/sermon";

// ── Service schedule ──────────────────────────────────────────────────────────

type ServiceWindow = {
  label: string;
  startH: number; startM: number;
  endH:   number; endM:   number;
};

const SERVICES: ServiceWindow[] = [
  { label: "8:30 AM Service",  startH: 8,  startM: 30, endH: 9,  endM: 45 },
  { label: "11:00 AM Service", startH: 11, startM: 0,  endH: 12, endM: 15 },
];

const PRE_MINUTES  = 20;
const POST_MINUTES = 45;

type LiveState = "pre" | "live" | "post" | "off";

interface StateInfo {
  state:        LiveState;
  service:      ServiceWindow | null;
  minutesUntil: number;
}

function getEasternState(now: Date): StateInfo {
  const etStr = now.toLocaleString("en-US", { timeZone: "America/New_York" });
  const et    = new Date(etStr);
  const dow   = et.getDay();
  const total = et.getHours() * 60 + et.getMinutes();

  if (dow !== 0) return { state: "off", service: null, minutesUntil: 0 };

  for (const svc of SERVICES) {
    const start = svc.startH * 60 + svc.startM;
    const end   = svc.endH   * 60 + svc.endM;
    if (total >= start && total < end)
      return { state: "live", service: svc, minutesUntil: 0 };
    if (total >= start - PRE_MINUTES && total < start)
      return { state: "pre",  service: svc, minutesUntil: start - total };
    if (total >= end && total < end + POST_MINUTES)
      return { state: "post", service: svc, minutesUntil: 0 };
  }
  return { state: "off", service: null, minutesUntil: 0 };
}

// ── Tab system ────────────────────────────────────────────────────────────────

type Tab = "watch" | "passage" | "outline" | "notes" | "prayer";

// Ordered for mobile thumb reach: the tabs people touch mid-service
// (Outline, Notes) sit right after Watch, not stranded at the far right.
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "watch",   label: "Watch",   icon: "▶" },
  { id: "outline", label: "Outline", icon: "📋" },
  { id: "notes",   label: "Notes",   icon: "✏️" },
  { id: "passage", label: "Passage", icon: "📖" },
  { id: "prayer",  label: "Prayer",  icon: "🙏" },
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

function useNotes(sermonDate: string) {
  const key = `sermon-notes-${sermonDate}`;

  const [notes, setNotes] = useState("");

  useEffect(() => {
    try { setNotes(localStorage.getItem(key) ?? ""); } catch {}
  }, [key]);

  const save = useCallback(
    (val: string) => {
      setNotes(val);
      try { localStorage.setItem(key, val); } catch {}
    },
    [key],
  );

  const emailNotes = useCallback(
    (title: string) => {
      const subject = encodeURIComponent(`My notes — ${title}`);
      const body    = encodeURIComponent(notes);
      window.open(`mailto:?subject=${subject}&body=${body}`);
    },
    [notes],
  );

  const copyNotes = useCallback(async () => {
    try { await navigator.clipboard.writeText(notes); } catch {}
  }, [notes]);

  return { notes, save, emailNotes, copyNotes };
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

interface Props { sermon: SermonData }

export default function LivePlayer({ sermon }: Props) {
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
    return <ActiveView sermon={sermon} state={effectiveState} service={service} minutesUntil={minutesUntil} />;
  }
  return <OffHours sermon={sermon} />;
}

// ── Active view (live / pre / post) ──────────────────────────────────────────

function ActiveView({
  sermon,
  state,
  service,
  minutesUntil,
}: {
  sermon:       SermonData;
  state:        "live" | "pre" | "post";
  service:      ServiceWindow | null;
  minutesUntil: number;
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
    <div className="min-h-screen bg-[#0d1525] text-white flex flex-col">

      {/* ── Status bar ───────────────────────────────────────────────── */}
      <div className={`flex items-center justify-center gap-2.5 py-2.5 text-xs font-semibold tracking-widest uppercase ${
        state === "live" ? "bg-[#00abc9]" : state === "post" ? "bg-[#1a2a40]" : "bg-[#00205B]"
      }`}>
        {state === "live" && (
          <><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          We&apos;re Live — {service?.label}</>
        )}
        {state === "pre" && (
          <><span className="w-1.5 h-1.5 rounded-full bg-[#00abc9]" />
          {service?.label} starts in {Math.floor(secsUntil / 60)}m {secsUntil % 60 < 10 ? `0${secsUntil % 60}` : secsUntil % 60}s</>
        )}
        {state === "post" && (
          <><span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          {service ? `Service ended — ${service.label}` : "Service ended"}</>
        )}
      </div>

      {/* ── Main content: stream + bulletin side-by-side on desktop ──── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* Stream column */}
        <div className="lg:flex-1 flex flex-col">
          {/* YouTube embed */}
          <div className="relative w-full bg-black" style={{ aspectRatio: "16/9" }}>
            {state === "post" ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0d1525] px-6 text-center">
                <p className="text-[#6b7f9e] text-sm">The service just ended.</p>
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
          <div className="lg:hidden flex flex-col flex-1">
            <div className="flex border-b border-white/8 bg-[#0d1525] overflow-x-auto scrollbar-hide">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 min-w-[64px] flex flex-col items-center gap-0.5 py-2.5 px-1 text-[10px] font-semibold tracking-wide transition-colors ${
                    tab === t.id
                      ? "text-[#00abc9] border-b-2 border-[#00abc9]"
                      : "text-[#6b7f9e] hover:text-white"
                  }`}
                >
                  <span className="text-base leading-none">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto">
              {tab === "watch"   && <WatchTab   sermon={sermon} />}
              {tab === "passage" && <PassageTab sermon={sermon} />}
              {tab === "outline" && <OutlineTab sermon={sermon} />}
              {tab === "notes"   && <NotesTab   sermon={sermon} />}
              {tab === "prayer"  && <PrayerTab  sermon={sermon} />}
            </div>
          </div>

          {/* Desktop: Give + Prayer row below stream */}
          <div className="hidden lg:block">
            <WatchTab sermon={sermon} />
          </div>
        </div>

        {/* Bulletin sidebar — desktop only ─────────────────────────────── */}
        <div className="hidden lg:flex flex-col w-[380px] xl:w-[420px] border-l border-white/8 bg-[#0a1120] overflow-y-auto">
          {/* Sermon header */}
          <div className="px-6 pt-6 pb-4 border-b border-white/8">
            {sermon.passage && (
              <a
                href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(sermon.passage)}&version=CSB`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00abc9] text-xs font-semibold tracking-widest uppercase hover:opacity-75 transition-opacity block mb-1"
              >
                {sermon.passage}
              </a>
            )}
            <h2 className="text-white font-bold text-lg leading-snug" style={{ letterSpacing: "-0.02em" }}>
              {sermon.title}
            </h2>
            <p className="text-[#6b7f9e] text-xs mt-1">Follow along · {service?.label ?? "Live Service"}</p>
          </div>

          {/* Bulletin tab bar */}
          <div className="flex border-b border-white/8">
            {(["outline", "passage", "notes", "prayer"] as Tab[]).map((t) => {
              const meta = TABS.find((x) => x.id === t)!;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 text-[11px] font-semibold tracking-wide transition-colors ${
                    tab === t
                      ? "text-[#00abc9] border-b-2 border-[#00abc9]"
                      : "text-[#6b7f9e] hover:text-white"
                  }`}
                >
                  {meta.icon} {meta.label}
                </button>
              );
            })}
          </div>

          {/* Bulletin tab content */}
          <div className="flex-1 overflow-y-auto">
            {(tab === "watch" || tab === "outline") && <OutlineTab sermon={sermon} />}
            {tab === "passage" && <PassageTab sermon={sermon} />}
            {tab === "notes"   && <NotesTab   sermon={sermon} />}
            {tab === "prayer"  && <PrayerTab  sermon={sermon} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Watch tab ─────────────────────────────────────────────────────────────────

function WatchTab({ sermon }: { sermon: SermonData }) {
  const date = formatSermonDate(sermon.date);
  return (
    <div className="px-5 py-6 max-w-xl mx-auto">
      {sermon.passage && (
        <p className="text-[#00abc9] text-xs font-semibold tracking-widest uppercase mb-2">
          {sermon.passage}
        </p>
      )}
      <h2 className="text-xl font-bold text-white mb-1 leading-tight">{sermon.title}</h2>
      <p className="text-sm text-[#6b7f9e] mb-6">{date} · Curtis Hill</p>

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
      <div className="px-5 py-10 text-center text-[#6b7f9e] text-sm">
        No passage listed for this week.
      </div>
    );
  }

  return (
    <div className="px-5 py-6 max-w-xl mx-auto">
      <p className="text-[#00abc9] text-xs font-semibold tracking-widest uppercase mb-1">
        Scripture
      </p>
      <h3 className="text-lg font-bold text-white mb-5">{sermon.passage}</h3>

      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-white/8 rounded animate-pulse" style={{ width: `${85 - i * 8}%` }} />
          ))}
        </div>
      )}

      {error && (
        <p className="text-[#6b7f9e] text-sm">
          Couldn&apos;t load passage.{" "}
          <a
            href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(sermon.passage)}&version=CSB`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00abc9] underline"
          >
            Read on Bible Gateway →
          </a>
        </p>
      )}

      {data && !loading && (
        <>
          <div className="space-y-2">
            {data.verses.map((v) => (
              <p key={`${v.chapter}-${v.verse}`} className="text-sm leading-relaxed text-[#c8d4e8]">
                <sup className="text-[#6b7f9e] text-[10px] mr-1 select-none">{v.verse}</sup>
                {v.text}
              </p>
            ))}
          </div>
          <p className="mt-5 text-[10px] text-[#4a5568] tracking-wide uppercase">
            {data.translation_name}
          </p>
        </>
      )}
    </div>
  );
}

// ── Outline tab ───────────────────────────────────────────────────────────────

function OutlineTab({ sermon }: { sermon: SermonData }) {
  if (!sermon.outline.length) {
    return (
      <div className="px-5 py-10 text-center text-[#6b7f9e] text-sm">
        {sermon.passage
          ? "Outline will appear closer to the service."
          : "Outline will appear when Curtis’s notes are available."}
      </div>
    );
  }

  const isScripture = sermon.outlineType === "scripture";

  return (
    <div className="px-5 py-6 max-w-xl mx-auto">
      <p className="text-[#00abc9] text-xs font-semibold tracking-widest uppercase mb-1">
        {isScripture ? "Scripture Journey" : "Sermon Outline"}
      </p>
      <h3 className="text-lg font-bold text-white mb-1">{sermon.title}</h3>
      {isScripture && (
        <p className="text-[#6b7f9e] text-xs mb-5">
          This week&apos;s sermon visits multiple passages. Follow along below.
        </p>
      )}
      {!isScripture && <div className="mb-5" />}

      <ol className="space-y-3">
        {sermon.outline.map((point, i) => (
          <li key={i} className="flex gap-3">
            <span
              className="mt-0.5 w-5 h-5 rounded-full bg-[#00205B] text-[#00abc9] text-[10px] font-bold flex items-center justify-center shrink-0"
            >
              {i + 1}
            </span>
            <span className="text-sm text-[#c8d4e8] leading-snug">{point}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ── Notes tab ─────────────────────────────────────────────────────────────────

function NotesTab({ sermon }: { sermon: SermonData }) {
  const { notes, save, emailNotes, copyNotes } = useNotes(sermon.date);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyNotes();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-5 py-6 max-w-xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#00abc9] text-xs font-semibold tracking-widest uppercase">My Notes</p>
          <p className="text-[11px] text-[#4a5568] mt-0.5">Saved automatically</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            disabled={!notes}
            className="text-[11px] font-semibold text-[#6b7f9e] hover:text-white disabled:opacity-30 transition-colors px-2 py-1 rounded border border-white/10"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={() => emailNotes(sermon.title)}
            disabled={!notes}
            className="text-[11px] font-semibold text-[#6b7f9e] hover:text-white disabled:opacity-30 transition-colors px-2 py-1 rounded border border-white/10"
          >
            Email
          </button>
        </div>
      </div>

      <textarea
        value={notes}
        onChange={(e) => save(e.target.value)}
        placeholder={`Notes for "${sermon.title}"…\n\nWrite anything you want to remember from today's message.`}
        className="w-full h-60 rounded-xl bg-white/5 border border-white/10 text-sm text-[#c8d4e8] placeholder-[#4a5568] p-4 resize-none focus:outline-none focus:border-[#00abc9]/50 transition-colors leading-relaxed"
      />

      <p className="text-[10px] text-[#4a5568]">
        Notes are saved on this device only. Use Email to keep them.
      </p>
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
        <div className="w-12 h-12 rounded-full bg-[#00abc9]/20 flex items-center justify-center mx-auto mb-4 text-2xl">
          🙏
        </div>
        <h3 className="text-lg font-bold text-white mb-2">We&apos;re praying for you</h3>
        <p className="text-sm text-[#6b7f9e]">
          Your request has been received. Our prayer team will lift this up.
        </p>
      </div>
    );
  }

  return (
    <div className="px-5 py-6 max-w-xl mx-auto">
      <p className="text-[#00abc9] text-xs font-semibold tracking-widest uppercase mb-1">Prayer Request</p>
      <p className="text-[#6b7f9e] text-sm mb-5">
        Our prayer team reviews every request during and after the service.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#6b7f9e] mb-1.5 uppercase tracking-wide">
            Your Name <span className="text-[#00abc9]">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="First name is fine"
            className="w-full rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-[#4a5568] px-4 py-2.5 focus:outline-none focus:border-[#00abc9]/60 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#6b7f9e] mb-1.5 uppercase tracking-wide">
            Prayer Request <span className="text-[#00abc9]">*</span>
          </label>
          <textarea
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            required
            placeholder="Share what's on your heart…"
            rows={4}
            className="w-full rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-[#4a5568] px-4 py-2.5 focus:outline-none focus:border-[#00abc9]/60 transition-colors resize-none leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#6b7f9e] mb-1.5 uppercase tracking-wide">
            Email <span className="text-[#4a5568] font-normal normal-case">(optional — for follow-up)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-[#4a5568] px-4 py-2.5 focus:outline-none focus:border-[#00abc9]/60 transition-colors"
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="w-4 h-4 rounded accent-[#00abc9]"
          />
          <span className="text-sm text-[#6b7f9e]">Keep this request private (prayer team only)</span>
        </label>

        {status === "error" && (
          <p className="text-red-400 text-sm">Something went wrong. Please try again.</p>
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
    <div className="min-h-screen bg-[#0d1525] text-white">
      {/* Hero */}
      <div className="relative flex flex-col items-center justify-center text-center px-4 pt-24 pb-16">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(0,33,91,0.6) 0%, transparent 70%)" }}
        />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-[#6b7f9e] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6b7f9e]" />
            Live Sundays 8:30 &amp; 11:00 AM ET
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Watch Brainerd<br className="hidden sm:block" /> Baptist Live
          </h1>
          <p className="text-[#6b7f9e] text-lg mb-10 leading-relaxed">
            Join us in person or online every Sunday morning.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={sermon.watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
              Watch Latest Sermon
            </a>
            <a href="/plan-your-visit" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00abc9] hover:text-white transition-colors">
              Plan a Visit
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7h8M8 4l3 3-3 3"/></svg>
            </a>
          </div>
        </div>
      </div>

      {/* Latest sermon card */}
      {sermon.youtubeId && (
        <div className="max-w-4xl mx-auto px-4 pb-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#6b7f9e] mb-5 text-center">Most Recent Sermon</p>
          <div className="rounded-2xl overflow-hidden border border-white/8 shadow-xl shadow-black/40 bg-[#162030]">
            <div className="grid md:grid-cols-5">
              <div className="md:col-span-2 relative min-h-[200px] bg-[#00205B] flex items-center justify-center">
                {sermon.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sermon.thumbnail} alt={sermon.title} className="absolute inset-0 w-full h-full object-cover opacity-70" />
                )}
                <div className="absolute inset-0 bg-[#00205B]/50" />
                <a href={sermon.watchUrl} target="_blank" rel="noopener noreferrer" className="relative z-10" aria-label={`Watch ${sermon.title}`}>
                  <div className="w-14 h-14 rounded-full bg-[#00abc9] hover:bg-[#0090a8] flex items-center justify-center transition-all shadow-lg hover:scale-105">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
                  </div>
                </a>
              </div>
              <div className="md:col-span-3 p-7 md:p-9 flex flex-col justify-center">
                {sermon.passage && <p className="text-[#00abc9] text-xs font-semibold tracking-widest uppercase mb-2">{sermon.passage}</p>}
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3 leading-tight">{sermon.title}</h3>
                <p className="text-sm text-[#6b7f9e] mb-5">{date} · Curtis Hill</p>
                <a href={sermon.watchUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm inline-block self-start">
                  Watch Now
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service times */}
      <div className="border-t border-white/5 py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#6b7f9e] mb-7 text-center">Sunday Services</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { time: "8:30 AM", style: "Choir & Orchestra", note: "Traditional format" },
              { time: "11:00 AM", style: "Band-Led Worship",  note: "Contemporary format" },
            ].map((svc) => (
              <div key={svc.time} className="rounded-xl border border-white/8 bg-white/4 p-6">
                <span className="text-2xl font-bold text-white block mb-1">{svc.time}</span>
                <span className="text-[#00abc9] text-sm font-semibold block">{svc.style}</span>
                <span className="text-[#6b7f9e] text-xs">{svc.note}</span>
              </div>
            ))}
          </div>
          <div className="mt-7 text-center">
            <a href="/plan-your-visit" className="text-sm font-semibold text-[#00abc9] hover:text-white transition-colors inline-flex items-center gap-1.5">
              Get directions &amp; parking info
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7h8M8 4l3 3-3 3"/></svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
