import { z } from "zod";
import { id, images, isoDate } from "../../../common/validation";

// A draft may contain unfinished milestones. Publication still uses landingContentSchema.
export const productionJournalContent = z.object({
  productId: z.union([id, z.literal("")]).default(""),
  story: z.string().trim().max(5000).default(""),
  workshopStory: z.string().trim().max(10000).default(""),
  coverImages: images.default([]),
  events: z.array(z.object({
    title: z.string().trim().max(150).default(""),
    date: z.union([isoDate, z.literal("")]).default(""),
    note: z.string().trim().max(3000).default(""),
    images: images.default([]),
  }).strict()).max(30).default([]),
}).strict().superRefine((journal, context) => {
  const today = new Date().toISOString().slice(0, 10);
  journal.events.forEach((event, index) => {
    if (event.date && event.date > today) context.addIssue({ code: z.ZodIssueCode.custom,
      path: ["events", index, "date"], message: "Ngày công đoạn không được ở tương lai" });
  });
});

export const productionJournalInput = z.object({
  version: z.number().int().min(0),
  journal: productionJournalContent,
}).strict();
