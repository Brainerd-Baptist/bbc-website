/* Brainerd campus map: offline support (2026-10-14).
   Serve this file next to the map page (same folder), with the page passing
   { sw: 'map-sw.js', manifest: 'map.webmanifest', icon: 'map-icon-192.png' } in map_settings 'offline'.
   Pages: network first, so a new map version shows as soon as there is a signal; without one, the last good copy.
   Fonts: cache first. Nothing else is touched (no HQ API calls, no search log, no feedback). */
const CACHE = 'bbc-map-v1';
const FONT = /^https:\/\/fonts\.(googleapis|gstatic)\.com\//;
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k.startsWith('bbc-map-') && k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (r.mode === 'navigate' && u.origin === location.origin) {
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      try { const res = await fetch(r); if (res.ok) c.put(r, res.clone()); return res; }
      catch (err) { return (await c.match(r, { ignoreSearch: true })) || (await c.match(r)) || Response.error(); }
    })());
    return;
  }
  if (FONT.test(r.url) || (u.origin === location.origin && /map(\.webmanifest|-icon-\d+\.png)$/.test(u.pathname))) {
    e.respondWith((async () => {
      const c = await caches.open(CACHE); const hit = await c.match(r); if (hit) return hit;
      try { const res = await fetch(r); if (res.ok || res.type === 'opaque') c.put(r, res.clone()); return res; } catch (err) { return Response.error(); }
    })());
  }
});
