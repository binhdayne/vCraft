import { z } from "zod";
import { id, images, isoDate, text } from "../../../common/validation";
export const editInputSchema = z
  .object({ story: text(5000), published: z.boolean() })
  .strict();
export type EditDto = z.output<typeof editInputSchema>;
export const eventInputSchema = z
  .object({
    title: text(150),
    date: isoDate,
    note: text(3000),
    images: images.min(1),
  })
  .strict();
export type EventDto = z.output<typeof eventInputSchema>;

// A completed allocation has its own story and photographs, separate from the catalog.
export const landingContentSchema = z.object({
  productId: id,
  story: text(5000),
  workshopStory: text(10000),
  coverImages: images.min(1),
  events: z.array(eventInputSchema).min(2).max(30),
}).strict().superRefine((value, context) => {
  const today = new Date().toISOString().slice(0, 10);
  value.events.forEach((event, index) => {
    if (event.date > today) context.addIssue({ code: z.ZodIssueCode.custom,
      path: ['events', index, 'date'], message: 'Ngày sản xuất không được ở tương lai' });
    if (index && event.date < value.events[index - 1].date) context.addIssue({ code: z.ZodIssueCode.custom,
      path: ['events', index, 'date'], message: 'Các mốc phải theo thứ tự từ ngày đầu đến thành phẩm' });
  });
});
export const landingEditSchema = z.object({
  story: text(5000), workshopStory: text(10000), coverImages: images.min(1),
  events: z.array(eventInputSchema).min(2).max(30), published: z.boolean(),
}).strict();
