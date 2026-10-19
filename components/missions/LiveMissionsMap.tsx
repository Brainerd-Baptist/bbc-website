import WorldReachMap from "@/components/missions/WorldReachMap";
import MissionsEngagementMap from "@/components/missions/MissionsEngagementMap";
import { getMissionsFeed } from "@/lib/missions/feed";
import { mapShapes } from "@/lib/missions/shapes";

// The missions team's live map. Data comes from Brainerd Mail (see lib/missions/feed.ts) and refreshes the
// moment they save. If it has never been reachable and no copy exists, show the original regional map so
// the page is never empty.
export default async function LiveMissionsMap() {
  const feed = await getMissionsFeed();
  if (!feed || feed.countries.length === 0) return <WorldReachMap />;
  return <MissionsEngagementMap feed={feed} shapes={mapShapes(feed.countries.map((c) => c.id))} />;
}
