export interface SpeakerInfo {
  title: string
  /** Slug matching /public/staff/<slug>.jpg — set when photo is available */
  photo?: string
  /** Short bio paragraphs */
  bio?: string[]
  /** Optional family/secondary photo path under /public (e.g. /carousel/curtis-family.webp) */
  familyPhoto?: string
  /** Alt text for the family photo */
  familyPhotoAlt?: string
  /** Staff email — rendered client-side only to avoid static-HTML scraping */
  email?: string
}

/** Convert a speaker's display name to a URL slug */
export function speakerSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

/** Reverse-lookup: slug → display name */
export function speakerFromSlug(slug: string): string | null {
  return Object.keys(SPEAKERS).find((name) => speakerSlug(name) === slug) ?? null;
}

export const SPEAKERS: Record<string, SpeakerInfo> = {
  "Curtis Hill": {
    title: "Lead Pastor",
    photo: "hill_curtis_leadpastor",
    email: "chill@brainerdbaptist.org",
    familyPhoto: "/carousel/curtis-family.webp",
    familyPhotoAlt: "Curtis Hill with his family",
    bio: [
      "Curtis Hill grew up in Augusta, Georgia — which means he has strong opinions about The Masters — and was born in Oklahoma, which means he'll always pull for the Sooners.",
      "He earned his master's degree from Temple Baptist Seminary in Chattanooga and completed his doctorate in Expositional Preaching at The Southern Baptist Theological Seminary in Louisville, Kentucky.",
      "His early pastoral work began at Brainerd Baptist in various staff roles following seminary. He then served as Senior Pastor at Ogletown Baptist Church in Newark, Delaware for 15 years before returning to Brainerd in early 2023 as Lead Pastor.",
      "Curtis and his wife Shawna have been married nearly 25 years and have three children. The family lives in Chattanooga. When he's not preaching, you might find him trail running, reading several books at once, or making his way through a documentary. He enjoys spreadsheets and Venn diagrams, plays golf, and has a well-documented weakness for Reese's Peanut Butter Cups.",
    ],
  },
  "Josiah King": {
    title: "Operations Pastor",
    photo: "king_josiah_operationspastor",
    email: "jking@brainerdbaptist.org",
    bio: [
      "Josiah was born and raised in Chattanooga, and he and his family have called Brainerd home since 2010. While exploring God's calling for ministry, the Lord opened the door for him to serve in the Missions Office beginning in 2015. After several years in Missions, he had the opportunity to serve as the interim Kids Pastor before stepping into his current role as Operations Pastor in 2023.",
      "Josiah and his wife, Chelsey, have been married since 2015 and have three children: Liam, Brayana, and Eliyah. They love being part of the Brainerd family and are grateful to raise their family in the Chattanooga area.",
      "Outside of church, Josiah loves coffee, camping, and spending time with his family. He is also known to overthink just about everything and has a tendency to ask a few (or several) more questions than necessary—especially when it comes to the details. He would probably tell you that the details matter. His family and coworkers might suggest he could occasionally let a few of them go.",
    ],
  },
  "Paul Christensen":  { title: "Students Pastor",        photo: "christensen_paul_studentspastor",      email: "pchristensen@brainerdbaptist.org" },
  "Micah Frink":       { title: "Young Adults Pastor",    photo: "frink_micah_youngadultspastor",        email: "mfrink@brainerdbaptist.org" },
  "Abigail Frink":     { title: "Worship Director",       photo: "frink_abigail_worshipdirector",        email: "afrink@brainerdbaptist.org" },
  "Bryan Skinner":     { title: "Worship Pastor",         photo: "skinner_bryan_worshippastor",          email: "bskinner@brainerdbaptist.org" },
  "Ethan Speicher":    { title: "Member Care Director",   photo: "speicher_ethan_membercaredirector",    email: "espeicher@brainerdbaptist.org" },
  "Barry Wilks":       { title: "Missions Pastor",        photo: "wilks_barry_missionspastor",           email: "bwilks@brainerdbaptist.org" },
  "Carlos Betancourt": { title: "Hispanic Church Pastor", photo: "betancourt_carlos_hispanicpastor",     email: "cbetancourt@brainerdbaptist.org" },
  "Chris Williams":    { title: "Facilities Director",    photo: "williams_chris_facilitiesdirector",    email: "cwilliams@brainerdbaptist.org" },
  "Michelle Hill":     { title: "Stewardship Director",   photo: "hill_michelle_stewardshipdirector",    email: "mhill@brainerdbaptist.org" },
  "Jo Bobbitt":        { title: "BX Director",            photo: "bobbitt_jo_bxdirector",               email: "jbobbitt@brainerdbaptist.org" },
  "Brittany Kelly":    { title: "Kids Director",          photo: "kelly_brittany_kidsdirector",          email: "bkelly@brainerdbaptist.org" },
  "Kristi Smith":      { title: "PDO Director",           photo: "smith_kristi_pdodirector",             email: "ksmith@brainerdbaptist.org" },
  // Guest speakers — no photo
  "Jackson Bowman":    { title: "Guest Speaker" },
}

/** Returns speaker info or a sensible default */
export function getSpeaker(name: string): SpeakerInfo {
  return SPEAKERS[name] ?? { title: "Guest Speaker" }
}

/** Staff ordered for the team directory (pastoral staff first, then directors) */
export const STAFF_ROSTER: string[] = [
  "Curtis Hill",
  "Josiah King",
  "Paul Christensen",
  "Micah Frink",
  "Bryan Skinner",
  "Barry Wilks",
  "Carlos Betancourt",
  "Abigail Frink",
  "Ethan Speicher",
  "Michelle Hill",
  "Brittany Kelly",
  "Jo Bobbitt",
  "Kristi Smith",
  "Chris Williams",
]
