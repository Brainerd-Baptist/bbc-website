// Curated destinations for the site search. Search here is a *router*, not an
// answer engine: every result is a real page (or a spot on the campus map)
// chosen by a person, with a plain-language reason it matches. Nothing outside
// this list can ever be returned, so the AI step can't invent a link.
//
// Keep `keywords` in the words visitors actually use ("where do I drop off my
// kids"), not church jargon ("children's ministry"). Run `npm run test:search`
// after editing — it checks every URL resolves to a real route.

export type CatalogKind = "page" | "form" | "map" | "external" | "care";

export interface CatalogEntry {
  id: string;
  title: string;
  /** Internal path (may include #hash or ?query) or full external URL. */
  url: string;
  /** One plain sentence: what you'll find / do there. Shown on the result card. */
  summary: string;
  /** Words and phrases visitors use for this thing. */
  keywords: string[];
  kind: CatalogKind;
  /** Campus-map location id, when a "Show me on the map" link makes sense. */
  mapId?: string;
}

export const CHURCH_PHONE = "(423) 624-2606";
export const CHURCH_PHONE_HREF = "tel:+14236242606";

export const CATALOG: CatalogEntry[] = [
  // ── Visiting ────────────────────────────────────────────────
  {
    id: "plan-visit",
    title: "Plan your visit",
    url: "/visit#plan-your-visit",
    kind: "form",
    summary: "Tell us you're coming (and whether you're bringing kids) and we'll have someone ready to welcome you.",
    keywords: ["first time", "visit", "visiting", "new here", "new to", "coming", "check us out", "try church", "try out", "plan a visit", "let you know", "guest", "visitor", "register kids", "pre-register", "sign my kids up", "register my children", "bringing my kids", "bringing my family", "sunday plans", "what to expect", "come see", "never been", "haven't been to church", "looking for a church", "church home", "new church"],
  },
  {
    id: "visit-info",
    title: "Visit: what Sunday is like",
    url: "/visit",
    kind: "page",
    summary: "Service times, where to park and enter, what to wear, and how a Sunday morning flows.",
    keywords: ["how long", "length of service", "what is it like", "what happens", "sunday morning", "parking", "park", "where to park", "where do i go", "walkthrough", "faq", "questions", "expect", "first sunday"],
  },
  {
    id: "service-times",
    title: "Service times",
    url: "/visit#service-times",
    kind: "page",
    summary: "Sunday services are at 8:30 (Choir & Orchestra) and 11:00 (Band-Led).",
    keywords: ["service times", "service time", "sunday times", "times", "what time", "when is church", "when are services", "sunday service", "8:30", "11:00", "early service", "late service", "worship times", "schedule", "hours", "morning", "time of service", "when does church start", "start time"],
  },
  {
    id: "address",
    title: "Address & directions",
    url: "/visit#sunday-at-a-glance",
    kind: "page",
    summary: "Where we are, where to park, and how to find the right door.",
    keywords: ["address", "where are you", "location", "directions", "how to get there", "gps", "map", "find you", "find the church", "where is the church", "300 brookfield", "driveway", "entrance", "which door", "which entrance", "where to enter", "parking lot", "parking"],
  },
  {
    id: "faq",
    title: "Good to know before you come",
    url: "/visit#faq",
    kind: "page",
    summary: "What to wear, giving, communion, and getting around.",
    keywords: ["faq", "questions", "frequently asked", "what to wear", "dress", "dress code", "attire", "casual", "jeans", "suit", "tie", "do i have to", "will i be asked", "will they make me", "stand up", "introduce myself", "put on the spot", "visitor", "awkward", "nervous", "anxious about visiting", "how long is church", "coffee", "bring my bible", "offering", "communion"],
  },
  {
    id: "map",
    title: "Campus map",
    url: "/map",
    kind: "map",
    summary: "Find any room, door, restroom, or parking lot, with step-by-step directions.",
    keywords: ["map", "campus map", "directions", "find a room", "where is", "cant find", "building", "floor plan", "room number", "which room", "how do i get to", "navigate", "layout", "parking lots"],
  },
  {
    id: "map-sanctuary",
    title: "The Sanctuary (on the map)",
    url: "/map?to=f-sanctuary",
    mapId: "f-sanctuary",
    kind: "map",
    summary: "Where Sunday worship happens, and which door to use.",
    keywords: ["sanctuary", "where is the sanctuary", "worship room", "main room", "where is church", "where is the service", "auditorium", "where do i go for the service", "sanctuary door", "main entrance"],
  },
  {
    id: "map-kids-checkin",
    title: "Kids check-in (on the map)",
    url: "/map?to=f-kids-checkin",
    mapId: "f-kids-checkin",
    kind: "map",
    summary: "Where to check your children in on Sunday morning.",
    keywords: ["kids check in", "check in my kids", "drop off", "drop off my kids", "where do i take my kids", "children check in", "where do i check in", "pick up my kids", "pick up", "nursery drop off", "kids entrance", "where to take my child", "child drop off"],
  },
  {
    id: "map-restrooms",
    title: "Restrooms (on the map)",
    url: "/map",
    mapId: "f-rr-acc-sanct",
    kind: "map",
    summary: "Open the campus map and look for the restroom icons; there are restrooms in the Sanctuary lobby and near the kids area.",
    keywords: ["restroom", "bathroom", "toilet", "restrooms", "bathrooms", "potty", "changing table", "diaper", "family restroom", "where is the bathroom"],
  },
  {
    id: "getting-around",
    title: "Getting around the building",
    url: "/map?to=f-rr-acc-sanct",
    mapId: "f-rr-acc-sanct",
    kind: "map",
    summary: "The campus map shows elevators, lifts, ramps, and accessible restrooms. Call the office if you'd like someone to meet you.",
    keywords: ["accessible", "accessibility", "wheelchair", "handicap", "handicapped", "disabled", "disability", "mobility", "walker", "cane", "elevator", "ramp", "stairs", "lift", "accessible", "wheelchair", "accessible parking", "handicap parking", "hearing", "hearing loop", "deaf", "sign language", "large print", "special needs", "sensory", "cant climb stairs", "can't do stairs", "easy access", "elderly", "senior"],
  },

  // ── Watch / sermons ─────────────────────────────────────────
  {
    id: "live",
    title: "Watch live",
    url: "/live",
    kind: "page",
    summary: "Watch the Sunday service live or catch the latest replay from home.",
    keywords: ["watch live", "live stream", "livestream", "online church", "watch online", "stream", "watch from home", "tv", "youtube", "can't make it", "sick", "homebound", "online service", "virtual", "zoom", "video of service", "watch church", "watch the service"],
  },
  {
    id: "sermons",
    title: "Sermons",
    url: "/sermons",
    kind: "page",
    summary: "Every message, searchable by series, speaker, and Bible book, with notes and recommended resources.",
    keywords: ["sermon", "sermons", "messages", "message", "teaching", "preaching", "watch a sermon", "listen", "audio", "podcast", "past sermons", "series", "last week", "previous", "archive", "pastor's message", "recording", "replay", "notes", "sermon notes", "outline"],
  },
  {
    id: "resources",
    title: "Books & resources from sermons",
    url: "/resources",
    kind: "page",
    summary: "The books, articles, and tools our pastors recommend in their teaching.",
    keywords: ["books", "book", "resources", "reading", "recommended", "reading list", "articles", "recommendations", "study", "bible study resources", "what should i read", "devotional"],
  },
  {
    id: "my-notes",
    title: "My sermon notes",
    url: "/my-notes",
    kind: "page",
    summary: "Your personal sermon notes, saved on this device.",
    keywords: ["my notes", "notes", "my sermon notes", "take notes", "saved notes", "notebook", "journal"],
  },

  // ── Kids / students / young adults ──────────────────────────
  {
    id: "kids",
    title: "Kids ministry",
    url: "/ministries/kids",
    kind: "page",
    summary: "Safe, caring childcare and Bible teaching from nursery through elementary, every Sunday.",
    keywords: ["kids", "children", "child", "childcare", "child care", "nursery", "babies", "baby", "infant", "toddler", "preschool", "elementary", "sunday school", "kids ministry", "my kids", "my son", "my daughter", "little ones", "safe", "safety", "security", "ages", "what ages", "family friendly", "family-friendly", "bring my children", "vbs", "vacation bible school", "kids program", "children's ministry", "children's church"],
  },
  {
    id: "parents-day-out",
    title: "Parents Day Out",
    url: "/ministries/kids#parents-day-out",
    kind: "page",
    summary: "A weekday program for little ones, so parents can have a morning.",
    keywords: ["parents day out", "pdo", "mothers day out", "mdo", "weekday childcare", "daycare", "day care", "babysitting", "preschool program", "weekday program", "stay at home mom", "stay-at-home", "morning off", "drop off toddler", "toddler program"],
  },
  {
    id: "students",
    title: "Students (middle & high school)",
    url: "/ministries/students",
    kind: "page",
    summary: "Middle and high school students: Bible, friends, and a place to belong.",
    keywords: ["students", "student ministry", "youth", "youth group", "teens", "teenagers", "teenager", "middle school", "high school", "junior high", "my teen", "my teenager", "tween", "adolescent", "student pastor", "youth pastor", "grade", "graduate", "senior high"],
  },
  {
    id: "college",
    title: "College & young adults",
    url: "/ministries/college",
    kind: "page",
    summary: "Community and Bible teaching for college students and young adults.",
    keywords: ["college", "young adults", "young adult", "20s", "twenties", "university", "ut", "utc", "uTC", "student", "grad student", "post college", "singles", "single", "just graduated", "20-somethings", "twenty-something", "college age", "campus", "dorm", "college group"],
  },
  {
    id: "hispanic",
    title: "Ministerio Hispano",
    url: "/ministries/hispanic",
    kind: "page",
    summary: "Our Spanish-language congregation at the East Ridge location.",
    keywords: ["spanish", "español", "espanol", "hispanic", "latino", "latina", "latinx", "iglesia", "servicio en español", "habla español", "spanish service", "spanish speaking", "bilingual", "east ridge", "ministerio hispano", "culto", "hola"],
  },

  // ── Connection / next steps ─────────────────────────────────
  {
    id: "life-groups",
    title: "Life Groups",
    url: "/life-groups",
    kind: "page",
    summary: "Small groups that meet Sundays at 9:45. The best way to make real friends here.",
    keywords: ["life group", "life groups", "small group", "small groups", "bible study", "community group", "connect group", "make friends", "meet people", "get to know people", "friends", "community", "sunday school", "adult class", "class", "classes", "join a group", "find a group", "groups", "fellowship", "lonely", "alone", "new in town", "moved here", "9:45", "married couples", "couples", "newlyweds", "men's", "women's", "seniors group"],
  },
  {
    id: "next-step",
    title: "Take a next step",
    url: "/connect/next-step",
    kind: "form",
    summary: "Tell us what you're ready for (a group, serving, baptism, membership) and a real person will follow up.",
    keywords: ["next step", "get involved", "get plugged in", "plug in", "plugged in", "ready to join", "how do i join", "how do i get involved", "involved", "connect", "stay connected", "i want to", "sign up", "interested in", "get started", "follow up", "someone to contact me", "have someone call me", "contact me"],
  },
  {
    id: "serve",
    title: "Serve",
    url: "/connect/next-step?interest=serving",
    kind: "form",
    summary: "Find a place to use your gifts: kids, welcome team, music, tech, and more.",
    keywords: ["serve", "serving", "volunteer", "volunteering", "help out", "help with", "use my gifts", "gifts", "talents", "usher", "greeter", "welcome team", "parking team", "tech team", "sound", "camera", "choir", "orchestra", "band", "sing", "play", "instrument", "musician", "teach", "teaching kids", "give back", "how can i help", "get involved", "ministry team", "mission trip"],
  },
  {
    id: "baptism",
    title: "Baptism",
    url: "/connect/next-step?interest=baptism",
    kind: "form",
    summary: "Ready to be baptized, or have questions about it? Let us know and a pastor will walk you through it.",
    keywords: ["baptism", "baptized", "baptised", "baptize", "get baptized", "be baptized", "baptism class", "dunk", "immerse", "immersion", "water", "baby baptism", "baptize my child", "baptize my baby", "rebaptism", "rebaptize", "i was baptized as a baby", "dedication", "baby dedication", "dedicate my baby", "child dedication"],
  },
  {
    id: "membership",
    title: "Membership",
    url: "/membership",
    kind: "page",
    summary: "What it means to join Brainerd and how to take the first step.",
    keywords: ["membership", "member", "join", "join the church", "become a member", "joining", "how to join", "transfer", "transfer my membership", "letter", "new member", "new members class", "membership class", "covenant", "belong", "officially join", "church member"],
  },
  {
    id: "stay-connected",
    title: "Stay connected",
    url: "/connect/stay-connected",
    kind: "form",
    summary: "Get updates and keep in touch, with no pressure.",
    keywords: ["stay connected", "newsletter", "email list", "mailing list", "updates", "text updates", "subscribe", "sign up for emails", "keep in touch", "keep me posted", "text messages", "announcements", "church app", "app", "news"],
  },
  {
    id: "events",
    title: "Events & calendar",
    url: "https://brainerdbaptist.churchcenter.com/calendar",
    kind: "external",
    summary: "What's coming up at Brainerd, with dates, times, and sign-ups.",
    keywords: ["events", "event", "calendar", "what's happening", "whats happening", "upcoming", "this week", "this weekend", "this month", "schedule", "register for an event", "event signup", "special event", "christmas", "easter", "christmas eve", "good friday", "holiday", "fall festival", "trunk or treat", "halloween", "thanksgiving", "retreat", "conference", "dates"],
  },
  {
    id: "wednesday",
    title: "Wednesday nights",
    url: "/wednesday",
    kind: "page",
    summary: "Wednesday evenings for kids, students, adults, college, and Choir & Orchestra. Find where you fit.",
    keywords: ["wednesday", "wednesday night", "midweek", "mid week", "wednesday dinner", "wednesday supper", "wednesday meal", "church dinner", "dinner", "supper", "family night", "prayer meeting", "mid-week"],
  },
  {
    id: "missions",
    title: "Missions",
    url: "/missions",
    kind: "page",
    summary: "How we serve our city and the world, and how to get involved.",
    keywords: ["missions", "mission", "missionary", "missionaries", "mission trip", "overseas", "international", "global", "outreach", "evangelism", "share my faith", "local missions", "serve the city", "service project", "mission team", "go on a trip", "short term", "short-term", "unreached"],
  },
  {
    id: "community",
    title: "Brainerd Baptist in the community",
    url: "/community",
    kind: "page",
    summary: "How our church shows up in our neighborhood and partners with others.",
    keywords: ["community", "neighborhood", "partners", "partnerships", "local", "nonprofit", "non-profit", "outreach", "chattanooga", "brainerd", "school", "brainerd baptist school", "bbs", "city", "serve our city", "food pantry", "food bank", "need help with food", "clothing", "community service"],
  },
  {
    id: "bx",
    title: "The BX community center",
    url: "/bx",
    kind: "page",
    summary: "Brainerd Crossroads Community Center: what it is and how to use it.",
    keywords: ["bx", "the bx", "crossroads", "brainerd crossroads", "community center", "cafe", "crossties", "crossties cafe", "coffee shop", "event space", "rent", "rent a room", "reserve", "reservation", "reserve a room", "book a room", "book space", "wedding venue", "party", "meeting space", "meeting room", "rental", "host an event", "birthday party", "gym", "gymnasium", "basketball", "pickleball", "fitness"],
  },
  {
    id: "bx-reserve",
    title: "Reserve space at the BX",
    url: "/bx/reserve",
    kind: "form",
    summary: "Request a room or space for your event.",
    keywords: ["reserve", "reserve a room", "book a room", "rent", "rent a room", "rent the gym", "rent space", "room rental", "reservation", "host", "host my event", "event space", "birthday party", "meeting room", "use the building", "use the gym", "use the fellowship hall", "wedding reception", "reception", "baby shower", "bridal shower", "funeral reception", "facility", "facilities"],
  },

  // ── About / beliefs ─────────────────────────────────────────
  {
    id: "beliefs",
    title: "What we believe",
    url: "/beliefs",
    kind: "page",
    summary: "Our core beliefs, with plain-language answers to common questions.",
    keywords: ["beliefs", "believe", "what do you believe", "doctrine", "theology", "baptist", "southern baptist", "sbc", "denomination", "statement of faith", "bible", "scripture", "trinity", "salvation", "heaven", "hell", "creed", "bf&m", "baptist faith and message", "women pastors", "women in ministry", "communion", "lord's supper", "what is communion", "who can take communion", "translation", "csb", "which bible", "what bible", "what translation"],
  },
  {
    id: "who-is-jesus",
    title: "Who is Jesus?",
    url: "/who-is-jesus",
    kind: "page",
    summary: "A no-pressure place to explore who Jesus is, whether you're curious, skeptical, or just starting.",
    keywords: ["who is jesus", "jesus", "christian", "christianity", "gospel", "good news", "salvation", "saved", "how to be saved", "become a christian", "follow jesus", "faith", "skeptic", "skeptical", "doubt", "doubts", "not sure what i believe", "just curious", "curious about god", "explore faith", "seeker", "atheist", "agnostic", "is god real", "does god exist", "meaning", "purpose", "why am i here", "forgiveness", "forgiven", "sin", "eternal life", "heaven"],
  },
  {
    id: "about",
    title: "About Brainerd Baptist",
    url: "/about",
    kind: "page",
    summary: "Who we are, our story, and what we care about.",
    keywords: ["about", "about us", "who are you", "who we are", "history", "story", "mission", "vision", "values", "founded", "heritage", "our church", "tell me about", "what is brainerd", "what is bbc", "pastor", "pastors", "leadership", "elders", "deacons"],
  },
  {
    id: "timeline",
    title: "A hundred years of Brainerd",
    url: "/about/timeline",
    kind: "page",
    summary: "The story of our church, decade by decade.",
    keywords: ["history", "100 years", "hundred years", "centennial", "anniversary", "timeline", "founded", "founding", "when was the church founded", "how old", "old church", "heritage", "past", "decade", "1920s", "1925"],
  },
  {
    id: "staff",
    title: "Our team",
    url: "/staff",
    kind: "page",
    summary: "The pastors and staff, with what each one does.",
    keywords: ["staff", "team", "pastor", "pastors", "who is the pastor", "senior pastor", "lead pastor", "worship pastor", "student pastor", "youth pastor", "kids pastor", "children's pastor", "executive pastor", "who works here", "who do i talk to", "names", "our pastors", "meet the pastor", "meet the team", "leadership", "who runs"],
  },
  {
    id: "contact-staff",
    title: "Contact a staff member",
    url: "/connect/staff",
    kind: "form",
    summary: "Send a message directly to a pastor or staff member.",
    keywords: ["contact", "contact staff", "email a pastor", "talk to a pastor", "talk to someone", "speak to someone", "speak with a pastor", "reach", "message a pastor", "email", "email the church", "get in touch", "a person", "real person", "human", "someone to talk to", "call", "phone", "phone number", "church phone", "pastor's email", "staff email", "staff directory", "office", "church office", "office hours"],
  },
  {
    id: "contact-general",
    title: "Send us a message",
    url: "/connect/general",
    kind: "form",
    summary: "Ask a question or share feedback. It goes to the church office and someone will reply.",
    keywords: ["question", "ask a question", "message", "send a message", "feedback", "suggestion", "comment", "complaint", "concern", "general", "other", "i have a question", "ask", "wondering", "inquiry", "enquiry", "not sure who to ask", "don't know who to ask", "something else", "tell you", "let you know", "lost and found", "lost item", "lost", "misplaced", "left behind", "left my", "forgot my", "found a", "jacket", "wallet", "keys", "umbrella"],
  },
  {
    id: "connect",
    title: "Connect with us",
    url: "/connect",
    kind: "page",
    summary: "All the ways to reach us in one place.",
    keywords: ["connect", "contact us", "reach us", "all ways to contact", "connect with us", "get connected", "contact page", "contact"],
  },
  {
    id: "give",
    title: "Give",
    url: "/give",
    kind: "page",
    summary: "Give to support ministry here in Chattanooga and around the world.",
    keywords: ["give", "giving", "donate", "donation", "tithe", "tithing", "offering", "online giving", "give online", "text to give", "tax", "tax receipt", "giving statement", "year end statement", "recurring", "recurring gift", "automatic gift", "stock", "stock gift", "donor advised", "daf", "planned giving", "will", "legacy", "memorial gift", "in memory", "in honor", "building fund", "mission offering", "lottie moon", "check", "cash", "where does my money go", "how do i give", "support the church", "financially support", "pledge", "capital campaign"],
  },
  {
    id: "site-accessibility",
    title: "Website accessibility",
    url: "/accessibility",
    kind: "page",
    summary: "How we make this website usable for everyone, and how to tell us when something gets in your way.",
    keywords: ["website accessibility", "screen reader", "site problem", "accessibility statement", "report a problem", "website issue", "broken link", "site feedback", "web accessibility", "ada"],
  },

  // ── Care (sensitive; see CARE_ENTRY handling in search-match) ─
  {
    id: "care",
    title: "Care & prayer",
    url: "/connect/care",
    kind: "care",
    summary: "Prayer, hospital visits, grief, hardship, family crisis. This goes straight to our care team, privately.",
    keywords: ["prayer", "pray", "pray for me", "prayer request", "need prayer", "prayers", "hospital", "hospital visit", "surgery", "sick", "illness", "cancer", "diagnosis", "dying", "death", "died", "passed away", "funeral", "memorial service", "grief", "grieving", "mourning", "loss", "bereavement", "widow", "widowed", "divorce", "separated", "marriage trouble", "marriage problems", "affair", "abuse", "abused", "domestic violence", "unsafe", "addiction", "addicted", "recovery", "struggling", "depressed", "depression", "anxiety", "anxious", "lonely", "overwhelmed", "hopeless", "crisis", "emergency", "financial help", "need help paying", "rent help", "can't pay", "cant pay", "utilities", "eviction", "evicted", "need food", "hungry", "benevolence", "assistance", "help me", "counseling", "counselor", "therapy", "therapist", "pastoral care", "visit me", "home visit", "homebound", "shut-in", "shut in", "wedding", "get married", "premarital", "engaged", "marry us", "officiate"],
  },
];

/** Entries returned for pastoral / crisis wording. Never AI-answered. */
export const CARE_ID = "care";
export const CONTACT_GENERAL_ID = "contact-general";
export const CONTACT_STAFF_ID = "contact-staff";

export const CATALOG_BY_ID: Record<string, CatalogEntry> = Object.fromEntries(
  CATALOG.map((e) => [e.id, e]),
);
