import ConnectSubpageHeader from "@/components/connect/ConnectSubpageHeader";
import AskConnectQuestion from "@/components/connect/AskConnectQuestion";

export const metadata = { title: "Ask a Question — Brainerd Baptist Church" };

export default function AskPage() {
  return (
    <div className="min-h-screen bg-white">
      <ConnectSubpageHeader
        eyebrow="Ask a Quick Question"
        title="What Do You Want to Know?"
        description="Ask about service times, what to expect, our beliefs, or anything else. If it's something a person should really answer, we'll point you the right way."
      />
      <section className="pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <AskConnectQuestion />
        </div>
      </section>
    </div>
  );
}
