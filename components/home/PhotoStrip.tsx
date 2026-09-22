import Image from "next/image";

// Height of each photo in the strip
const STRIP_H = 300;

// Curated selection — mix of ministry contexts and life stages.
// Order is hand-interleaved (not grouped by ministry, not randomized at
// render time) so the strip feels varied on first paint and stays
// identical between server and client render.
const PHOTOS = [
  { src: "/carousel/congregation-worship.jpg",  w: 1400, h:  931, alt: "Congregation in worship at Brainerd Baptist" },
  { src: "/carousel/men-devotional.jpg",        w: 1400, h:  931, alt: "A man leading a devotional at a Brainerd Baptist men's ministry gathering" },
  { src: "/carousel/kids-classroom-strip.jpg",  w: 1400, h:  931, alt: "Kids engaged in a Sunday classroom at Brainerd Baptist" },
  { src: "/carousel/women-intergen.jpg",        w: 1400, h:  931, alt: "Women of different generations sharing a laugh at a Brainerd Baptist women's ministry event" },
  { src: "/carousel/preaching-strip-2.jpg",     w: 1400, h:  931, alt: "Preaching from God's Word at Brainerd Baptist" },
  { src: "/carousel/men-football-catch.jpg",    w: 1400, h:  931, alt: "A man catching a football at a Brainerd Baptist men's ministry event" },
  { src: "/carousel/worship-musician-strip.jpg", w: 1400, h:  931, alt: "A musician leading worship at Brainerd Baptist" },
  { src: "/carousel/women-prayer.jpg",          w: 1400, h:  931, alt: "Women praying together at a Brainerd Baptist women's ministry event" },
  { src: "/carousel/students-circle-strip.jpg", w: 1400, h:  931, alt: "Students gathered in community at Brainerd Baptist" },
  { src: "/carousel/kids-sunday-worship-strip.jpg", w: 1400, h:  931, alt: "Kids engaged in Sunday worship at Brainerd Baptist" },
  { src: "/carousel/women-speaker.jpg",         w: 1400, h:  931, alt: "A woman speaking at a Brainerd Baptist women's ministry gathering" },
  { src: "/carousel/adults-study-strip.jpg",    w: 1400, h:  931, alt: "Adults in small group Bible study" },
  { src: "/carousel/men-intergen.jpg",          w: 1400, h:  931, alt: "Men of different generations at a Brainerd Baptist men's ministry event" },
  { src: "/carousel/preaching-strip.jpg",       w: 1400, h:  787, alt: "Teaching from Scripture at Brainerd Baptist" },
  { src: "/carousel/women-laughing.jpg",        w: 1400, h:  931, alt: "Women laughing together at a Brainerd Baptist women's ministry gathering" },
  { src: "/carousel/worship-team-strip.jpg",    w: 1400, h:  931, alt: "The worship team leading Sunday morning at Brainerd Baptist" },
  { src: "/carousel/kids-toddler-strip.jpg",    w: 1400, h:  931, alt: "Toddlers playing together in the Brainerd Baptist nursery" },
  { src: "/carousel/missions-2.jpg",            w:  960, h:  482, alt: "Brainerd Baptist Ecuador group photo 2026" },
];

function PhotoItem({ photo, priority = false }: { photo: (typeof PHOTOS)[0]; priority?: boolean }) {
  const displayW = Math.round((STRIP_H / photo.h) * photo.w);
  return (
    <div
      className="relative flex-shrink-0 overflow-hidden rounded-lg"
      style={{ width: displayW, height: STRIP_H }}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        className="object-cover"
        sizes={`${displayW}px`}
        priority={priority}
      />
    </div>
  );
}

export default function PhotoStrip() {
  return (
    <section
      className="overflow-hidden py-14"
      style={{ background: "var(--brand-ink)" }}
      aria-label="Ministry and congregation photo gallery"
    >
      {/* Left/right edge fades */}
      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-16"
          style={{ background: "linear-gradient(to right, var(--brand-ink), transparent)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-16"
          style={{ background: "linear-gradient(to left, var(--brand-ink), transparent)" }}
        />

        {/* Scrolling track — two copies for seamless loop */}
        <div
          className="photo-strip-track flex gap-3"
          style={{ width: "max-content" }}
        >
          {PHOTOS.map((p, i) => (
            <PhotoItem key={i} photo={p} priority={i < 3} />
          ))}
          {/* Duplicate set — keeps the loop seamless */}
          {PHOTOS.map((p, i) => (
            <PhotoItem key={`b-${i}`} photo={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
