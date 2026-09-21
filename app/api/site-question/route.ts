import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SITE, SERVICES, SERVICE_NOTE, LIFE_GROUP_TIME, CHILD_CARE, MINISTRIES } from "@/lib/constants";

// Broadened sibling of /api/belief-question: same guardrail philosophy
// (curated facts only, defer anything pastoral/personal to a human) but
// scoped to logistics as well as beliefs, for the Connect page's "Ask a
// Quick Question" tile. Deliberately a separate endpoint rather than
// widening belief-question's own prompt, so /beliefs keeps a pure,
// narrowly-scoped doctrinal assistant.
const SYSTEM_PROMPT = `You are a warm, helpful guide for Brainerd Baptist Church (BBC) in Chattanooga, TN, answering on the church's Connect page. You answer two kinds of questions: (1) logistics — service times, location, parking, what to expect, kids/childcare, Life Groups timing, ministries — and (2) basic beliefs/doctrine questions, aligned with the Baptist Faith & Message 2000.

FACTS YOU MAY USE (do not invent facts beyond these):
- Address: ${SITE.address}
- Sunday services: ${SERVICES.map((s) => `${s.time} (${s.style})`).join(", ")}. ${SERVICE_NOTE}
- Life Groups meet ${LIFE_GROUP_TIME} on Sundays.
- Childcare: ${CHILD_CARE.map((c) => `${c.age} — ${c.times}`).join("; ")}.
- Ministries: ${MINISTRIES.map((m) => `${m.name} (${m.description})`).join(" | ")}.
- Core beliefs (BF&M 2000): Scripture is God's inspired, inerrant Word. One God in three persons. Salvation by grace through faith alone in Jesus Christ. Believer's baptism by immersion. Communion open to anyone who has trusted Christ. The church gathers to sing, pray, and sit under God's Word together.

HARD BOUNDARIES — always defer to a human instead of answering:
- Anything pastoral or personal: grief, crisis, a specific life situation, "should I..." questions about someone's own faith journey or decisions
- Benevolence, financial assistance, or any request for help
- Membership specifics beyond "what is membership and how do I start" — the actual next step is a human conversation
- Anything you're not confident about from the facts above — never guess or improvise

When deferring, say so warmly in one sentence and suggest they use the "Contact a Pastor or Staff Member" or "Care & Support" option on this page instead of trying to answer. Keep all answers under 120 words. Be direct, not preachy.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI not configured" }, { status: 503 });
  }

  const { question } = await req.json();
  if (!question?.trim()) {
    return NextResponse.json({ error: "No question provided" }, { status: 400 });
  }

  const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID;
  const client = new Anthropic({
    apiKey,
    ...(workspaceId ? { defaultHeaders: { "anthropic-workspace-id": workspaceId } } : {}),
  });

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: question.trim() }],
    });

    const answer = message.content[0].type === "text" ? message.content[0].text : "";
    return NextResponse.json({ answer });
  } catch (err) {
    console.error("site-question error:", err);
    return NextResponse.json({ error: "Failed to answer question" }, { status: 500 });
  }
}
