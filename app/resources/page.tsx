import { getAllResources } from "@/lib/sanity";
import ResourceCatalog from "@/components/sermons/ResourceCatalog";

export const metadata = {
  title: "Resources — Brainerd Baptist Church",
  description:
    "Books, articles, ministries, and other resources Curtis has recommended from the pulpit — searchable by title, author, and topic.",
};

export const revalidate = 3600;

export default async function ResourcesPage() {
  const resources = await getAllResources().catch(() => []);

  return (
    <div className="min-h-screen px-5 md:px-8 pt-28 pb-10">
      <div className="max-w-5xl mx-auto">
        <h1
          style={{
            fontFamily: "var(--font-barlow-condensed), sans-serif", fontWeight: 800,
            fontSize: "clamp(1.75rem, 4vw, 2.75rem)", letterSpacing: "-0.03em",
            color: "var(--fg)", marginBottom: "0.5rem",
          }}
        >
          Resources
        </h1>
        <p style={{ color: "var(--fg-muted)", fontSize: "0.95rem", marginBottom: "2rem", maxWidth: "48rem" }}>
          Books, articles, ministries, and other resources Curtis has recommended from the pulpit —
          each one links back to the sermon(s) it came from.
        </p>

        {resources.length === 0 ? (
          <p style={{ color: "var(--fg-subtle)", fontSize: "0.9rem" }}>
            No resources have been added yet — check back after the next sermon.
          </p>
        ) : (
          <ResourceCatalog resources={resources} />
        )}
      </div>
    </div>
  );
}
