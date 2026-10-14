import { readFileSync } from "node:fs";
import { join } from "node:path";

// Public campus map. The map itself is a self-contained page built by the map
// project (lib/campus-map/public.html, the public build with no staff data).
// The file is a page fragment (no doctype), so the CSS goes in after its own
// style block. This route serves it at /map and adds the phone text sizes. Query and hash
// deep links (?to=, ?at=, #to.) reach the page untouched.
export const dynamic = "force-static";

const dir = join(process.cwd(), "lib", "campus-map");

export function GET() {
  const html = readFileSync(join(dir, "public.html"), "utf8");
  const css = readFileSync(join(dir, "phone-text.css"), "utf8");
  const offline = `<script>window.BBC_MAP_OFFLINE=${JSON.stringify({ sw: "/map-sw.js", manifest: "/map.webmanifest", icon: "/map-icon-180.png", scope: "/map" })};</script>`;
  // "Something wrong here? Tell us" posts anonymous reports to HQ (Campus Maps > Feedback). The map hides the button until it has this address.
  const hq = (process.env.MAP_FEEDBACK_URL || "https://www.brainerdhq.app/api/campus-maps/feedback").trim();
  const settings = `<script>window.BBC_MAP_ROOMS=${JSON.stringify({ rooms: [], settings: [{ key: "feedback_url", value: hq }] })};</script>`;
  const body = offline + settings + html.replace("</style>", `</style><style id="bbc-phone-text">${css}</style>`);
  return new Response(body, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
