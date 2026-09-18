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
    color: "#c9a84c",
    icon: "kids",
  },
  {
    key: "students",
    name: "Students",
    description:
      "Middle and high school students growing in faith together through community and God's Word.",
    color: "#4a7fcb",
    icon: "students",
  },
  {
    key: "lifegroups",
    name: "Life Groups",
    description:
      "Small groups meeting across Chattanooga on Sunday mornings and throughout the week.",
    color: "#5cb87a",
    icon: "lifegroups",
  },
  {
    key: "missions",
    name: "Missions",
    description:
      "Carrying the gospel locally and globally — from our neighborhood to the nations.",
    color: "#e07b54",
    icon: "missions",
  },
  {
    key: "college",
    name: "College + Young Adults",
    description:
      "A community for college students and young adults navigating life and faith together.",
    color: "#9b6ecc",
    icon: "college",
  },
  {
    key: "adults",
    name: "Adults",
    description:
      "Opportunities for adults at every stage of life to study Scripture, serve, and grow.",
    color: "#4ab8c4",
    icon: "adults",
  },
];

export const NAV_LINKS = [
  { label: "Visit", href: "/visit" },
  { label: "Sermons", href: "/sermons" },
  { label: "Ministries", href: "/ministries" },
  { label: "Life Groups", href: "/life-groups" },
  { label: "Who Is Jesus?", href: "/who-is-jesus" },
  { label: "Give", href: "/give" },
  { label: "Staff", href: "/staff" },
  { label: "Connect", href: "/connect" },
];

export const FOOTER_LINKS = {
  "Who We Are": [
    { label: "About", href: "/about" },
    { label: "Our Beliefs", href: "/beliefs" },
    { label: "Staff", href: "/staff" },
    { label: "History", href: "/history" },
  ],
  Ministries: [
    { label: "Children's Ministry", href: "/ministries/kids" },
    { label: "Students", href: "/ministries/students" },
    { label: "Life Groups", href: "/life-groups" },
    { label: "Missions", href: "/ministries/missions" },
    { label: "College + Young Adults", href: "/ministries/college" },
    { label: "Adults", href: "/ministries/adults" },
  ],
  Resources: [
    { label: "Sermons", href: "/sermons" },
    { label: "Give", href: "/give" },
    { label: "Events", href: "/events" },
    { label: "Prayer", href: "/prayer" },
    { label: "Staff", href: "/staff" },
  { label: "Connect", href: "/connect" },
  ],
};
