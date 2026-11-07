import { z } from "zod";
import { id, images, isoDate, text } from "../../../common/validation";
export const createInputSchema = z
  .object({
    productId: id,
    quantity: z.number().int().min(1).max(1000000),
    story: text(5000),
    published: z.boolean(),
  })
  .strict();
export type CreateDto = z.output<typeof createInputSchema>;
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
