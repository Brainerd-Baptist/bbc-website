import Image from "next/image";
import { getSpeaker } from "@/lib/speakers";
import { SERMONS } from "@/lib/sermons";

interface Props {
  name: string;
  accentColor: string;
}

export default function SpeakerCard({ name, accentColor }: Props) {
  const info = getSpeaker(name);
  const sermonCount = SERMONS.filter((s) => s.speaker === name).length;

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-white/6 bg-white/3">
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
          className="text-white font-semibold text-sm leading-snug"
          style={{ letterSpacing: "-0.01em" }}
        >
          {name}
        </p>
        <p className="text-white/35 text-xs mt-0.5">
          {info.title}
          {sermonCount > 0 && (
            <span className="text-white/20 ml-2">
              · {sermonCount} sermon{sermonCount !== 1 ? "s" : ""}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
