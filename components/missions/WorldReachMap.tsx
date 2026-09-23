"use client";

import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { IDENTITY } from "@/lib/identity-colors";

// A real world map (Natural Earth, via react-simple-maps + a bundled
// world-atlas topojson) rather than a hand-drawn illustration -- with one
// pin per region named in the missions copy. Pin coordinates are
// region-level centroids (illustrative, not specific partner sites) until
// real short-term/partner locations are supplied, at which point REGIONS
// below is the only thing that needs to change.
const GEO_URL = "/missions/countries-110m.json";

const REGIONS = [
  {
    key: "americas",
    label: "Central & South America",
    note: "Church-planting partners and short-term teams throughout the region.",
    coordinates: [-66, 2] as [number, number],
  },
  {
    key: "africa",
    label: "Africa",
    note: "Long-term missionary partners and gospel work across the continent.",
    coordinates: [21, 5] as [number, number],
  },
  {
    key: "middle-east",
    label: "Middle East",
    note: "Trusted partners serving among unreached peoples.",
    coordinates: [45, 27] as [number, number],
  },
  {
    key: "asia",
    label: "Asia",
    note: "Church-planting networks and ongoing partner support.",
    coordinates: [100, 27] as [number, number],
  },
];

export default function WorldReachMap() {
  const [active, setActive] = useState<string>(REGIONS[0].key);
  const activeRegion = REGIONS.find((r) => r.key === active) ?? REGIONS[0];

  return (
    <div className="rounded-2xl overflow-hidden border border-border bg-surface-sunken">
      <div className="relative w-full" style={{ aspectRatio: "1000 / 520" }}>
        <ComposableMap
          projectionConfig={{ scale: 148, center: [10, 8] }}
          className="absolute inset-0 w-full h-full"
          role="img"
          aria-label="World map of the regions where Brainerd Missions partners"
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    fill: "var(--surface-raised)",
                    stroke: "var(--border-strong)",
                    strokeWidth: 0.5,
                    outline: "none",
                  }}
                />
              ))
            }
          </Geographies>

          {REGIONS.map((r) => {
            const isActive = r.key === active;
            return (
              <Marker
                key={r.key}
                coordinates={r.coordinates}
                onClick={() => setActive(r.key)}
                style={{ cursor: "pointer" }}
              >
                {isActive && (
                  <circle r={9} fill={IDENTITY.missions.hue} opacity={0.25}>
                    <animate attributeName="r" values="7;14;7" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.35;0.05;0.35" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  r={isActive ? 6 : 4.5}
                  fill={IDENTITY.missions.hue}
                  stroke="var(--surface)"
                  strokeWidth={1.5}
                  onMouseEnter={() => setActive(r.key)}
                />
                <circle r={1.75} fill="var(--surface)" />
              </Marker>
            );
          })}
        </ComposableMap>
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
          style={{ color: IDENTITY.missions.light, fontSize: "1.2rem" }}
        >
          {activeRegion.label}
        </h3>
        <p className="text-fg-muted text-sm leading-relaxed">{activeRegion.note}</p>
      </div>
    </div>
  );
}
