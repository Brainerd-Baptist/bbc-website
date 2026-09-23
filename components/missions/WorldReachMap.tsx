"use client";

import { useState } from "react";
import { IDENTITY, inkVars } from "@/lib/identity-colors";

// A stylized, decorative world silhouette -- not cartographically precise --
// with one pin per region named in the missions copy. Coordinates are
// illustrative placeholders (region-level, not specific partner sites) until
// real short-term/partner locations are supplied, at which point REGIONS
// below is the only thing that needs to change.
const REGIONS = [
  {
    key: "americas",
    label: "Central & South America",
    note: "Church-planting partners and short-term teams throughout the region.",
    x: 255,
    y: 320,
  },
  {
    key: "africa",
    label: "Africa",
    note: "Long-term missionary partners and gospel work across the continent.",
    x: 530,
    y: 300,
  },
  {
    key: "middle-east",
    label: "Middle East",
    note: "Trusted partners serving among unreached peoples.",
    x: 600,
    y: 225,
  },
  {
    key: "asia",
    label: "Asia",
    note: "Church-planting networks and ongoing partner support.",
    x: 745,
    y: 235,
  },
];

// Rough, hand-drawn continent silhouettes -- decorative backdrop for the
// pins, not a precise projection.
const LANDMASSES = [
  // North America
  "M120,120 C170,100 230,110 260,140 C280,165 270,200 240,220 C210,240 180,235 160,260 C140,285 130,260 110,240 C90,220 95,180 100,160 C105,140 100,130 120,120 Z",
  // South & Central America
  "M200,280 C230,270 260,285 270,320 C280,355 260,400 240,430 C225,455 205,440 200,410 C195,380 185,350 190,320 C193,300 190,290 200,280 Z",
  // Europe
  "M470,120 C500,105 530,110 545,130 C555,145 540,160 520,165 C500,170 480,160 465,145 C458,135 462,125 470,120 Z",
  // Africa
  "M480,190 C520,180 560,195 575,230 C590,265 585,310 565,345 C550,370 525,375 510,350 C495,325 485,290 480,255 C476,230 470,205 480,190 Z",
  // Middle East / Central Asia
  "M580,175 C610,165 640,175 650,200 C658,220 640,235 615,235 C595,235 580,220 575,200 C573,190 574,180 580,175 Z",
  // Asia
  "M660,130 C720,110 800,120 840,155 C865,178 850,210 810,225 C775,238 735,230 705,215 C680,203 660,185 655,165 C652,150 652,140 660,130 Z",
  // Australia
  "M780,340 C815,332 850,345 860,370 C868,390 850,405 820,405 C795,405 775,392 770,373 C767,360 770,346 780,340 Z",
];

export default function WorldReachMap() {
  const [active, setActive] = useState<string>(REGIONS[0].key);
  const activeRegion = REGIONS.find((r) => r.key === active) ?? REGIONS[0];

  return (
    <div className="rounded-2xl overflow-hidden border border-border bg-surface-sunken">
      <div className="relative w-full" style={{ aspectRatio: "1000 / 460" }}>
        <svg
          viewBox="0 0 1000 460"
          className="absolute inset-0 w-full h-full"
          role="img"
          aria-label="Illustrated map of the regions where Brainerd Missions partners"
        >
          {/* graticule */}
          {Array.from({ length: 9 }).map((_, i) => (
            <line
              key={`h${i}`}
              x1={0}
              x2={1000}
              y1={i * 57.5}
              y2={i * 57.5}
              stroke="var(--border)"
              strokeWidth={1}
              opacity={0.35}
            />
          ))}
          {Array.from({ length: 17 }).map((_, i) => (
            <line
              key={`v${i}`}
              x1={i * 62.5}
              x2={i * 62.5}
              y1={0}
              y2={460}
              stroke="var(--border)"
              strokeWidth={1}
              opacity={0.35}
            />
          ))}

          {LANDMASSES.map((d, i) => (
            <path key={i} d={d} fill="var(--surface-raised)" stroke="var(--border-strong)" strokeWidth={1.5} />
          ))}

          {REGIONS.map((r) => {
            const isActive = r.key === active;
            return (
              <g
                key={r.key}
                onClick={() => setActive(r.key)}
                onMouseEnter={() => setActive(r.key)}
                style={{ cursor: "pointer" }}
              >
                {isActive && (
                  <circle cx={r.x} cy={r.y} r={14} fill={IDENTITY.missions.hue} opacity={0.25}>
                    <animate attributeName="r" values="10;18;10" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.35;0.05;0.35" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={r.x}
                  cy={r.y}
                  r={isActive ? 8 : 6}
                  fill={IDENTITY.missions.hue}
                  stroke="var(--surface)"
                  strokeWidth={2}
                />
                <circle cx={r.x} cy={r.y} r={2.5} fill="var(--surface)" />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Region tabs + detail */}
      <div className="p-6 md:p-8 border-t border-border">
        <div className="flex flex-wrap gap-2 mb-5">
          {REGIONS.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setActive(r.key)}
              className="text-xs font-semibold tracking-wide uppercase px-4 py-2 rounded-full border transition"
              style={
                r.key === active
                  ? { background: IDENTITY.missions.solid, color: "var(--fg-on-accent)", borderColor: IDENTITY.missions.solid }
                  : { borderColor: "var(--border-strong)", color: "var(--fg-muted)" }
              }
            >
              {r.label}
            </button>
          ))}
        </div>
        <h3
          className="font-condensed font-800 identity-ink mb-1"
          style={{ ...inkVars(IDENTITY.missions), fontSize: "1.2rem" }}
        >
          {activeRegion.label}
        </h3>
        <p className="text-fg-muted text-sm leading-relaxed">{activeRegion.note}</p>
      </div>
    </div>
  );
}
