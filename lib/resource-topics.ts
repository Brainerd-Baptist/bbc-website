/**
 * lib/resource-topics.ts
 *
 * The fixed topic list for sermon resources. Shared by the Studio schema
 * (a pick-list, so tags never fragment into "Prayer" / "prayer" / "Praying")
 * and the /resources catalog. Order here is the order chips appear on the
 * page. Resources that already carry an older free-text topic still show it —
 * the catalog unions whatever topics exist in the data with this list.
 */
export const RESOURCE_TOPICS = [
  "Gospel & Salvation",
  "Prayer",
  "Suffering & Hope",
  "Doubt & Faith",
  "Conscience & Ethics",
  "Scripture & Interpretation",
  "Discipleship & Growth",
  "Marriage & Family",
  "Church & Community",
  "Evangelism & Mission",
  "Money & Generosity",
  "Culture & Politics",
  "Worship & Liturgy",
] as const;

/** Canonical Bible order, for sorting the "Book of the Bible" filter. */
export const BIBLE_BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther",
  "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel",
  "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai",
  "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians",
  "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy",
  "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
  "Jude", "Revelation",
] as const;
