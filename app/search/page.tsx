import type { Metadata } from "next";
import ConnectSubpageHeader from "@/components/connect/ConnectSubpageHeader";
import Section from "@/components/ui/Section";
import SearchPanel from "@/components/search/SearchPanel";

export const metadata: Metadata = {
  title: "Search — Brainerd Baptist Church",
  description: "Ask in your own words and we'll point you to the right place.",
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return (
    <div className="min-h-screen">
      <ConnectSubpageHeader
        eyebrow="Search"
        title="What Are You Looking For?"
        description="Ask in your own words, even if you're not sure what to call it. We'll point you to the right place, and to a person if that's what you need."
      />
      <Section className="pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <SearchPanel initialQuery={typeof q === "string" ? q.slice(0, 200) : ""} autoFocus />
        </div>
      </Section>
    </div>
  );
}
