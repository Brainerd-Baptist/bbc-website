import { defineType, defineField } from "sanity";
import { RESOURCE_TOPICS } from "../../lib/resource-topics";

export const RESOURCE_TYPES = [
  { title: "Book", value: "book" },
  { title: "Article", value: "article" },
  { title: "Ministry / Org", value: "ministry" },
  { title: "Video", value: "video" },
  { title: "Podcast", value: "podcast" },
  { title: "Prayer / Liturgy", value: "prayer" },
  { title: "Other", value: "other" },
];

export const resourceType = defineType({
  name: "resource",
  title: "Resource",
  type: "document",
  description:
    "A book, article, ministry, video, podcast, or prayer Curtis has recommended from the pulpit. " +
    "Entered once here, then referenced from every sermon (or series) that mentions it — never " +
    "re-typed. See claude/sermon-resource-catalog-scope-2026-10-03.md for the full plan.",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "creator",
      title: "Author / Creator",
      description: 'e.g. "Graeme Goldsworthy" — leave blank for ministries/orgs',
      type: "string",
    }),
    defineField({
      name: "type",
      title: "Type",
      type: "string",
      options: { list: RESOURCE_TYPES },
      initialValue: "book",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "blurb",
      title: "Why it was recommended",
      description: "1–3 sentences — why Curtis recommended it, not a product description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "topics",
      title: "Topics",
      description: "Pick the topics this resource speaks to — they become clickable filters on /resources. Bible book is added automatically from the sermon, so don't tag that here.",
      type: "array",
      of: [{ type: "string" }],
      options: { list: RESOURCE_TOPICS.map((t) => ({ title: t, value: t })) },
    }),
    defineField({
      name: "autoSummary",
      title: "Auto-fetched description",
      description: "Pulled from the link's own page by the nightly job. Shown on the card only when 'Why it was recommended' is empty — write a blurb above to replace it.",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "enrichedAt",
      title: "Auto-fill attempted",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "relatedPassage",
      title: "Related Passage",
      description: 'e.g. "John 5:1-18" — same format used by the scripture popup',
      type: "string",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: { list: [{ title: "Active", value: "active" }, { title: "Archived", value: "archived" }] },
      initialValue: "active",
      description: "Archived resources stay referenced (nothing 404s) but drop out of the catalog and search.",
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "needsReview",
      title: "Needs Review",
      description: "Set automatically when type/metadata was guessed (auto-sync or backfill), not confirmed by a human.",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "title", creator: "creator", type: "type", status: "status" },
    prepare({ title, creator, type, status }) {
      const typeLabel = RESOURCE_TYPES.find((t) => t.value === type)?.title ?? type;
      return {
        title,
        subtitle: [typeLabel, creator, status === "archived" ? "Archived" : null].filter(Boolean).join(" · "),
      };
    },
  },
  orderings: [
    { title: "Title (A–Z)", name: "titleAsc", by: [{ field: "title", direction: "asc" }] },
  ],
});
