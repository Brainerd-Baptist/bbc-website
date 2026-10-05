/**
 * Strips the handful of markdown characters a model might slip into an
 * answer (bold/italic asterisks or underscores, `#` headers, `` ` `` code
 * spans) before it's rendered as plain text. The AI-answer widgets
 * (belief-question, site-question) display their answer in a plain <p>,
 * so any literal markdown characters show up in the UI instead of being
 * formatted — this is a defensive cleanup in addition to instructing the
 * model not to use markdown in the first place.
 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*]\s+/gm, "");
}
