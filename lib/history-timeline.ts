// Source: "Brainerd Pillars Timeline" draft (100 Year Anniversary project). Every entry cites the
// church anniversary history it came from; nothing here is invented. Where two histories
// disagree, the entry says so. Gaps after 2013 are labeled on the page.

export type PillarKey = "begin" | "build" | "plant" | "mission" | "together";

export interface TimelineEvent {
  year: number;
  date: string;
  pillar: PillarKey;
  figure?: string;
  figureLabel?: string;
  title: string;
  summary: string;
  more: string[];
  source: string;
}

export interface TimelineMark {
  year: number;
  label: string;
  future?: boolean;
}

export interface StoryParagraph {
  /** Exact title of the timeline event this paragraph follows, "#gap"/"#mark2028" for special rows, or null. */
  ref: string | null;
  text: string;
}

export interface StoryChapter {
  title: string;
  years: string;
  paragraphs: StoryParagraph[];
}

export const PILLARS: Record<PillarKey, { label: string }> = {
  "begin": {
    "label": "Beginnings"
  },
  "build": {
    "label": "Buildings"
  },
  "plant": {
    "label": "Church plants & congregations"
  },
  "mission": {
    "label": "Missionaries & missions"
  },
  "together": {
    "label": "Done together"
  }
};

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    "year": 1928,
    "date": "Nov 4, 1928",
    "pillar": "begin",
    "figure": "68",
    "figureLabel": "people joined on the first day",
    "title": "A church is born in a tent",
    "summary": "After a two-week revival, Brainerd Baptist Church was organized in a City Mission Board tent at Brookfield and Albemarle Avenues. Sixty-eight people joined that day.",
    "more": [
      "The lots had been bought in July 1927 for $2,000 with funds from Avondale Baptist Church. Sunday School was organized a week later with 75 present, and the charter roll closed on Feb 3, 1929 at just over 100.",
      "That winter, sparks from the heating stoves burned holes in the tent roof. On rainy Sundays members sat under umbrellas. Willard Scruggs was the first person baptized into the new church."
    ],
    "source": "70th Anniversary history (1998); 80th Anniversary history (2008)"
  },
  {
    "year": 1929,
    "date": "Apr 7, 1929",
    "pillar": "build",
    "title": "Out of the tent, into the first building",
    "summary": "Ground was broken on Nov 17, 1928. Five months later the congregation moved into its first building, the basement level of a planned church.",
    "more": [
      "Seven people were baptized at the first baptismal service in the new building on Apr 28, 1929. In 1998 the historian noted this space was the youth \"Underground\" area. The building debt was paid off in May 1937."
    ],
    "source": "70th Anniversary history (1998); 80th Anniversary history (2008)"
  },
  {
    "year": 1941,
    "date": "Apr 13, 1941 · Easter",
    "pillar": "build",
    "title": "The first sanctuary",
    "summary": "Easter services were held for the first time in the new auditorium. That building later became the church gymnasium.",
    "more": [
      "Construction began around August 1940. In February 1941 the church bought property at Brookfield and Mayfair Avenues as a pastorium, the ground where today's sanctuary stands. The auditorium was formally dedicated on June 28, 1942."
    ],
    "source": "70th Anniversary history (1998)"
  },
  {
    "year": 1950,
    "date": "1950",
    "pillar": "mission",
    "title": "A commitment to give half to missions",
    "summary": "The church adopted a plan to raise its missions giving by 5% each year until it reached an even split between its own work and missions.",
    "more": [
      "Missions received 25% of regular receipts in 1951, 30% in 1952 and 35% in 1953. The 1953 budget set 40%, most of it through the Cooperative Program."
    ],
    "source": "25th Anniversary history (1953)"
  },
  {
    "year": 1953,
    "date": "Nov 1953 – Sept 1956",
    "pillar": "build",
    "title": "Two educational buildings",
    "summary": "Brainerd marked its 25th anniversary by breaking ground for a new educational building. A second one followed and opened in September 1956.",
    "more": [
      "The first educational building was ready by September 1954, when the kindergarten opened in it. Construction on the second began in July 1955. In 1963 the 35th anniversary was celebrated by retiring the debt on that second building."
    ],
    "source": "70th Anniversary history (1998); 80th Anniversary history (2008)"
  },
  {
    "year": 1954,
    "date": "Mar 1, 1954",
    "pillar": "plant",
    "title": "Trinity Chapel becomes South Seminole Baptist Church",
    "summary": "The church's Brotherhood started a mission in the South Seminole area. On Sept 25, 1955 it was constituted as South Seminole Baptist Church.",
    "more": [
      "Forty-five people attended Sunday School on the first day, and 22 came to Training Union."
    ],
    "source": "70th Anniversary history (1998); 80th Anniversary history (2008)"
  },
  {
    "year": 1954,
    "date": "Sept 1954",
    "pillar": "begin",
    "title": "The kindergarten opens",
    "summary": "Brainerd Baptist kindergarten opened in the new educational building with 50 children and a staff of four.",
    "more": [
      "Mrs. Willard (Fonza) Miller was the first director."
    ],
    "source": "70th Anniversary history (1998)"
  },
  {
    "year": 1956,
    "date": "Aug 26, 1956",
    "pillar": "begin",
    "title": "Worship goes on television",
    "summary": "The first televised Brainerd Baptist worship service was broadcast from the WRCB Channel 3 studio. It began one of the church's longest-running ministries.",
    "more": [
      "Radio followed on WDOD on Jan 29, 1959. Members gave $15,087.50 to the TV fund by January 1967 toward the $25,000–$30,000 needed for two cameras. Services were first telecast from the sanctuary in fall 1968, on one-week tape delay because a live signal could not yet cross Missionary Ridge. In October 1974 the church replaced its black-and-white gear with $108,450 of color equipment. Services were broadcast in color from Oct 6, 1974, and the church voted on July 15, 1981 to telecast Sunday morning worship live."
    ],
    "source": "70th Anniversary history (1998)"
  },
  {
    "year": 1958,
    "date": "Jan 12, 1958",
    "pillar": "plant",
    "title": "Frawley Road Mission",
    "summary": "The Brotherhood started a second mission on Frawley Road. In 1959 it became Frawley Road Baptist Church.",
    "more": [
      "The archive holds a 1960 Missions Committee recommendation about Frawley Road, worth pulling for this story."
    ],
    "source": "70th Anniversary history (1998); 80th Anniversary history (2008)"
  },
  {
    "year": 1965,
    "date": "July 15, 1965",
    "pillar": "mission",
    "title": "Sent to Libya",
    "summary": "Rev. Harold Blankenship and his wife Dot were appointed by the Foreign Mission Board as missionary associates to Tripoli, Libya.",
    "more": [
      "Blankenship came to Brainerd as youth director in 1957, later served as assistant pastor, and stayed until 1963."
    ],
    "source": "80th Anniversary history (2008)"
  },
  {
    "year": 1966,
    "date": "Jan 23, 1966",
    "pillar": "build",
    "figure": "1,250",
    "figureLabel": "seats, filled to overflow at the first service",
    "title": "The new sanctuary is dedicated",
    "summary": "Dr. Robert G. Lee preached his famous sermon \"Payday, Someday\" at the dedication of the new sanctuary at Brookfield and Mayfair.",
    "more": [
      "Ground was broken on July 26, 1964, and the last service in the first sanctuary was held on Jan 9, 1966. Members could give toward individual furnishings through the 1964 Memorial Fact Book. The pulpit, for example, was listed at $791.",
      "The 59-rank Austin pipe organ was dedicated on May 3, 1966, with organist Frederick Swann playing the recital. In 1973 organist Evelyn Gibbs premiered her oratorio based on the dedication sermon."
    ],
    "source": "70th Anniversary history (1998); Memorial Fact Book (1964)"
  },
  {
    "year": 1968,
    "date": "1968",
    "pillar": "mission",
    "title": "Crusades in Indonesia and India",
    "summary": "The church sent Rev. J. Ralph McIntyre and Clifton Ward to an evangelistic crusade in Indonesia. The same year it sponsored McIntyre, Reece Donaldson and Steve Wall for the month-long Total India Crusade.",
    "more": [
      "After the Indonesia trip, the church and individual donors gave over $2,000 toward land and buildings for a ministry to betja (pedicab) drivers in Jakarta. The church gave over $3,000 for the India crusade. The archive also has a separate India Crusade document worth pulling for photos or details."
    ],
    "source": "50th Anniversary history (1978); 80th Anniversary history (2008)"
  },
  {
    "year": 1972,
    "date": "Sept 1972",
    "pillar": "begin",
    "figure": "50",
    "figureLabel": "students on opening day",
    "title": "Brainerd Baptist School opens",
    "summary": "The school opened with 50 students in grades 1 through 6. Mrs. Lanier (Cholly) Cain served as principal.",
    "more": [
      "It added a grade each year and offered grade 12 by 1985. It earned accreditation from the Southern Association of Colleges and Schools in December 1988. In 1990 the school board voted to discontinue grades 9 through 12."
    ],
    "source": "70th Anniversary history (1998)"
  },
  {
    "year": 1973,
    "date": "July 1973",
    "pillar": "mission",
    "title": "The first God's Minority team",
    "summary": "The first \"God's Minority\" missions team went to Tolland, Connecticut to work with the Home Mission Board in pioneer areas.",
    "more": [
      "Later teams went to West Virginia and Indiana, Pennsylvania."
    ],
    "source": "70th Anniversary history (1998); 80th Anniversary history (2008)"
  },
  {
    "year": 1977,
    "date": "Oct 1977",
    "pillar": "build",
    "figure": "246",
    "figureLabel": "bells",
    "title": "The carillon rings",
    "summary": "A 246-bell Maas-Rowe carillon was installed ahead of the church's 50th anniversary.",
    "more": [],
    "source": "70th Anniversary history (1998); 80th Anniversary history (2008)"
  },
  {
    "year": 1978,
    "date": "Jan & June 1978",
    "pillar": "mission",
    "title": "Sending out, and taking in",
    "summary": "Minister of Music Harry Hampsher and his wife Martha left to become music missionaries to Portugal. That June, the old pastorium on Mayfair became a Mission House for missionaries home on furlough.",
    "more": [
      "The Women's Missionary Union refurbished and maintained the house at 4014 Mayfair. The first family to live there was Rev. and Mrs. David Coleman, who were serving in Africa."
    ],
    "source": "70th Anniversary history (1998); 80th Anniversary history (2008)"
  },
  {
    "year": 1980,
    "date": "Dec 14, 1980",
    "pillar": "build",
    "title": "Educational building and chapel",
    "summary": "New educational space and the chapel were dedicated, the result of the \"Together We Build\" program adopted in July 1979.",
    "more": [
      "The two histories give different groundbreaking dates: Oct 14, 1979 (1998 history) and Oct 7, 1979 (2008 history). A third floor and an elevator were finished in September 1989. The chapel's first stained-glass window, in memory of Associate Pastor Doug Miller, was installed in October 1993."
    ],
    "source": "70th Anniversary history (1998); 80th Anniversary history (2008)"
  },
  {
    "year": 1990,
    "date": "July 18, 1990",
    "pillar": "plant",
    "title": "A Brazilian fellowship",
    "summary": "Brainerd voted to sponsor a Portuguese-speaking congregation meeting in its building, with John Carvalho as mission pastor.",
    "more": [
      "In early 1992 the fellowship returned to the Hamilton County Baptist Association."
    ],
    "source": "70th Anniversary history (1998)"
  },
  {
    "year": 1992,
    "date": "Sept 23, 1992",
    "pillar": "plant",
    "title": "The Cambodian congregation",
    "summary": "Brainerd invited the Cambodian Mission to become part of the church, with Rev. Sam Chhum as mission pastor.",
    "more": [
      "By 2013 the Cambodian service was one of seven Brainerd worship services."
    ],
    "source": "70th Anniversary history (1998); 85th Anniversary history (2013)"
  },
  {
    "year": 1999,
    "date": "Sept 1999",
    "pillar": "mission",
    "title": "Disaster Relief and World Changers",
    "summary": "A Disaster Relief group was organized, and Brainerd began hosting World Changers, the SBC program that sends young people to serve communities in need. Bob Rann directed both.",
    "more": [],
    "source": "85th Anniversary history (2013)"
  },
  {
    "year": 2003,
    "date": "Feb 2003",
    "pillar": "plant",
    "title": "The Hispanic ministry",
    "summary": "A Hispanic ministry began under Rev. Carlos Betancourt.",
    "more": [
      "By January 2005 it had 150 in attendance."
    ],
    "source": "85th Anniversary history (2013)"
  },
  {
    "year": 2004,
    "date": "2003 – 2004",
    "pillar": "mission",
    "title": "Teams go out across the world",
    "summary": "Short-term teams went to Kenya, Ukraine, Ecuador, Venezuela, Cambodia and to the Wind River Reservation in Wyoming. Brainerd also hosted World Missions Conferences in 2003 and 2004.",
    "more": [
      "The Ecuador team reported 99 decisions in May 2004, and the Venezuela team reported 147 that summer."
    ],
    "source": "85th Anniversary history (2013)"
  },
  {
    "year": 2005,
    "date": "May 12, 2005",
    "pillar": "mission",
    "title": "The Wilks family to Uganda",
    "summary": "The church commissioned staff member Barry Wilks and his family as missionaries to Uganda.",
    "more": [
      "A Brainerd team went to serve alongside Barry and Scarlet Wilks in February 2007. The family returned to Brainerd that year."
    ],
    "source": "80th Anniversary history (2008); 85th Anniversary history (2013)"
  },
  {
    "year": 2006,
    "date": "June 4, 2006",
    "pillar": "build",
    "title": "Brainerd Crossroads (BX)",
    "summary": "The grand opening of Brainerd Crossroads, the church's expansion across Mayfair Avenue.",
    "more": [
      "The plans were approved on May 4, 2003, and ground was broken on Sept 5, 2004. BX later hosted Christian sports camps."
    ],
    "source": "85th Anniversary history (2013)"
  },
  {
    "year": 2008,
    "date": "Sept 28, 2008",
    "pillar": "mission",
    "title": "The Ranns to Mexico",
    "summary": "Travis and Danielle Rann were called to serve as missionaries to Mexico.",
    "more": [],
    "source": "85th Anniversary history (2013)"
  },
  {
    "year": 2012,
    "date": "2008 – 2013",
    "pillar": "mission",
    "title": "IMB missionaries and 30+ countries",
    "summary": "Amber and Nathan Frick were commissioned as IMB missionaries, and at least six other members applied to the IMB. Mission trips reached more than 30 countries.",
    "more": [
      "The exact year of the Fricks' commissioning isn't given in the 2013 history and should be confirmed."
    ],
    "source": "85th Anniversary history (2013)"
  },
  {
    "year": 1929,
    "date": "Apr 7, 1929",
    "pillar": "together",
    "figure": "$2,075",
    "figureLabel": "given and pledged on moving-in day",
    "title": "The first big offering",
    "summary": "On the day members moved out of the tent and into the first building, they gave $105.60 in the morning offering and $860.40 in the afternoon, and pledged $1,109 more.",
    "more": [
      "The Ocoee Association had borrowed $5,000 from Chattanooga Savings Bank to finish the building up to the first floor so it could be used for worship."
    ],
    "source": "50th Anniversary history (1978)"
  },
  {
    "year": 1937,
    "date": "May 1937",
    "pillar": "together",
    "figure": "$0",
    "figureLabel": "owed, for the first time",
    "title": "Free of debt",
    "summary": "Eight years after the founding, the church paid off its building debt.",
    "more": [
      "A $5,000 note held by the mortgage pool of the old First National Bank was paid at a discount. The one debt left was $3,852 owed to the City Mission Board, which was paid off in the 1940s."
    ],
    "source": "25th Anniversary history (1953); 70th Anniversary history (1998)"
  },
  {
    "year": 1940,
    "date": "1940 – 1941",
    "pillar": "together",
    "figure": "85,000",
    "figureLabel": "bricks cleaned by hand, at night",
    "title": "Bricks from the city dump",
    "summary": "The church had $17,000 saved but couldn't borrow enough to finish its auditorium, so members decided to build it themselves. When Market Street downtown was torn up and its old bricks hauled to the city dump, members went and got them.",
    "more": [
      "Mrs. W. L. Million lent the flatbed truck that had belonged to her husband. Willard Scruggs, the first person ever baptized into Brainerd, was one of the drivers. The pastor and members cleaned 85,000 of the large, heavy bricks at night, and the bricks went into the building's interior walls.",
      "Neighbors from other denominations saw the members doing the work themselves and gave toward the building without being asked. The memorial art-glass windows cost $75 each, and the finished building and furnishings came to about $45,000.",
      "Gwen Stringer remembered it in 2013: as a child she played in the construction sand while her mother and father washed bricks for the new building."
    ],
    "source": "50th Anniversary history (1978); 80th Anniversary history (2008); 85th Anniversary history (2013) (testimony)"
  },
  {
    "year": 1943,
    "date": "June 27, 1943",
    "pillar": "together",
    "figure": "$40,000",
    "figureLabel": "auditorium paid for within two years",
    "title": "Paid in full, in wartime",
    "summary": "Two years after the auditorium opened, Pastor Collins wrote that the building and its equipment were paid for, along with the pastor's home and 15 Sunday School rooms.",
    "more": [
      "The church also held ten $1,000 war bonds and gave 15% of undesignated gifts to the Cooperative Program. Missions giving grew from $180 in 1936 to over $4,000 in 1945, while the church was still paying for buildings.",
      "Classes and members did much of the work on the 15 new Sunday School rooms themselves."
    ],
    "source": "50th Anniversary history (1978); 80th Anniversary history (2008)"
  },
  {
    "year": 1944,
    "date": "1944 – 1947",
    "pillar": "together",
    "figure": "$40,670",
    "figureLabel": "saved during the war for the next building",
    "title": "Saving through the war",
    "summary": "With building materials unavailable during World War II, the church bought war bonds and put money in savings for the day it could build again. By 1947 it had $40,670 toward a $79,000 educational unit.",
    "more": [
      "During the war, 86 members served in the military. Pastor Collins called them \"Military Missionaries,\" and banners with their names hung in the sanctuary. One, John L. Brown, was killed in action.",
      "A pipe organ fund was started on June 1, 1942 with a $3 gift, and it grew as a memorial to those who served."
    ],
    "source": "50th Anniversary history (1978); 80th Anniversary history (2008)"
  },
  {
    "year": 1958,
    "date": "1950 – 1958",
    "pillar": "together",
    "figure": "$562,500",
    "figureLabel": "in new buildings and facilities in eight years",
    "title": "Eight years of building",
    "summary": "In the 1950s the congregation added a pastor's home, the sanctuary balcony, a nursery building, an educational building and a camp cabin, and air-conditioned and redecorated the older buildings.",
    "more": [
      "The 1978 history itemizes it: educational building $325,000, nursery building $85,000, balcony $40,000, pastor's home $30,000, older buildings updated $60,000, parking $10,000, a lot for future use $7,500, and a cabin at Camp Hacoba $5,000."
    ],
    "source": "50th Anniversary history (1978)"
  },
  {
    "year": 1963,
    "date": "Nov 3, 1963",
    "pillar": "together",
    "title": "The mortgage is burned",
    "summary": "On Founders Day, the 35th anniversary, special offerings paid off the debt on the educational building and the mortgage was burned. The same day, the first plans for a new sanctuary were shown.",
    "more": [
      "Mrs. Sprague, the founding pastor's widow, and the charter members were honored that day."
    ],
    "source": "50th Anniversary history (1978); 70th Anniversary history (1998)"
  },
  {
    "year": 1965,
    "date": "1964 – 1966",
    "pillar": "together",
    "figure": "$4,000",
    "figureLabel": "for an 1867 Waterford chandelier",
    "title": "A sanctuary furnished gift by gift",
    "summary": "Most of the new sanctuary's furnishings were given by members in memory or honor of someone they loved. The 1964 Memorial Fact Book listed each item and its price so families could choose one.",
    "more": [
      "The main chandelier, imported Irish Waterford crystal, first cost $25,000 in a Saratoga, New York hotel in 1867. It was bought and given to the church for $4,000.",
      "On \"Hymnal Sunday,\" July 18, 1965, members shared in buying new hymnals for the sanctuary. The removable pulpit was listed at $791."
    ],
    "source": "50th Anniversary history (1978); Memorial Fact Book (1964)"
  },
  {
    "year": 1967,
    "date": "Apr 1967 – Feb 1968",
    "pillar": "together",
    "figure": "700",
    "figureLabel": "books of S&H Green Stamps",
    "title": "Handbells bought with Green Stamps",
    "summary": "A drive asked members for 700 books of S&H Green Stamps to buy a 37-bell set of Schulmerich handbells. Enough books came in, and the bells arrived on Feb 28, 1968.",
    "more": [],
    "source": "50th Anniversary history (1978); 70th Anniversary history (1998)"
  },
  {
    "year": 1977,
    "date": "July 1977",
    "pillar": "together",
    "title": "A farewell gift: the sanctuary debt",
    "summary": "When Dr. J. Ralph McIntyre left after 18 years as pastor, the congregation's farewell gift was a pledge to pay off the sanctuary debt.",
    "more": [],
    "source": "50th Anniversary history (1978)"
  },
  {
    "year": 2004,
    "date": "2004",
    "pillar": "together",
    "figure": "$1,000",
    "figureLabel": "per well",
    "title": "Students dig wells in Kenya",
    "summary": "Barry Wilks challenged Brainerd Baptist School students to raise money to dig wells in Homa Bay, Kenya, at $1,000 a well. Brainerd men went to Homa Bay to work that year.",
    "more": [],
    "source": "80th Anniversary history (2008)"
  },
  {
    "year": 2008,
    "date": "Apr 5 & Oct 4, 2008",
    "pillar": "together",
    "title": "Jerusalem Day",
    "summary": "Members spread out across the church and the community for a day of volunteer work, then did it again that fall.",
    "more": [
      "Lee Ziegler organized both days."
    ],
    "source": "80th Anniversary history (2008); 85th Anniversary history (2013)"
  },
  {
    "year": 2012,
    "date": "2012",
    "pillar": "together",
    "figure": "$287,087",
    "figureLabel": "given on one Harvest Day",
    "title": "Harvest Day",
    "summary": "The church's annual Harvest Day offering reached $287,087 in 2012.",
    "more": [
      "The 2013 history notes Harvest Day giving was $164,532 in 2007. The same years brought annual Shoes for Orphans drives, Operation Christmas Child, Bibles for Muslims Day, and a substantially reduced loan balance."
    ],
    "source": "85th Anniversary history (2013)"
  }
];

export const TIMELINE_MARKS: TimelineMark[] = [
  {
    "year": 1953,
    "label": "25th anniversary · Nov 1953"
  },
  {
    "year": 1978,
    "label": "50th anniversary · Nov 5, 1978"
  },
  {
    "year": 1998,
    "label": "70th anniversary · 1998"
  },
  {
    "year": 2008,
    "label": "80th anniversary · Nov 2, 2008"
  },
  {
    "year": 2013,
    "label": "85th anniversary · 2013"
  },
  {
    "year": 2028,
    "label": "100th anniversary · Sunday, Nov 5, 2028",
    "future": true
  }
];

export const STORY: StoryChapter[] = [
  {
    "title": "A tent on Brookfield Avenue",
    "years": "1928 – 1929",
    "paragraphs": [
      {
        "ref": null,
        "text": "In the fall of nineteen twenty-eight, Brainerd was a growing community east of Missionary Ridge, just outside the Chattanooga city limits. There was no Baptist church there yet."
      },
      {
        "ref": "A church is born in a tent",
        "text": "A revival began on October twenty-first. The first week met at the Methodist church. The second week moved into a tent pitched on two lots on Brookfield Avenue. And on Sunday, November fourth, nineteen twenty-eight, in that tent, sixty-eight people joined together and became Brainerd Baptist Church."
      },
      {
        "ref": "A church is born in a tent",
        "text": "It was a hard winter to be a church in a tent. Sparks from the heating stoves drifted up and burned holes in the canvas. When it rained, people sat under umbrellas. But they kept coming."
      },
      {
        "ref": "Out of the tent, into the first building",
        "text": "Ground was broken thirteen days after the church was organized. And on April seventh, nineteen twenty-nine, after five months of cold, the congregation walked out of the tent and into its first building."
      },
      {
        "ref": "The first big offering",
        "text": "That same day they took up an offering. A hundred and five dollars in the morning. Eight hundred and sixty dollars in the afternoon. And eleven hundred more in pledges. Two thousand and seventy-five dollars, from a church not yet six months old."
      }
    ]
  },
  {
    "title": "Bricks from the dump",
    "years": "1937 – 1943",
    "paragraphs": [
      {
        "ref": "Free of debt",
        "text": "By May of nineteen thirty-seven, eight years in, the church had paid off its building debt."
      },
      {
        "ref": "Bricks from the city dump",
        "text": "Then it needed a real sanctuary. The people had saved seventeen thousand dollars, but they could not borrow the rest. So they decided to build it themselves."
      },
      {
        "ref": "Bricks from the city dump",
        "text": "Downtown, the city was tearing up Market Street and hauling its old bricks to the dump. Members borrowed a flatbed truck, drove to the dump, and brought the bricks back to Brookfield Avenue. Then, night after night, the pastor and the people cleaned them. Eighty-five thousand bricks, by hand."
      },
      {
        "ref": "Bricks from the city dump",
        "text": "Neighbors from other churches saw what they were doing and gave money without being asked. Years later, Gwen Stringer remembered playing in the construction sand as a little girl while her mother and father washed bricks."
      },
      {
        "ref": "The first sanctuary",
        "text": "On Easter Sunday, nineteen forty-one, they worshiped in the new auditorium for the first time. There were no pews yet, so they carried in the wooden chairs from the Sunday School rooms."
      },
      {
        "ref": "Paid in full, in wartime",
        "text": "Two years later, in the middle of a world war, the building was paid for."
      }
    ]
  },
  {
    "title": "Saving through the war, building after it",
    "years": "1944 – 1958",
    "paragraphs": [
      {
        "ref": "Saving through the war",
        "text": "Eighty-six Brainerd members served in World War Two. Pastor Collins called them Military Missionaries, and their names hung on banners in the sanctuary. One of them, John L. Brown, did not come home."
      },
      {
        "ref": "Saving through the war",
        "text": "At home, the church bought war bonds and saved for the day building materials would be available again. By nineteen forty-seven it had forty thousand, six hundred and seventy dollars set aside."
      },
      {
        "ref": "A commitment to give half to missions",
        "text": "In nineteen fifty, the church made a decision that would shape the rest of its story. It committed to raise its missions giving every year, until half of everything that came in went out to missions."
      },
      {
        "ref": "Two educational buildings",
        "text": "On its twenty-fifth birthday, in nineteen fifty-three, Brainerd broke ground on a new educational building. A second one followed."
      },
      {
        "ref": "Eight years of building",
        "text": "Across the nineteen-fifties, the congregation built more than half a million dollars in new space: classrooms, a nursery, a balcony, and a home for the pastor."
      },
      {
        "ref": "The kindergarten opens",
        "text": "A kindergarten opened with fifty children."
      },
      {
        "ref": "Worship goes on television",
        "text": "And on August twenty-sixth, nineteen fifty-six, Brainerd's worship went out on television for the first time."
      }
    ]
  },
  {
    "title": "Planting churches",
    "years": "1954 – 1959",
    "paragraphs": [
      {
        "ref": "Trinity Chapel becomes South Seminole Baptist Church",
        "text": "Brainerd did not only build for itself. In nineteen fifty-four, the men of the Brotherhood started a mission called Trinity Chapel. A year and a half later, it became South Seminole Baptist Church."
      },
      {
        "ref": "Frawley Road Mission",
        "text": "In nineteen fifty-eight they did it again, on Frawley Road. By nineteen fifty-nine, Frawley Road Baptist Church stood on its own."
      }
    ]
  },
  {
    "title": "A new sanctuary",
    "years": "1963 – 1968",
    "paragraphs": [
      {
        "ref": "The mortgage is burned",
        "text": "On Founders Day, nineteen sixty-three, the church's thirty-fifth anniversary, special offerings paid off the educational building and the mortgage was burned. That same day, the people saw the first drawings of a new sanctuary."
      },
      {
        "ref": "Sent to Libya",
        "text": "In nineteen sixty-five, Harold and Dot Blankenship, who had served Brainerd's young people, were sent out as missionaries to Tripoli, Libya."
      },
      {
        "ref": "A sanctuary furnished gift by gift",
        "text": "The new sanctuary was furnished almost gift by gift. Families chose pieces from a memorial book, in honor of people they loved. Even the hymnals were bought together, on a Sunday set aside for it."
      },
      {
        "ref": "The new sanctuary is dedicated",
        "text": "On January twenty-third, nineteen sixty-six, the sanctuary was dedicated, and Dr. Robert G. Lee preached Payday, Someday. Chairs had to be set in the aisles of the twelve-hundred-and-fifty-seat room. A few months later, the great Austin pipe organ was dedicated."
      },
      {
        "ref": "Handbells bought with Green Stamps",
        "text": "And the handbells? Those were bought with seven hundred books of Green Stamps."
      }
    ]
  },
  {
    "title": "Going out",
    "years": "1968 – 1980",
    "paragraphs": [
      {
        "ref": "Crusades in Indonesia and India",
        "text": "In nineteen sixty-eight, the church sent its pastor to evangelistic crusades in Indonesia and India, and gave thousands of dollars to support the work."
      },
      {
        "ref": "Brainerd Baptist School opens",
        "text": "In nineteen seventy-two, Brainerd Baptist School opened its doors to fifty students."
      },
      {
        "ref": "The first God's Minority team",
        "text": "In nineteen seventy-three, the first God's Minority mission team went to Connecticut."
      },
      {
        "ref": "A farewell gift: the sanctuary debt",
        "text": "When Dr. McIntyre left in nineteen seventy-seven, after eighteen years as pastor, the congregation's farewell gift was a pledge to pay off the sanctuary."
      },
      {
        "ref": "The carillon rings",
        "text": "That fall, two hundred and forty-six bells were installed to ring from the tower."
      },
      {
        "ref": "Sending out, and taking in",
        "text": "In nineteen seventy-eight, the minister of music, Harry Hampsher, and his wife Martha left for Portugal as music missionaries. And the old pastor's home on Mayfair became a Mission House, a place to rest for missionaries home from the field."
      },
      {
        "ref": "Educational building and chapel",
        "text": "In nineteen eighty, the chapel and a new educational building were dedicated."
      }
    ]
  },
  {
    "title": "The nations at our door",
    "years": "1990 – 2003",
    "paragraphs": [
      {
        "ref": "A Brazilian fellowship",
        "text": "In nineteen ninety, a Portuguese-speaking fellowship began meeting in Brainerd's building."
      },
      {
        "ref": "The Cambodian congregation",
        "text": "In nineteen ninety-two, Brainerd invited a Cambodian congregation to become part of the church."
      },
      {
        "ref": "Disaster Relief and World Changers",
        "text": "In nineteen ninety-nine, members organized for disaster relief, and Brainerd began hosting World Changers."
      },
      {
        "ref": "The Hispanic ministry",
        "text": "And in two thousand three, a Hispanic ministry began."
      }
    ]
  },
  {
    "title": "Across the street and around the world",
    "years": "2004 – 2013",
    "paragraphs": [
      {
        "ref": "Teams go out across the world",
        "text": "Teams went out to Kenya, Ukraine, Ecuador, Venezuela, Cambodia, and Wyoming."
      },
      {
        "ref": "Students dig wells in Kenya",
        "text": "School students raised money to dig wells in Kenya, a thousand dollars a well."
      },
      {
        "ref": "The Wilks family to Uganda",
        "text": "The church sent Barry Wilks and his family to Uganda."
      },
      {
        "ref": "Brainerd Crossroads (BX)",
        "text": "In two thousand six, Brainerd Crossroads opened across Mayfair Avenue."
      },
      {
        "ref": "Jerusalem Day",
        "text": "On Jerusalem Day, members spread out across the city to serve."
      },
      {
        "ref": "The Ranns to Mexico",
        "text": "Travis and Danielle Rann went to Mexico."
      },
      {
        "ref": "IMB missionaries and 30+ countries",
        "text": "Amber and Nathan Frick went out with the International Mission Board, and teams from Brainerd reached more than thirty countries."
      },
      {
        "ref": "Harvest Day",
        "text": "And on Harvest Day, twenty twelve, the church gave two hundred eighty-seven thousand dollars in a single offering."
      }
    ]
  },
  {
    "title": "The next hundred",
    "years": "2013 – 2028",
    "paragraphs": [
      {
        "ref": "#gap",
        "text": "The story since then is still being gathered, from the people who lived it."
      },
      {
        "ref": "#mark2028",
        "text": "On Sunday, November fifth, twenty twenty-eight, Brainerd will mark one hundred years since sixty-eight people stood in a tent and became a church."
      },
      {
        "ref": "#mark2028",
        "text": "Every brick, every gift, every family sent out was given by people who believed the greatest days were still ahead. The rest of the story is ours to write."
      }
    ]
  }
];
