import Image from "next/image";
import { SERMONS, formatDate } from "@/lib/sermons";

interface Props {
  currentId: string;   // id or slug of the sermon being viewed
  seriesId: string;    // seriesId slug to match against
  accentColor: string;
}

export default function RelatedSermons({ currentId, seriesId, accentColor }: Props) {
  if (!seriesId) return null;

  // Find up to 4 other sermons from the same series, most recent first
  const related = SERMONS
    .filter((s) => s.seriesId === seriesId && s.id !== currentId)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section className="px-5 md:px-8 pb-12">
      <div className="max-w-4xl mx-auto">
        <div className="border-t border-white/8 pt-10 mb-6">
          <h2
            className="text-[10px] font-semibold tracking-widest uppercase mb-6"
            style={{ color: accentColor }}
          >
            More from This Series
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {related.map((s) => (
            <a
              key={s.id}
              href={`/sermons/${s.id}`}
              className="group flex gap-3 rounded-xl overflow-hidden border border-white/6 hover:border-white/14 bg-white/3 hover:bg-white/6 transition-all p-3"
            >
              {/* Thumbnail */}
              {s.youtubeId && (
                <div className="relative flex-shrink-0 w-20 h-[52px] rounded-lg overflow-hidden bg-white/8">
                  <Image
                    src={`https://i.ytimg.com/vi/${s.youtubeId}/hqdefault.jpg`}
                    alt={s.title}
                    fill
                    className="object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                    sizes="80px"
                    unoptimized
                  />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-white text-sm font-semibold leading-snug mb-1 line-clamp-2"
                  style={{ letterSpacing: "-0.015em" }}
                >
                  {s.title}
                </p>
                <p className="text-white/35 text-[11px]">
                  {s.speaker} · {formatDate(s.date)}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
