/**
 * /admin/analytics — internal sermon engagement dashboard
 *
 * Data sources:
 *   • Supabase sermon_plays table (audio & video play events)
 *
 * No auth yet — keep the URL internal. Add middleware auth when ready.
 */

import { SERMONS } from "@/lib/sermons";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

export const revalidate = 300; // refresh every 5 min

// ── Types ─────────────────────────────────────────────────────────────────────

interface PlayRow {
  slug:       string;
  title:      string | null;
  media_type: "audio" | "video";
  event:      "start" | "half" | "complete";
  created_at: string;
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────

async function fetchPlays(since: string): Promise<PlayRow[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  try {
    const params = new URLSearchParams({
      select:     "slug,title,media_type,event,created_at",
      created_at: `gte.${since}`,
      order:      "created_at.asc",
      limit:      "10000",
    });
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/sermon_plays?${params}`,
      {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// ── Stat helpers ──────────────────────────────────────────────────────────────

function groupBySlug(plays: PlayRow[]) {
  const map: Record<string, { title: string; starts: number; halfs: number; completes: number; audio: number; video: number }> = {};
  for (const p of plays) {
    if (!map[p.slug]) {
      // Try to find title from static list if not in row
      const staticS = SERMONS.find((s) => s.id === p.slug);
      map[p.slug] = { title: p.title ?? staticS?.title ?? p.slug, starts: 0, halfs: 0, completes: 0, audio: 0, video: 0 };
    }
    if (p.event === "start")    map[p.slug].starts++;
    if (p.event === "half")     map[p.slug].halfs++;
    if (p.event === "complete") map[p.slug].completes++;
    if (p.media_type === "audio") map[p.slug].audio++;
    if (p.media_type === "video") map[p.slug].video++;
  }
  return Object.entries(map)
    .map(([slug, d]) => ({ slug, ...d }))
    .sort((a, b) => b.starts - a.starts);
}

function groupByDay(plays: PlayRow[]): { date: string; count: number }[] {
  const map: Record<string, number> = {};
  for (const p of plays) {
    if (p.event !== "start") continue;
    const day = p.created_at.slice(0, 10);
    map[day] = (map[day] ?? 0) + 1;
  }
  return Object.entries(map).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
}

function completionRate(plays: PlayRow[]) {
  const starts    = plays.filter((p) => p.event === "start").length;
  const halfs     = plays.filter((p) => p.event === "half").length;
  const completes = plays.filter((p) => p.event === "complete").length;
  return { starts, halfs, completes };
}

function mediaSplit(plays: PlayRow[]) {
  const starts = plays.filter((p) => p.event === "start");
  const audio  = starts.filter((p) => p.media_type === "audio").length;
  const video  = starts.filter((p) => p.media_type === "video").length;
  return { audio, video, total: starts.length };
}

// ── UI helpers ────────────────────────────────────────────────────────────────

function pct(a: number, b: number) {
  if (!b) return 0;
  return Math.round((a / b) * 100);
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AnalyticsPage() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const allTime       = "2020-01-01T00:00:00Z";

  const [recent, all] = await Promise.all([
    fetchPlays(thirtyDaysAgo),
    fetchPlays(allTime),
  ]);

  const noData = all.length === 0;

  const bySlug   = groupBySlug(all);
  const byDay    = groupByDay(recent);
  const funnel   = completionRate(recent);
  const split    = mediaSplit(recent);
  const maxStarts = Math.max(...bySlug.map((s) => s.starts), 1);
  const maxDay    = Math.max(...byDay.map((d) => d.count), 1);

  const navy    = "#00205B";
  const teal    = "#00abc9";
  const cardBg  = "#f4f6f9";
  const border  = "1px solid rgba(0,32,91,0.08)";

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-raised)", paddingBottom: "4rem" }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #00142a 0%, ${navy} 100%)`, padding: "5rem 1.5rem 2.5rem" }}>
        <div style={{ maxWidth: "64rem", margin: "0 auto" }}>
          <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", marginBottom: "2rem", textDecoration: "none" }}>
            ← Brainerd Baptist
          </a>
          <p style={{ color: teal, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Internal</p>
          <h1 style={{ color: "#fff", fontFamily: "var(--font-barlow-condensed), sans-serif", fontWeight: 800, fontSize: "clamp(1.75rem, 4vw, 2.5rem)", letterSpacing: "-0.03em", lineHeight: 1.05, margin: 0 }}>
            Sermon Analytics
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", marginTop: "0.5rem" }}>
            Last 30 days · refreshes every 5 min
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "64rem", margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* No data state */}
        {noData && (
          <div style={{ background: cardBg, border, borderRadius: "1rem", padding: "3rem", textAlign: "center" }}>
            <p style={{ color: navy, fontWeight: 600, marginBottom: "0.5rem" }}>No play data yet</p>
            <p style={{ color: "var(--fg-muted)", fontSize: "0.875rem" }}>
              Play tracking is live — data will appear here as sermons are played.
            </p>
            <p style={{ color: "var(--fg-muted)", fontSize: "0.75rem", marginTop: "1.5rem" }}>
              Make sure <code style={{ background: "var(--hover-subtle)", padding: "2px 6px", borderRadius: "4px" }}>SUPABASE_URL</code> and{" "}
              <code style={{ background: "var(--hover-subtle)", padding: "2px 6px", borderRadius: "4px" }}>SUPABASE_ANON_KEY</code> are set in Vercel.
            </p>
          </div>
        )}

        {!noData && (
          <>
            {/* ── KPI row ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
              {[
                { label: "Plays (30d)", value: funnel.starts.toLocaleString() },
                { label: "Reached 50%", value: `${pct(funnel.halfs, funnel.starts)}%` },
                { label: "Completed",   value: `${pct(funnel.completes, funnel.starts)}%` },
                { label: "Audio plays", value: `${pct(split.audio, split.total)}%` },
                { label: "Video plays", value: `${pct(split.video, split.total)}%` },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: cardBg, border, borderRadius: "1rem", padding: "1.25rem 1.5rem" }}>
                  <p style={{ color: "var(--fg-muted)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.25rem" }}>{label}</p>
                  <p style={{ color: navy, fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</p>
                </div>
              ))}
            </div>

            {/* ── Daily plays bar chart ── */}
            <div style={{ background: cardBg, border, borderRadius: "1rem", padding: "1.5rem 1.75rem", marginBottom: "1.5rem" }}>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.25rem" }}>Daily Plays — Last 30 Days</p>
              {byDay.length === 0 ? (
                <p style={{ color: "var(--fg-subtle)", fontSize: "0.875rem" }}>No plays in this period yet.</p>
              ) : (
                <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "80px" }}>
                  {byDay.map(({ date, count }) => (
                    <div key={date} title={`${date}: ${count} plays`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", height: "100%" }}>
                      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
                        <div style={{ width: "100%", background: teal, borderRadius: "3px 3px 0 0", height: `${Math.max(4, pct(count, maxDay))}%`, opacity: 0.85 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Top sermons ── */}
            <div style={{ background: cardBg, border, borderRadius: "1rem", padding: "1.5rem 1.75rem" }}>
              <p style={{ color: "var(--fg-muted)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
                Top Sermons — All Time
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {bySlug.slice(0, 15).map(({ slug, title, starts, halfs, completes, audio, video }) => (
                  <div key={slug}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.3rem", gap: "1rem" }}>
                      <a
                        href={`/sermons/${slug}`}
                        style={{ color: navy, fontSize: "0.85rem", fontWeight: 600, textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {title ?? slug}
                      </a>
                      <div style={{ display: "flex", gap: "1rem", flexShrink: 0 }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: navy }}>{starts} <span style={{ color: "var(--fg-muted)", fontWeight: 400 }}>plays</span></span>
                        <span style={{ fontSize: "0.7rem", color: "var(--fg-muted)" }}>{pct(halfs, starts)}% to 50%</span>
                        <span style={{ fontSize: "0.7rem", color: "var(--fg-muted)" }}>{pct(completes, starts)}% finished</span>
                        {audio > 0 && <span style={{ fontSize: "0.65rem", color: "var(--fg-subtle)" }}>🎧 {audio}</span>}
                        {video > 0 && <span style={{ fontSize: "0.65rem", color: "var(--fg-subtle)" }}>▶ {video}</span>}
                      </div>
                    </div>
                    <div style={{ height: "4px", background: "var(--hover-subtle)", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ height: "100%", background: teal, borderRadius: "2px", width: `${pct(starts, maxStarts)}%`, opacity: 0.7 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Setup instructions */}
        <div style={{ marginTop: "2rem", background: cardBg, border, borderRadius: "1rem", padding: "1.5rem 1.75rem" }}>
          <p style={{ color: "var(--fg-muted)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>Setup Checklist</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.8rem" }}>
            {[
              { done: !!SUPABASE_URL, label: "SUPABASE_URL set in Vercel" },
              { done: !!SUPABASE_KEY, label: "SUPABASE_ANON_KEY set in Vercel" },
              { done: all.length > 0,  label: "Sermon play events flowing to Supabase" },
            ].map(({ done, label }) => (
              <div key={label} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <span style={{ color: done ? "#22c55e" : "rgba(0,32,91,0.2)", fontWeight: 700 }}>{done ? "✓" : "○"}</span>
                <span style={{ color: done ? "rgba(0,32,91,0.6)" : "rgba(0,32,91,0.35)" }}>{label}</span>
              </div>
            ))}
          </div>
          {(!SUPABASE_URL || !SUPABASE_KEY) && (
            <div style={{ marginTop: "1rem", padding: "0.875rem 1rem", background: "var(--hover-subtle)", borderRadius: "0.5rem", fontSize: "0.75rem", color: "var(--fg-muted)" }}>
              Add these to Vercel → Project → Settings → Environment Variables:<br />
              <code style={{ display: "block", marginTop: "0.5rem", color: navy }}>SUPABASE_URL = https://brbfutiayugxwkgozouc.supabase.co</code>
              <code style={{ display: "block", marginTop: "0.25rem", color: navy }}>SUPABASE_ANON_KEY = eyJhbGci...</code>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
