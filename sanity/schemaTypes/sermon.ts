import { defineType, defineField } from "sanity";

export const sermonType = defineType({
  name: "sermon",
  title: "Sermon",
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
      name: "date",
      title: "Date",
      type: "date",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "speaker",
      title: "Speaker",
      type: "string",
      initialValue: "Curtis Hill",
    }),
    defineField({
      name: "series",
      title: "Series",
      type: "reference",
      to: [{ type: "series" }],
    }),
    defineField({
      name: "passage",
      title: "Passage",
      description: 'e.g. "Romans 8:28–39"',
      type: "string",
    }),
    defineField({
      name: "book",
      title: "Book of the Bible",
      description: 'e.g. "Romans" — used for passage search',
      type: "string",
    }),
    defineField({
      name: "youtubeId",
      title: "YouTube Video ID",
      description: 'The part after ?v= in the YouTube URL',
      type: "string",
    }),
    defineField({
      name: "duration",
      title: "Duration",
      description: 'e.g. "42 min"',
      type: "string",
    }),
    defineField({
      name: "audioUrl",
      title: "Audio Download URL",
      description: "Direct link to MP3 for podcast/download",
      type: "url",
    }),
    defineField({
      name: "description",
      title: "Short Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "outline",
      title: "Sermon Outline",
      description: "Main points and sub-points shown on the sermon page",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Main Point", value: "h3" },
            { title: "Sub-point", value: "h4" },
          ],
          lists: [{ title: "Bullet", value: "bullet" }],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
          },
        },
      ],
    }),
    defineField({
      name: "notes",
      title: "Sermon Notes",
      description: "Full notes shown below the video (rich text)",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading", value: "h3" },
            { title: "Sub-heading", value: "h4" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
              { title: "Underline", value: "underline" },
            ],
            annotations: [
              {
                name: "scripture",
                type: "object",
                title: "Scripture Reference",
                fields: [
                  {
                    name: "reference",
                    type: "string",
                    title: "Reference (e.g. Romans 8:28)",
                  },
                ],
              },
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [{ name: "href", type: "url", title: "URL" }],
              },
            ],
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      date: "date",
      speaker: "speaker",
      series: "series.title",
    },
    prepare({ title, date, speaker, series }) {
      return {
        title,
        subtitle: [date, series, speaker].filter(Boolean).join(" · "),
      };
    },
  },
  orderings: [
    {
      title: "Date (newest first)",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
  ],
});
