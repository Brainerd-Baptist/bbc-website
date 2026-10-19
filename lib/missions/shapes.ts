// Country outlines for the missions map (Natural Earth, public domain; 1000 x 520 map space, one path per
// country). Outlines never change; only which countries are engaged does, and that comes from the feed.
// Same file as Brainerd Mail's, so a country is the same shape in the site, the embed and the emails.
import geo from "./geo.json";

export const MAP_W: number = geo.W;
export const MAP_H: number = geo.H;
export type MapShapes = { base: string; hit: { id: string; d: string }[] };

// The engaged countries individually (so they can be coloured and tapped), everything else as one land shape.
export function mapShapes(engaged: Iterable<string>): MapShapes {
  const ids = new Set(engaged);
  const hit: { id: string; d: string }[] = [];
  let base = geo.rest;
  for (const c of geo.countries) {
    if (ids.has(c.id)) hit.push({ id: c.id, d: c.d });
    else base += c.d;
  }
  return { base, hit };
}
