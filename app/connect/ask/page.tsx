import { redirect } from "next/navigation";

// "Ask a Quick Question" now lives in the site search, which routes people to
// the right page (or a person) instead of writing an answer.
export default function AskPage() {
  redirect("/search");
}
