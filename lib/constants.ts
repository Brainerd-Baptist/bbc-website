import { IDENTITY } from "./identity-colors";
// ── Site-wide constants ─────────────────────────────────────────────────────

export const SITE = {
  name: "Brainerd Baptist Church",
  shortName: "BBC",
  tagline: "A church family in Chattanooga, Tennessee.",
  address: "300 Brookfield Ave, Chattanooga, TN 37411",
  phone: "",
  email: "",
  social: {
    facebook: "https://facebook.com/brainerdbaptist",
    instagram: "https://instagram.com/brainerdbaptist",
    youtube: "https://youtube.com/@brainerdbaptist",
  },
};

export const SERVICES = [
  {
    time: "8:30 AM",
    style: "Choir & Orchestra",
    note: null,
  },
  {
    time: "11:00 AM",
    style: "Band-Led",
    note: null,
  },
];

export const SERVICE_NOTE =
  "Both services prioritize the voices and singing of the congregation.";

export const LIFE_GROUP_TIME = "9:45 AM";

export const HISPANIC_MINISTRY = {
  address: "1203 Blocker Lane, Chattanooga, TN",
  serviceTime: "Sundays · 1:00 PM",
};

export const LEAD_PASTOR = {
  name: "Curtis Hill",
  title: "Lead Pastor",
  quote:
    "Our big prayer is that more and more people would experience and enjoy all the grace that God has for them in Jesus Christ.",
};

export const CHILD_CARE = [
  { age: "Nursery & Preschool", times: "8:30, 9:45, and 11:00" },
  {
    age: "Kindergarten and up",
    times: "Join families for worship",
  },
];

export const MINISTRIES = [
  {
    key: "kids",
    name: "Kids",
    description:
      "Nursery and preschool care at 8:30, 9:45, and 11:00. Kindergarten and up join their families for worship.",
    color: IDENTITY.kids.hue,
    icon: "kids",
  },
  {
    key: "students",
    name: "Students",
    description:
      "Middle and high school students growing in faith together through community and God's Word.",
    color: IDENTITY.students.hue,
    icon: "students",
  },
  {
    key: "lifegroups",
    name: "Life Groups",
    description:
      "Small groups meeting across Chattanooga on Sunday mornings and throughout the week.",
    color: IDENTITY.serve.hue,
    icon: "lifegroups",
  },
  {
    key: "missions",
    name: "Missions",
    description:
      "Carrying the gospel locally and globally — from our neighborhood to the nations.",
    color: IDENTITY.missions.hue,
    icon: "missions",
  },
  {
    key: "college",
    name: "College + Young Adults",
    description:
      "A community for college students and young adults navigating life and faith together.",
    color: IDENTITY.college.hue,
    icon: "college",
  },
  {
    key: "adults",
    name: "Adults",
    description:
      "Opportunities for adults at every stage of life to study Scripture, serve, and grow.",
    color: IDENTITY.adults.hue,
    icon: "adults",
  },
];

export const NAV_LINKS = [
  { label: "Visit", href: "/visit" },
  { label: "Sermons", href: "/sermons" },
  { label: "Ministries", href: "/ministries" },
  { label: "Midweek", href: "/wednesday" },
  { label: "Life Groups", href: "/life-groups" },
  { label: "Community", href: "/community" },
  { label: "The BX", href: "/bx" },
  { label: "Who Is Jesus?", href: "/who-is-jesus" },
  { label: "Give", href: "/give" },
  { label: "Staff", href: "/staff" },
  { label: "Connect", href: "/connect" },
];

// Church Center's hosted calendar — the actual destination for "Events"
// (the site itself has no /events page; see components/home/ThisWeek.tsx,
// which already links here). Shared as a constant so the footer below and
// anything else linking to it stay in sync.
export const CHURCH_CENTER_CALENDAR_URL = "https://brainerdbaptist.churchcenter.com/calendar";

// Kept in sync with components/nav/Navbar.tsx's NAV_GROUPS by hand — see
// claude/sermon-series-and-metadata-audit-2026-10-04.md-adjacent nav/footer
// reconciliation (asked about 2026-10-04): previously the footer and the
// nav drawer each had pages the other couldn't reach at all (About,
// Our Beliefs, History, Events, and Prayer were footer-only; Watch Live,
// Resources, Who Is Jesus?, Wednesday Night, and Membership were
// nav-only), and /history, /events, and /prayer below pointed at pages
// that don't exist on this site. Fixed: History points at the "Est. 1928"
// section of /about (its actual content), Events at the real Church
// Center calendar this site already uses elsewhere, and Prayer at the
// always-available Care & Support form (the dedicated in-service prayer
// tab on /live only exists during a live service, so it's not a fit for a
// footer link people may click any day of the week).
//
// 2026-10-05 reorder: "Who We Are" now mirrors the nav drawer's "More"
// group order (About, Staff, Our Beliefs, History, then Prayer/Give/
// Connect, moved here from Resources below to match). Resources dropped
// its standalone "Books & Resources" row — that content is tucked into
// the Sermons page itself now, same as the nav drawer's Sunday group —
// and gained Baptism above Membership, mirroring Next Steps.
export const FOOTER_LINKS = {
  "Who We Are": [
    { label: "About", href: "/about" },
    { label: "Staff", href: "/staff" },
    { label: "Our Beliefs", href: "/beliefs" },
    { label: "History", href: "/about#founded" },
    { label: "100 Years", href: "/about/timeline" },
    { label: "Who Is Jesus?", href: "/who-is-jesus" },
    { label: "Prayer", href: "/connect/care" },
    { label: "Give", href: "/give" },
    { label: "Connect", href: "/connect" },
  ],
  Ministries: [
    { label: "Children's Ministry", href: "/ministries/kids" },
    { label: "Students", href: "/ministries/students" },
    { label: "Life Groups", href: "/life-groups" },
    { label: "Missions", href: "/missions" },
    { label: "College + Young Adults", href: "/ministries/college" },
    { label: "Adults", href: "/connect" },
    { label: "Community", href: "/community" },
    { label: "The BX", href: "/bx" },
    { label: "Wednesday Night", href: "/wednesday" },
  ],
  Resources: [
    { label: "Sermons", href: "/sermons" },
    { label: "My Notes", href: "/my-notes" },
    { label: "Baptism", href: "/connect/next-step?interest=baptism" },
    { label: "Membership", href: "/membership" },
    { label: "Events", href: CHURCH_CENTER_CALENDAR_URL },
    { label: "Watch Live", href: "/live" },
  ],
};
