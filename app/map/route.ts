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
  const viewport = '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">';
  const body = viewport + html.replace("</style>", `</style><style id="bbc-phone-text">${css}</style>`);
  return new Response(body, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      // Unlisted during the staff beta. Remove when the map is linked publicly.
      "x-robots-tag": "noindex, nofollow",
      "cache-control": "public, max-age=0, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
