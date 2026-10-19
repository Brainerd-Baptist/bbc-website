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
  /**
   * Name of a server-side environment variable that holds this person's email,
   * for staff whose address must not appear in the repo or the client bundle
   * (it would reveal a name we keep off the public site).
   */
  emailEnv?: string
}

/** Server-side lookup of a staff member's email (direct value or via emailEnv). */
export function staffEmail(info: SpeakerInfo | undefined): string | undefined {
  if (!info) return undefined
  return info.email ?? (info.emailEnv ? process.env[info.emailEnv] : undefined)
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
    title: "Associate Pastor for Operations",
    photo: "king_josiah_operationspastor",
    email: "jking@brainerdbaptist.org",
    familyPhoto: "/carousel/josiah-family.jpg",
    familyPhotoAlt: "Josiah King with his family",
    bio: [
      "Josiah was born and raised in Chattanooga, and he and his family have called Brainerd home since 2010. While exploring God's calling for ministry, the Lord opened the door for him to serve in the Missions Office beginning in 2015. After several years in Missions, he had the opportunity to serve as the interim Kids Pastor before stepping into his current role as Operations Pastor in 2023.",
      "Josiah and his wife, Chelsey, have been married since 2009 and have three children: Liam, Breyana, and Eliyah. They love being part of the Brainerd family and are grateful to raise their family here.",
      "Outside of church, Josiah loves spending time with his family, camping, and coffee—especially finding local coffee roasters wherever he travels, whether across town or across the world. He has also been known to weigh his coffee beans while weighing the decisions of the day. He is often accused of overthinking and asking a few (or several) more questions than necessary, especially when it comes to the details. He would probably tell you that the details matter. His family might tell you that he occasionally has a hard time letting them go.",
    ],
  },
  "Paul Christensen": {
    title: "Associate Pastor for Students",
    photo: "christensen_paul_studentspastor",
    email: "pchristensen@brainerdbaptist.org",
    familyPhoto: "/carousel/paul-family.jpg",
    familyPhotoAlt: "Paul Christensen with his family",
    bio: [
      "Paul was born and raised in Kansas City, Missouri. He attended Union University (Jackson, TN) and then Southeastern Baptist Theological Seminary (Wake Forest, NC) before coming to Brainerd in 2018. Paul was ordained at Brainerd in 2020 before stepping into his role as Associate Pastor to Students in 2021.",
      "Paul is married to Hannah and they have three kids – Ellie, Graham, and Brooks. Hannah works as a nurse and is passionate about caring for kids and students. In their spare time, you can find Paul and Hannah working on a house project, baking cookies (or eating Hannah's cookies), playing outside, cheering on the Kansas City Chiefs, or dreaming about their next trip to Disney World.",
      "Whether he's challenging students to a game of dodgeball or unpacking big life questions over coffee, Paul is passionate about helping students believe the gospel, belong in a safe community, and become lifelong followers of Jesus.",
    ],
  },
  "Micah Frink":       { title: "Associate Pastor for Young Adults",      photo: "frink_micah_youngadultspastor",        email: "mfrink@brainerdbaptist.org" },
  "Abigail Frink":     { title: "Ministry Director for Worship",         photo: "frink_abigail_worshipdirector",        email: "afrink@brainerdbaptist.org" },
  "Bryan Skinner":     { title: "Associate Pastor for Worship", photo: "skinner_bryan_worshippastor",          email: "bskinner@brainerdbaptist.org" },
  "Ethan Speicher":    { title: "Ministry Director for Member Care",     photo: "speicher_ethan_membercaredirector",    email: "espeicher@brainerdbaptist.org" },
  "David":            { title: "Associate Pastor for Missions",         photo: "david_missionspastor",                 emailEnv: "STAFF_EMAIL_DAVID" },
  "Carlos Betancourt": { title: "Assistant Pastor for Hispanic Ministry", photo: "betancourt_carlos_hispanicpastor",     email: "cbetancourt@brainerdbaptist.org" },
  "Chris Williams":    { title: "Ministry Director for Facilities",      photo: "williams_chris_facilitiesdirector",    email: "cwilliams@brainerdbaptist.org" },
  "Michelle Hill":     { title: "Ministry Director for Stewardship",     photo: "hill_michelle_stewardshipdirector",    email: "mhill@brainerdbaptist.org" },
  "Jo Bobbitt":        { title: "Ministry Director for the BX",          photo: "bobbitt_jo_bxdirector",               email: "jbobbitt@brainerdbaptist.org" },
  "Brittany Kelly":    { title: "Ministry Director for Kids",            photo: "kelly_brittany_kidsdirector",          email: "bkelly@brainerdbaptist.org" },
  "Kristi Smith":      { title: "Parent's Day Out Coordinator",          photo: "smith_kristi_pdodirector",             email: "ksmith@brainerdbaptist.org" },
  "Benjamin Hovies": {
    title: "Ministry Director for Adult Discipleship",
    photo: "hovies_benjamin_adultdiscipleship",
    email: "bhovies@brainerdbaptist.org",
    familyPhoto: "/carousel/ben-family.jpg",
    familyPhotoAlt: "Benjamin Hovies with his family in front of the Africa Mercy",
    bio: [
      "Benjamin Hovies serves as the Director of Adult Discipleship at Brainerd Baptist Church. He brings a background in church ministry, military leadership, and international missions, and he gives his life to disciplemaking, biblical community, and mission work.",
      "Benjamin grew up in Thailand as a missionary kid, where he first saw the need for the gospel to be preached to the nations. After eleven years in the Marine Corps, he and his family (Savanna, Asher, Eden, and Harper) served on the mission field in several African nations, including South Africa and Madagascar, with Mercy Ships.",
      "At Brainerd, Benjamin supports adult disciplemaking, especially Life Groups, men's and women's ministries, midweek ministries, and other efforts to engage, equip, and encourage the body of Christ. He is committed to servant leadership, equipping believers to make disciples, and building strong, supportive faith communities here and around the world.",
    ],
  },
  "Erin Owne":         { title: "Ministry Director for Communications",  photo: "owne_erin_communicationsdirector" },
  "Caroline Bell":     { title: "Girls Student Ministry Coordinator" },
  "Abbie Bateman":     { title: "Ministry Coordinator for Kids" },
  "Jackson Bowman":    { title: "Associate Pastor for Member Care",      photo: "bowman_jackson_membercarepastor" },
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
  "David",
  "Carlos Betancourt",
  "Abigail Frink",
  "Jackson Bowman",
  "Michelle Hill",
  "Erin Owne",
  "Brittany Kelly",
  "Jo Bobbitt",
  "Kristi Smith",
  "Chris Williams",
  "Benjamin Hovies",
  "Caroline Bell",
  "Abbie Bateman",
]
