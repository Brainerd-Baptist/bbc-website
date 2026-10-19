"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FeedCountry, Level, MissionsFeed } from "@/lib/missions/feed";
import type { MapShapes } from "@/lib/missions/shapes";

// The live missions map: every country Brainerd is engaged in, coloured by engagement level. The data is
// edited in Brainerd Mail (Missions) and arrives through lib/missions/feed.ts, so a change the missions
// team saves shows up here within seconds. Built phone first: pinch to zoom, drag to pan, big tap targets,
// region jumps, and a List view that is also the keyboard and screen-reader way in (the map shapes are
// pointer-only on purpose, so nobody has to tab through 47 invisible stops).

const W = 1000;
const FULL_H = 520;
// The very bottom of the world map is empty ocean; crop it so the map fills its frame.
const H = FULL_H - 62;
const Y0 = 20;
const MAX_ZOOM = 8;

type VB = { x: number; y: number; w: number };
const hOf = (w: number) => (w * H) / W;
const clampVB = (v: VB): VB => {
  const w = Math.min(W, Math.max(W / MAX_ZOOM, v.w));
  const h = hOf(w);
  return { w, x: Math.min(W - w, Math.max(0, v.x)), y: Math.min(FULL_H - h, Math.max(Y0 - 4, v.y)) };
};
const HOME: VB = { x: 0, y: Y0, w: W };

// Where each region chip zooms to (map units; centred, then fitted to the frame).
const REGIONS = [
  { key: "world", label: "World", box: null },
  { key: "americas", label: "Americas", box: { x: 0, y: 60, w: 720 } },
  { key: "europe", label: "Europe & Middle East", box: { x: 395, y: 74, w: 347 } },
  { key: "africa", label: "Africa", box: { x: 312, y: 170, w: 459 } },
  { key: "asia", label: "Asia & Pacific", box: { x: 582, y: 126, w: 395 } },
] as const;
const regionVB = (box: { x: number; y: number; w: number } | null): VB => {
  if (!box) return HOME;
  const w = box.w * (FULL_H / H);
  return clampVB({ x: box.x + box.w / 2 - w / 2, y: box.y + (box.w * (FULL_H / W)) / 2 - hOf(w) / 2, w });
};

const LEVEL_FILL: Record<Level, string> = { 1: "var(--viz-level-1)", 2: "var(--viz-level-2)", 3: "var(--viz-level-3)" };

function facts(c: FeedCountry, levelLabel: string): [string, string][] {
  return ([
    ["Engagement Level", levelLabel],
    ["Engaged Since", c.since],
    ["Primary Religion", c.religion],
    ["Engaged People Group", c.peopleGroup],
    ["Unreached People Groups", c.unreachedGroups],
    ["Unreached Population", c.unreachedPop],
  ] as [string, string][]).filter(([, v]) => v !== "");
}

function Facts({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="grid gap-x-4 gap-y-1.5 text-sm leading-snug" style={{ gridTemplateColumns: "auto 1fr" }}>
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="font-semibold text-fg-muted">{k}</dt>
          <dd className="text-fg m-0">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Dot({ level }: { level: Level }) {
  return <span aria-hidden="true" className="inline-block rounded-full shrink-0 w-3 h-3" style={{ background: LEVEL_FILL[level] }} />;
}

export default function MissionsEngagementMap({ feed, shapes }: { feed: MissionsFeed; shapes: MapShapes }) {
  const byId = useMemo(() => new Map(feed.countries.map((c) => [c.id, c])), [feed.countries]);
  const label = useCallback((l: Level) => feed.levels.find((x) => x.level === l)?.label ?? `Level ${l}`, [feed.levels]);

  const [filter, setFilter] = useState<0 | Level>(0);
  const [view, setView] = useState<"map" | "list">("map");
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [vb, setVb] = useState<VB>(HOME);
  const [region, setRegion] = useState<string>("world");

  const vbRef = useRef(vb);
  const svgRef = useRef<SVGSVGElement>(null);
  const regionsRef = useRef<HTMLDivElement>(null);
  const animRef = useRef(0);
  const movedRef = useRef(false);
  const apply = useCallback((v: VB) => { vbRef.current = v; setVb(v); }, []);
  const zoomed = vb.w < W - 1;

  const shown = (c: FeedCountry) => filter === 0 || c.level === filter;
  const active = selected ?? hover;
  const activeCountry = active ? byId.get(active) ?? null : null;

  // Chip row: keep the chosen region centred in view.
  const centreChip = (key: string) => {
    const box = regionsRef.current, chip = box?.querySelector<HTMLElement>(`[data-region="${key}"]`);
    if (!box || !chip) return;
    box.scrollTo({ left: chip.offsetLeft - (box.clientWidth - chip.offsetWidth) / 2, behavior: "smooth" });
  };

  const jump = (key: string, box: (typeof REGIONS)[number]["box"]) => {
    setSelected(null);
    setRegion(key);
    centreChip(key);
    const to = regionVB(box), from = vbRef.current, id = ++animRef.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { apply(to); return; }
    let t0 = -1;
    const step = (t: number) => {
      if (id !== animRef.current) return;
      if (t0 < 0) t0 = t;
      const k = Math.min(1, (t - t0) / 280), e = 1 - Math.pow(1 - k, 3);
      apply(clampVB({ x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, w: from.w + (to.w - from.w) * e }));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // Zoom by factor f, keeping the point under (px, py) where it is.
  const zoomAt = useCallback((f: number, px: number, py: number) => {
    const svg = svgRef.current; if (!svg) return;
    const r = svg.getBoundingClientRect(), u = (px - r.left) / r.width, v = (py - r.top) / r.height, cur = vbRef.current;
    const gx = cur.x + u * cur.w, gy = cur.y + v * hOf(cur.w);
    const w = Math.min(W, Math.max(W / MAX_ZOOM, cur.w / f));
    apply(clampVB({ w, x: gx - u * w, y: gy - v * hOf(w) }));
    setRegion("");
  }, [apply]);
  const zoomCentre = (f: number) => {
    const r = svgRef.current?.getBoundingClientRect(); if (!r) return;
    animRef.current++; setSelected(null);
    zoomAt(f, r.left + r.width / 2, r.top + r.height / 2);
  };

  // Touch and mouse gestures: one finger drags when zoomed, two fingers pinch, a trackpad pinch or
  // Ctrl/Cmd + wheel zooms, double-click zooms. Attached by hand so the wheel handler can be non-passive.
  useEffect(() => {
    const svg = svgRef.current; if (!svg) return;
    const ptrs = new Map<number, { x: number; y: number }>();
    type G = { two: boolean; d: number; x: number; y: number; vb: VB; started: boolean };
    let g: G | null = null;
    const mid = () => { const a = [...ptrs.values()]; return { x: (a[0].x + a[1].x) / 2, y: (a[0].y + a[1].y) / 2, d: Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) }; };

    const down = (e: PointerEvent) => {
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); movedRef.current = false; animRef.current++;
      if (ptrs.size === 2) { const m = mid(); g = { two: true, d: m.d, x: m.x, y: m.y, vb: { ...vbRef.current }, started: true }; movedRef.current = true; setSelected(null); }
      else g = { two: false, d: 0, x: e.clientX, y: e.clientY, vb: { ...vbRef.current }, started: false };
    };
    const move = (e: PointerEvent) => {
      if (!ptrs.has(e.pointerId) || !g) return;
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const r = svg.getBoundingClientRect();
      if (ptrs.size >= 2 && g.two) {
        const m = mid(), w = Math.min(W, Math.max(W / MAX_ZOOM, g.vb.w / (m.d / g.d)));
        const gx = g.vb.x + ((g.x - r.left) / r.width) * g.vb.w, gy = g.vb.y + ((g.y - r.top) / r.height) * hOf(g.vb.w);
        apply(clampVB({ w, x: gx - ((m.x - r.left) / r.width) * w, y: gy - ((m.y - r.top) / r.height) * hOf(w) }));
        setRegion("");
      } else if (ptrs.size === 1 && !g.two && vbRef.current.w < W - 1) {
        const dx = e.clientX - g.x, dy = e.clientY - g.y;
        if (!g.started && Math.abs(dx) + Math.abs(dy) > 6) { g.started = true; movedRef.current = true; setSelected(null); try { svg.setPointerCapture(e.pointerId); } catch { /* not capturable */ } }
        if (g.started) { const k = g.vb.w / r.width; apply(clampVB({ w: g.vb.w, x: g.vb.x - dx * k, y: g.vb.y - dy * k })); setRegion(""); }
      }
    };
    const up = (e: PointerEvent) => {
      ptrs.delete(e.pointerId);
      if (ptrs.size === 1) { const a = [...ptrs.values()][0]; g = { two: false, d: 0, x: a.x, y: a.y, vb: { ...vbRef.current }, started: true }; }
      else if (!ptrs.size) { g = null; setTimeout(() => { movedRef.current = false; }, 0); }
    };
    const wheel = (e: WheelEvent) => { if (!(e.ctrlKey || e.metaKey)) return; e.preventDefault(); zoomAt(Math.exp(-e.deltaY * 0.012), e.clientX, e.clientY); };
    const dbl = (e: MouseEvent) => { if ((e.target as Element).closest("[data-id]")) return; zoomAt(e.shiftKey ? 0.5 : 2, e.clientX, e.clientY); };

    svg.addEventListener("pointerdown", down); svg.addEventListener("pointermove", move);
    svg.addEventListener("pointerup", up); svg.addEventListener("pointercancel", up);
    svg.addEventListener("wheel", wheel, { passive: false }); svg.addEventListener("dblclick", dbl);
    return () => {
      svg.removeEventListener("pointerdown", down); svg.removeEventListener("pointermove", move);
      svg.removeEventListener("pointerup", up); svg.removeEventListener("pointercancel", up);
      svg.removeEventListener("wheel", wheel); svg.removeEventListener("dblclick", dbl);
    };
  }, [apply, zoomAt]);

  const onPick = (id: string) => { if (movedRef.current) return; setSelected((cur) => (cur === id ? null : id)); };

  const stats: { key: 0 | Level; text: string; n: number; blurb: string }[] = [
    { key: 1, text: label(1), n: feed.counts[1], blurb: feed.levels[0].blurb },
    { key: 2, text: label(2), n: feed.counts[2], blurb: feed.levels[1].blurb },
    { key: 3, text: label(3), n: feed.counts[3], blurb: feed.levels[2].blurb },
    { key: 0, text: "Engaged countries", n: feed.counts.total, blurb: "" },
  ];

  const q = query.trim().toLowerCase();
  const updated = feed.updatedAt && !Number.isNaN(Date.parse(feed.updatedAt))
    ? new Date(feed.updatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })
    : "";

  const chip = "text-xs font-semibold tracking-wide uppercase rounded-full border whitespace-nowrap transition px-4";

  return (
    <div className="rounded-2xl overflow-hidden border border-border bg-surface-sunken">
      {/* View switch + region jumps */}
      <div className="flex flex-wrap items-center justify-center gap-3 px-4 pt-5 md:px-6">
        <div role="group" aria-label="How to look at the countries" className="inline-flex rounded-full border border-border-strong p-1">
          {(["map", "list"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => { setView(v); setSelected(null); }}
              className="rounded-full text-sm font-semibold px-5 min-h-11 transition"
              style={view === v ? { background: "var(--fg)", color: "var(--surface)" } : { color: "var(--fg-muted)" }}
            >
              {v === "map" ? "Map" : "List"}
            </button>
          ))}
        </div>
        {view === "map" && (
          <div
            ref={regionsRef}
            role="group"
            aria-label="Jump to a part of the world"
            className="flex gap-2 overflow-x-auto w-full md:w-auto md:overflow-visible pb-1 pr-6"
            style={{ scrollbarWidth: "none", maskImage: "linear-gradient(90deg, transparent 0, var(--fg) 12px, var(--fg) calc(100% - 34px), transparent 100%)" }}
          >
            {REGIONS.map((r) => (
              <button
                key={r.key}
                type="button"
                data-region={r.key}
                aria-pressed={region === r.key}
                aria-label={r.key === "world" ? "Show the whole world" : `Zoom to ${r.label}`}
                onClick={() => jump(r.key, r.box)}
                className={`${chip} min-h-11`}
                style={region === r.key ? { borderColor: "var(--fg)", color: "var(--fg)", background: "var(--hover-subtle)" } : { borderColor: "var(--border-strong)", color: "var(--fg-muted)" }}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {view === "map" ? (
        <>
          <div className="relative mt-3">
            <svg
              ref={svgRef}
              viewBox={`${vb.x} ${vb.y} ${vb.w} ${hOf(vb.w)}`}
              className="block w-full h-auto select-none"
              style={{ touchAction: zoomed ? "none" : "pan-y", cursor: zoomed ? "grab" : "default", WebkitTapHighlightColor: "transparent" }}
              role="img"
              aria-label={`World map of the ${feed.counts.total} countries where Brainerd is engaged in missions. Use the List view for the same information as text.`}
              onClick={(e) => { if (!(e.target as Element).closest("[data-id]") && !movedRef.current) setSelected(null); }}
            >
              <defs>
                <pattern id="missions-stripe" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <rect width="2.2" height="6" style={{ fill: "var(--surface)", opacity: 0.45 }} />
                </pattern>
              </defs>
              <path d={shapes.base} style={{ fill: "var(--viz-land)", stroke: "var(--viz-land-edge)", strokeWidth: 0.5, vectorEffect: "non-scaling-stroke" }} aria-hidden="true" />
              {shapes.hit.map((s) => {
                const c = byId.get(s.id); if (!c) return null;
                const on = shown(c), isActive = s.id === active;
                return (
                  <g key={s.id} data-id={s.id} aria-hidden="true">
                    <path
                      d={s.d}
                      style={{
                        fill: on ? LEVEL_FILL[c.level] : "var(--viz-land)",
                        opacity: on ? 1 : 0.55,
                        stroke: isActive ? "var(--fg)" : "var(--surface)",
                        strokeWidth: isActive ? 2 : 0.8,
                        vectorEffect: "non-scaling-stroke",
                        cursor: on ? "pointer" : "default",
                        pointerEvents: on ? "auto" : "none",
                        transition: "opacity .25s, fill .25s",
                      }}
                      onPointerEnter={(e) => { if (e.pointerType === "mouse" && on) setHover(s.id); }}
                      onPointerLeave={(e) => { if (e.pointerType === "mouse") setHover(null); }}
                      onClick={() => on && onPick(s.id)}
                    />
                    {c.level === 3 && on && <path d={s.d} style={{ fill: "url(#missions-stripe)", pointerEvents: "none" }} />}
                    {/* A wider invisible tap area so a fingertip can find small countries (Bahrain, Jamaica, Togo...). */}
                    {on && (
                      <path
                        d={s.d}
                        style={{ fill: "none", stroke: "transparent", strokeWidth: 22, strokeLinejoin: "round", vectorEffect: "non-scaling-stroke", pointerEvents: "stroke", cursor: "pointer" }}
                        onPointerEnter={(e) => { if (e.pointerType === "mouse") setHover(s.id); }}
                        onPointerLeave={(e) => { if (e.pointerType === "mouse") setHover(null); }}
                        onClick={() => onPick(s.id)}
                      />
                    )}
                  </g>
                );
              })}
            </svg>
            <div className="absolute flex flex-col gap-2 top-3 right-3">
              {[{ t: "+", l: "Zoom in", f: 1.7 }, { t: "−", l: "Zoom out", f: 1 / 1.7 }].map((b) => (
                <button
                  key={b.l}
                  type="button"
                  aria-label={b.l}
                  onClick={() => zoomCentre(b.f)}
                  className="w-11 h-11 rounded-full border border-border-strong text-lg font-semibold flex items-center justify-center"
                  style={{ background: "var(--surface-raised)", color: "var(--fg)" }}
                >
                  {b.t}
                </button>
              ))}
            </div>
          </div>

          {/* Details: tap a country (or hover on a computer). Always below the map, so it never covers it. */}
          <div aria-live="polite" className="mx-4 mt-3 md:mx-6 rounded-xl border border-border bg-surface-raised p-4" style={{ minHeight: "4.5rem" }}>
            {activeCountry ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Dot level={activeCountry.level} />
                  <h3 className="font-condensed font-800 text-fg" style={{ fontSize: "1.25rem" }}>{activeCountry.name}</h3>
                  {selected && (
                    <button type="button" aria-label="Close details" onClick={() => setSelected(null)} className="ml-auto w-11 h-11 -my-2 -mr-2 text-2xl leading-none text-fg-muted">&times;</button>
                  )}
                </div>
                <Facts rows={facts(activeCountry, label(activeCountry.level))} />
              </>
            ) : (
              <p className="text-fg-muted text-sm leading-relaxed m-0">
                <span className="md:hidden">Tap a highlighted country, pinch to zoom, or switch to the list.</span>
                <span className="hidden md:inline">Hover over a highlighted country to see details about Brainerd&apos;s engagement. Ctrl or &#8984; plus scroll to zoom.</span>
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="px-4 pt-4 pb-1 md:px-6">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search countries"
            aria-label="Search countries"
            autoComplete="off"
            enterKeyHint="search"
            className="w-full rounded-xl border border-border-strong bg-surface-raised text-fg px-4 min-h-12"
            style={{ fontSize: "16px" }}
          />
          {([1, 2, 3] as Level[]).map((lv) => {
            const items = feed.countries.filter((c) => c.level === lv && shown(c) && (!q || c.name.toLowerCase().includes(q))).sort((a, b) => a.name.localeCompare(b.name));
            if (!items.length) return null;
            return (
              <section key={lv} aria-label={`${label(lv)}, ${items.length} countries`}>
                <h3 className="flex items-center gap-2 mt-5 mb-1 label-micro text-fg-muted"><Dot level={lv} />{label(lv)} &middot; {items.length}</h3>
                {items.map((c) => (
                  <details key={c.id} className="group border-t border-border">
                    <summary className="flex items-center gap-3 min-h-12 py-2 cursor-pointer list-none text-fg font-semibold">
                      <span className="flex-1">{c.name}</span>
                      {c.since && <span className="text-sm font-normal text-fg-muted">Since {c.since}</span>}
                      <span aria-hidden="true" className="text-xl text-fg-muted transition-transform group-open:rotate-90">&rsaquo;</span>
                    </summary>
                    <div className="pb-4"><Facts rows={facts(c, label(lv))} /></div>
                  </details>
                ))}
              </section>
            );
          })}
          {!feed.countries.some((c) => shown(c) && (!q || c.name.toLowerCase().includes(q))) && <p className="text-fg-muted text-center py-8 m-0">No countries match.</p>}
        </div>
      )}

      {/* Level counters: the key, and a filter for both views. */}
      <div role="group" aria-label="Filter countries by engagement level" className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 md:p-6">
        {stats.map((s) => (
          <button
            key={s.key}
            type="button"
            aria-pressed={filter === s.key}
            onClick={() => { setFilter(filter === s.key ? 0 : s.key); setSelected(null); }}
            className="text-left rounded-xl border bg-surface-raised p-4 min-h-16 transition"
            style={{ borderColor: filter === s.key ? "var(--fg)" : "var(--border)" }}
          >
            <span className="flex items-center gap-2 label-micro text-fg-muted">
              {s.key !== 0 && <Dot level={s.key} />}
              {s.text}
            </span>
            <span className="block mt-1.5 font-condensed font-800 text-fg" style={{ fontSize: "2rem", lineHeight: 1 }}>
              {s.n}
              {s.key !== 0 && <small className="ml-1.5 text-sm font-normal text-fg-muted" style={{ fontFamily: "var(--font-barlow), sans-serif" }}>{s.n === 1 ? "country" : "countries"}</small>}
            </span>
            {s.blurb && <span className="hidden md:block mt-2 text-sm leading-snug text-fg-muted">{s.blurb}</span>}
          </button>
        ))}
      </div>
      {updated && <p className="px-4 pb-4 md:px-6 text-center text-xs text-fg-muted m-0">Updated {updated}</p>}
    </div>
  );
}
