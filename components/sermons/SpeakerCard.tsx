import Image from "next/image";
import { getSpeaker, speakerSlug } from "@/lib/speakers";
import { SERMONS } from "@/lib/sermons";

interface Props {
  name: string;
  accentColor: string;
}

export default function SpeakerCard({ name, accentColor }: Props) {
  const info = getSpeaker(name);
  const sermonCount = SERMONS.filter((s) => s.speaker === name).length;

  const slug = speakerSlug(name);

  return (
    <a
      href={`/speakers/${slug}`}
      className="group flex items-center gap-4 p-4 rounded-xl transition-all"
      style={{ border: "1px solid var(--border)", background: "var(--surface-sunken)" }}
    >
      {/* Avatar — photo if available, else initials */}
      <div
        className="flex-shrink-0 w-11 h-11 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold"
        style={
          info.photo
            ? {}
            : { background: accentColor + "33", border: `1px solid ${accentColor}44` }
        }
      >
        {info.photo ? (
          <Image
            src={`/staff/${info.photo}.jpg`}
            alt={name}
            width={44}
            height={44}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <span style={{ color: accentColor }}>
            {name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="font-semibold text-sm leading-snug"
          style={{ color: "var(--fg)", letterSpacing: "-0.01em" }}
        >
          {name}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--fg-muted)" }}>
          {info.title}
          {sermonCount > 0 && (
            <span className="ml-2" style={{ color: "var(--fg-subtle)" }}>
              · {sermonCount} sermon{sermonCount !== 1 ? "s" : ""}
            </span>
          )}
        </p>
      </div>

      {/* Arrow hint */}
      <svg
        width="14" height="14" viewBox="0 0 14 14" fill="none"
        className="flex-shrink-0 transition-colors"
        style={{ color: "var(--fg-subtle)" }}
        stroke="currentColor" strokeWidth="1.5"
      >
        <path d="M3 7h8M8 4l3 3-3 3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </a>
  );
}
