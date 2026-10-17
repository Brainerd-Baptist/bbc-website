"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { matchCatalog, careLevel } from "@/lib/search-match";
import { CATALOG_BY_ID, CHURCH_PHONE, CHURCH_PHONE_HREF } from "@/lib/search-catalog";
import type { SearchResponse, SearchResult } from "@/lib/search-types";

const STARTERS = [
  "Plan a visit",
  "Kids check-in",
  "Service times",
  "Where do I park?",
  "Watch online",
  "I'm new here",
];

function localResults(q: string): SearchResult[] {
  return matchCatalog(q, 4).matches.map(({ entry: e }) => ({
    id: e.id,
    title: e.title,
    url: e.url,
    summary: e.summary,
    kind: e.kind,
    mapUrl: e.mapId && !e.url.startsWith("/map") ? `/map?to=${e.mapId}` : undefined,
  }));
}

function ResultLink({
  href,
  external,
  onNavigate,
  children,
  className,
}: {
  href: string;
  external?: boolean;
  onNavigate?: () => void;
  children: React.ReactNode;
  className: string;
}) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" data-sr className={className} onClick={onNavigate}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} data-sr className={className} onClick={onNavigate}>
      {children}
    </Link>
  );
}

export default function SearchPanel({
  initialQuery = "",
  autoFocus = false,
  onNavigate,
}: {
  initialQuery?: string;
  autoFocus?: boolean;
  onNavigate?: () => void;
}) {
  const [q, setQ] = useState(initialQuery);
  const [remote, setRemote] = useState<{ q: string; data: SearchResponse } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trimmed = q.trim();
  const active = trimmed.length >= 2;

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  function run(query: string) {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(false);
    fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: query }),
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: SearchResponse) => {
        setRemote({ q: query, data });
        setLoading(false);
      })
      .catch((e) => {
        if (e?.name === "AbortError") return;
        setError(true);
        setLoading(false);
      });
  }

  // Debounced server call; the instant local matches show while it works.
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!active) {
      abortRef.current?.abort();
      return;
    }
    timerRef.current = setTimeout(() => run(trimmed), 350);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [trimmed, active]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const local = useMemo(() => (active ? localResults(trimmed) : []), [active, trimmed]);
  const localCare = useMemo(() => (active ? careLevel(trimmed) : null), [active, trimmed]);
  const fresh = remote && remote.q === trimmed ? remote.data : null;

  const care = fresh?.care ?? (localCare ? { level: localCare, phone: CHURCH_PHONE } : null);
  const results: SearchResult[] = fresh
    ? fresh.results
    : care
      ? [CATALOG_BY_ID["care"]].filter(Boolean).map((e) => ({ id: e.id, title: e.title, url: e.url, summary: e.summary, kind: e.kind }))
      : local;
  const sermons = fresh?.sermons ?? [];
  const showFallback = fresh?.fallback === true && !care;
  const settled = !!fresh && !loading;
  const busy = loading && active;

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const items = Array.from(rootRef.current?.querySelectorAll<HTMLElement>("[data-sr], input[type=search]") ?? []);
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (i < 0) return;
    e.preventDefault();
    const next = e.key === "ArrowDown" ? Math.min(i + 1, items.length - 1) : Math.max(i - 1, 0);
    items[next]?.focus();
  }

  const cardCls =
    "block rounded-2xl border border-border bg-surface-raised px-5 py-4 transition hover:border-accent/50 hover:bg-hover-subtle focus-visible:outline-2 focus-visible:outline-offset-2";

  return (
    <div ref={rootRef} onKeyDown={onKeyDown}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (active) {
            if (timerRef.current) clearTimeout(timerRef.current);
            run(trimmed);
          }
        }}
      >
        <label htmlFor="site-search-input" className="sr-only">
          Search the Brainerd Baptist website
        </label>
        <div className="relative">
          <svg
            className="absolute left-5 top-1/2 -translate-y-1/2 text-fg-muted"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            id="site-search-input"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="What are you looking for?"
            autoComplete="off"
            enterKeyHint="search"
            maxLength={200}
            className="w-full pl-14 pr-5 py-4 rounded-2xl border border-border-strong bg-surface-raised text-fg placeholder:text-fg-muted text-base"
          />
        </div>
      </form>

      <div className="mt-5" aria-live="polite">
        {!active && (
          <div>
            <p className="text-fg-muted text-sm mb-3">
              Ask in your own words. For example, &ldquo;where do I take my kids?&rdquo; or &ldquo;I&rsquo;m new in town.&rdquo;
            </p>
            <div className="flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setQ(s);
                    inputRef.current?.focus();
                  }}
                  className="text-sm px-4 py-2 rounded-full border border-border-strong text-fg-muted hover:border-accent/50 hover:text-fg transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {active && care && (
          <div className="rounded-2xl border border-border bg-hover-subtle px-5 py-5 mb-4" role="note">
            {care.level === "crisis" ? (
              <>
                <p className="text-fg text-sm leading-relaxed">
                  We&rsquo;re so sorry you&rsquo;re carrying this. If you or someone else is in immediate danger, please call 911.
                  If you&rsquo;re thinking about hurting yourself, call or text 988 (the Suicide &amp; Crisis Lifeline) right now. It&rsquo;s free and open all day and night.
                </p>
                <p className="text-fg-muted text-sm leading-relaxed mt-3">
                  Our care team would also like to hear from you. Call the church office at{" "}
                  <a className="text-accent-text underline underline-offset-2" href={CHURCH_PHONE_HREF}>{CHURCH_PHONE}</a>{" "}
                  or write to them below. This goes only to them.
                </p>
              </>
            ) : (
              <p className="text-fg text-sm leading-relaxed">
                We&rsquo;re glad you reached out. A real person on our care team would like to help. Write to them below, privately, or call the church office at{" "}
                <a className="text-accent-text underline underline-offset-2" href={CHURCH_PHONE_HREF}>{CHURCH_PHONE}</a>.
              </p>
            )}
          </div>
        )}

        {active && results.length > 0 && (
          <ul className="space-y-3">
            {results.map((r) => (
              <li key={r.id}>
                <ResultLink href={r.url} external={r.url.startsWith("http")} onNavigate={onNavigate} className={cardCls}>
                  <span className="flex items-start justify-between gap-4">
                    <span>
                      <span className="block text-fg font-medium">{r.title}</span>
                      <span className="block text-fg-muted text-sm leading-relaxed mt-1">{r.summary}</span>
                    </span>
                    <span aria-hidden="true" className="text-accent-text mt-0.5">
                      {r.url.startsWith("http") ? "↗" : "→"}
                    </span>
                  </span>
                </ResultLink>
                {r.mapUrl && (
                  <ResultLink
                    href={r.mapUrl}
                    onNavigate={onNavigate}
                    className="inline-block mt-2 ml-1 text-sm text-accent-text underline underline-offset-2"
                  >
                    Show me on the map
                  </ResultLink>
                )}
              </li>
            ))}
          </ul>
        )}

        {active && sermons.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-semibold tracking-widest uppercase text-accent-text mb-3">Sermons</p>
            <ul className="space-y-2">
              {sermons.map((s) => (
                <li key={s.url}>
                  <ResultLink href={s.url} onNavigate={onNavigate} className={cardCls}>
                    <span className="block text-fg font-medium">{s.title}</span>
                    {s.meta && <span className="block text-fg-muted text-sm mt-0.5">{s.meta}</span>}
                  </ResultLink>
                </li>
              ))}
            </ul>
          </div>
        )}

        {active && busy && !results.length && (
          <p className="text-fg-muted text-sm">Looking&hellip;</p>
        )}

        {active && showFallback && (
          <p className="text-fg-muted text-sm leading-relaxed mt-4">
            We couldn&rsquo;t find an exact match, and we&rsquo;d rather point you to a person than guess. Call the office at{" "}
            <a className="text-accent-text underline underline-offset-2" href={CHURCH_PHONE_HREF}>{CHURCH_PHONE}</a>, or send a message below.
          </p>
        )}

        {active && error && !results.length && (
          <p className="text-fg-muted text-sm leading-relaxed">
            Search hit a snag. Try again in a moment, or call the office at{" "}
            <a className="text-accent-text underline underline-offset-2" href={CHURCH_PHONE_HREF}>{CHURCH_PHONE}</a>.
          </p>
        )}

        {active && settled && !care && (
          <p className="text-center mt-8">
            <ResultLink
              href="/connect/staff"
              onNavigate={onNavigate}
              className="text-fg-muted text-xs hover:text-accent-text transition-colors underline underline-offset-2"
            >
              Prefer to talk to a person? Contact a pastor or staff member
            </ResultLink>
          </p>
        )}
      </div>
    </div>
  );
}
