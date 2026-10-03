import { defineType, defineField } from "sanity";

export const seriesType = defineType({
  name: "series",
  title: "Series",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "accentColor",
      title: "Accent Color",
      description: "Hex color for this series (e.g. #00abc9)",
      type: "string",
    }),
    defineField({
      name: "bgColor",
      title: "Background Color",
      description: "Dark background hex for sermon cards (e.g. #0f2040)",
      type: "string",
    }),
    defineField({
      name: "startDate",
      title: "Start Date",
      type: "date",
    }),
    defineField({
      name: "endDate",
      title: "End Date",
      type: "date",
    }),
    defineField({
      name: "active",
      title: "Current Series",
      description: "Is this the series being preached right now?",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "resourcesMentioned",
      title: "Resources Mentioned (series-wide)",
      description:
        "Books, articles, ministries, etc. that apply across the WHOLE series (e.g. the main " +
        "commentary used every week) — added once here instead of re-added to every sermon. " +
        "A resource specific to one week's text belongs on that Sermon document instead.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "resource" }] }],
    }),
  ],
  preview: {
    select: { title: "title", active: "active" },
    prepare({ title, active }) {
      return { title, subtitle: active ? "▶ Current series" : "" };
    },
  },
});
