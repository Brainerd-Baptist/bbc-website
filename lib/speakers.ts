export interface SpeakerInfo {
  title: string
  /** Slug matching /public/staff/<slug>.jpg — set when photo is available */
  photo?: string
  /** Optional short bio */
  bio?: string
}

export const SPEAKERS: Record<string, SpeakerInfo> = {
  "Curtis Hill":       { title: "Lead Pastor",            photo: "hill_curtis_leadpastor" },
  "Josiah King":       { title: "Operations Pastor",      photo: "king_josiah_operationspastor" },
  "Paul Christensen":  { title: "Students Pastor",        photo: "christensen_paul_studentspastor" },
  "Micah Frink":       { title: "Young Adults Pastor",    photo: "frink_micah_youngadultspastor" },
  "Abigail Frink":     { title: "Worship Director",       photo: "frink_abigail_worshipdirector" },
  "Bryan Skinner":     { title: "Worship Pastor",         photo: "skinner_bryan_worshippastor" },
  "Ethan Speicher":    { title: "Member Care Director",   photo: "speicher_ethan_membercaredirector" },
  "Barry Wilks":       { title: "Missions Pastor",        photo: "wilks_barry_missionspastor" },
  "Carlos Betancourt": { title: "Hispanic Church Pastor", photo: "betancourt_carlos_hispanicpastor" },
  "Chris Williams":    { title: "Facilities Director",    photo: "williams_chris_facilitiesdirector" },
  "Michelle Hill":     { title: "Stewardship Director",   photo: "hill_michelle_stewardshipdirector" },
  "Jo Bobbitt":        { title: "BX Director",            photo: "bobbitt_jo_bxdirector" },
  "Brittany Kelly":    { title: "Kids Director",          photo: "kelly_brittany_kidsdirector" },
  "Kristi Smith":      { title: "PDO Director",           photo: "smith_kristi_pdodirector" },
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
