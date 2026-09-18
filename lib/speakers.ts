export interface SpeakerInfo {
  title: string
  /** Optional short bio — fill in Sanity or here when ready */
  bio?: string
}

export const SPEAKERS: Record<string, SpeakerInfo> = {
  "Curtis Hill":      { title: "Lead Pastor" },
  "Micah Frink":      { title: "Worship Pastor" },
  "Josiah King":      { title: "Operations Pastor" },
  "Paul Christensen": { title: "Guest Speaker" },
  "Jackson Bowman":   { title: "Guest Speaker" },
}

/** Returns speaker info or a sensible default */
export function getSpeaker(name: string): SpeakerInfo {
  return SPEAKERS[name] ?? { title: "Guest Speaker" }
}
