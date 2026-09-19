import Image from "next/image";

// Height of each photo in the strip
const STRIP_H = 300;

// Curated selection — mix of landscape and portrait
const PHOTOS = [
  { src: "/carousel/students-1.jpg",   w: 1400, h:  931, alt: "Student ministry worship" },
  { src: "/carousel/music-camp-2.jpg", w: 1400, h:  931, alt: "Brainerd Kids summer musical" },
  { src: "/carousel/life-groups-1.jpg",w: 1400, h:  931, alt: "Community at Brainerd Baptist" },
  { src: "/carousel/music-camp-5.jpg", w: 1400, h: 2104, alt: "Kids performing in the sanctuary" },
  { src: "/carousel/missions-1.jpg",   w: 1400, h:  787, alt: "BBC Ecuador missions trip 2026" },
  { src: "/carousel/music-camp-6.jpg", w: 1400, h: 2104, alt: "Brainerd Kids performer" },
  { src: "/carousel/music-camp-4.jpg", w: 1400, h:  931, alt: "Brainerd Kids on stage" },
  { src: "/carousel/missions-2.jpg",   w:  960, h:  482, alt: "BBC Ecuador group photo 2026" },
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
      style={{ background: "#00142a" }}
      aria-label="Ministry and congregation photo gallery"
    >
      {/* Left/right edge fades */}
      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-16"
          style={{ background: "linear-gradient(to right, #00142a, transparent)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-16"
          style={{ background: "linear-gradient(to left, #00142a, transparent)" }}
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
