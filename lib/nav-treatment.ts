/**
 * lib/nav-treatment.ts
 *
 * Decides how the navbar paints itself on a given route.
 *
 * WHY THIS EXISTS
 * The navbar used to be `bg-transparent` with a white logo and white
 * hamburger bars until you scrolled 48px. That is correct over a dark hero
 * and catastrophic over a white page: on /give, /connect (and its six
 * subpages), /life-groups and /staff the logo, the theme toggle and the
 * hamburger were white-on-white, i.e. invisible. Not merely ugly —
 * there was no way to open the menu or click home. Verified in the browser
 * against production before this file existed.
 *
 * HOW THE LIST WAS BUILT
 * Not by reading the source — grepping for a dark hex in a page's first
 * lines gives the wrong answer (/give contains #00205B near the top and
 * still renders white behind the nav). Each route was loaded in a real
 * browser and the effective background behind the nav strip was sampled
 * with elementsFromPoint at three x-positions, then converted to relative
 * luminance. "overlay" routes measured either a background-image or
 * luminance ≤ 0.02; "solid" routes measured 1.00 (pure white).
 *
 * FAIL-SAFE BY CONSTRUCTION
 * Anything not listed gets "solid" — the treatment that is always legible.
 * A new page therefore starts out readable and opts in to the transparent
 * treatment deliberately. The failure mode of a wrong guess is a nav that
 * looks plainer than intended, never one that disappears.
 *
 * WHEN YOU ADD A PAGE WITH A DARK HERO
 * Add its path here. If you forget, the nav still works.
 */

export type NavTreatment =
  /** Transparent over a dark hero or photo; light chrome, plus a scrim so the
   *  chrome stays legible even over a bright image. Condenses to glass on scroll. */
  | "overlay"
  /** Always-on glass surface with dark chrome in light mode. For pages whose
   *  content starts light directly under the nav. */
  | "solid";

/**
 * Routes measured as dark (or image-backed) directly beneath the nav.
 * A trailing "/*" marks a prefix match covering that route's children.
 */
const OVERLAY_ROUTES = [
  "/", // hero video / photo
  "/about", // L 0.02
  "/beliefs", // L 0.02
  "/bx", // background image
  "/community", // background image
  "/live", // L 0.01
  "/visit", // background image
  "/wednesday", // background image
  "/who-is-jesus", // background image
  "/ministries/*", // background image (index, kids, students)
  "/sermons/*", // background image (index, [slug], series/[seriesId])
  "/series/*", // dark gradient hero
  "/speakers/*", // dark gradient hero
  "/admin/*", // background image
] as const;

export function getNavTreatment(pathname: string | null | undefined): NavTreatment {
  if (!pathname) return "solid";

  // Normalise away a trailing slash so "/about/" matches "/about".
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

  for (const route of OVERLAY_ROUTES) {
    if (route.endsWith("/*")) {
      const base = route.slice(0, -2);
      if (path === base || path.startsWith(`${base}/`)) return "overlay";
    } else if (path === route) {
      return "overlay";
    }
  }

  return "solid";
}
