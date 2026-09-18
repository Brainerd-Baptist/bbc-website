import { getPodcastAudioMap } from "@/lib/podcast";

export const dynamic = "force-dynamic";

export async function GET() {
  const map = await getPodcastAudioMap();
  const keys = Object.keys(map).sort();
  return Response.json({ count: keys.length, keys });
}
