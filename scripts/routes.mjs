/**
 * scripts/routes.mjs
 *
 * Every route that renders site chrome, plus how the navbar is expected to
 * paint over it. Single source of truth for the visual-regression sweep.
 *
 * `navChrome` mirrors lib/nav-treatment.ts. It is duplicated here on purpose:
 * the test asserting the treatment should not import the thing it is testing,
 * or a wrong entry in that file would make the test agree with the bug.
 * Measured in a real browser by sampling the background behind the nav strip.
 */
export const ROUTES = [
  { path: "/", navChrome: "transparent" },
  { path: "/about", navChrome: "transparent" },
  { path: "/beliefs", navChrome: "transparent" },
  { path: "/bx", navChrome: "transparent" },
  { path: "/community", navChrome: "transparent" },
  { path: "/connect", navChrome: "glass" },
  { path: "/connect/ask", navChrome: "glass" },
  { path: "/connect/care", navChrome: "glass" },
  { path: "/connect/general", navChrome: "glass" },
  { path: "/connect/next-step", navChrome: "glass" },
  { path: "/connect/other", navChrome: "glass" },
  { path: "/connect/staff", navChrome: "glass" },
  { path: "/connect/stay-connected", navChrome: "glass" },
  { path: "/give", navChrome: "glass" },
  { path: "/life-groups", navChrome: "glass" },
  { path: "/live", navChrome: "transparent" },
  { path: "/ministries", navChrome: "transparent" },
  { path: "/ministries/kids", navChrome: "transparent" },
  { path: "/ministries/students", navChrome: "transparent" },
  { path: "/sermons", navChrome: "transparent" },
  { path: "/series/behind-the-scenes", navChrome: "transparent" },
  { path: "/sermons/bts-8", navChrome: "transparent" },
  { path: "/staff", navChrome: "glass" },
  { path: "/visit", navChrome: "transparent" },
  { path: "/wednesday", navChrome: "transparent" },
  { path: "/who-is-jesus", navChrome: "transparent" },
];

/** Routes deliberately excluded, with the reason, so the list stays honest. */
export const EXCLUDED = [
  { path: "/admin/analytics", why: "internal dashboard, not visitor-facing" },
  { path: "/studio", why: "Sanity Studio — third-party UI we do not theme" },
  { path: "/sermons/[slug]/notes", why: "standalone printable page, renders no chrome" },
];
