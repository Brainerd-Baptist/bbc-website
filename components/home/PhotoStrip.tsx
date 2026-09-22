import Image from "next/image";

// Height of each photo in the strip
const STRIP_H = 300;

// Curated selection — mix of ministry contexts and life stages
const PHOTOS = [
  { src: "/carousel/congregation-worship.jpg",  w: 1400, h:  931, alt: "Congregation in worship at Brainerd Baptist" },
  { src: "/carousel/kids-midweek.jpg",          w: 1400, h:  931, alt: "Kids active in midweek ministry at Brainerd Baptist" },
  { src: "/carousel/students-1.jpg",            w: 1400, h:  931, alt: "Students in community at Brainerd Baptist" },
  { src: "/carousel/life-groups-1.jpg",         w: 1400, h:  931, alt: "Community at Brainerd Baptist" },
  { src: "/carousel/food-pantry-wide.jpg",      w: 1400, h:  931, alt: "Brainerd Baptist food pantry serving the community" },
  { src: "/carousel/choir-orchestra.jpg",       w: 1400, h:  931, alt: "Choir and Orchestra in the sanctuary at Brainerd Baptist" },
  { src: "/carousel/music-camp-3.jpg",          w: 1400, h:  931, alt: "Brainerd Kids summer musical" },
  { src: "/carousel/adult-bible-study.jpg",     w: 1400, h:  931, alt: "Adults in small group Bible study" },
  { src: "/carousel/missions-1.jpg",            w: 1400, h:  787, alt: "Brainerd Baptist Ecuador missions trip 2026" },
  { src: "/carousel/food-pantry-checkin.jpg",   w: 1400, h:  931, alt: "Volunteers at the Brainerd Baptist food pantry" },
  { src: "/carousel/music-camp-5.jpg",          w: 1400, h:  931, alt: "Brainerd Kids summer camp" },
  { src: "/carousel/missions-2.jpg",            w:  960, h:  482, alt: "Brainerd Baptist Ecuador group photo 2026" },
  { src: "/carousel/men-football-catch.jpg",    w: 1400, h:  931, alt: "A man catching a football at a Brainerd Baptist men's ministry event" },
  { src: "/carousel/men-devotional.jpg",        w: 1400, h:  931, alt: "A man leading a devotional at a Brainerd Baptist men's ministry gathering" },
  { src: "/carousel/men-intergen.jpg",          w: 1400, h:  931, alt: "Men of different generations at a Brainerd Baptist men's ministry event" },
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
