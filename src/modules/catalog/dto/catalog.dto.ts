import { z } from "zod";
import { category, id, images, text } from "../../../common/validation";
export const workshopInput = z
  .object({
    name: text(120),
    story: text(10000),
    address: text(300),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    openForVisits: z.boolean(),
    visitingHours: text(200),
    categories: z.array(category).min(1).max(4),
    images,
    certificates: images,
  })
  .strict();
export const productInput = z
  .object({
    name: text(120),
    category,
    description: text(10000),
    price: z.number().min(0).max(1e9),
    dimensions: text(100),
    material: text(200),
    images: images.min(1),
    published: z.boolean(),
  })
  .strict();
export const productsInputSchema = z
  .object({
    category: z.string().max(80).optional(),
    workshopId: id.optional(),
    search: z.string().max(100).optional(),
    page: z.coerce.number().int().min(1).max(10000).default(1),
    limit: z.coerce.number().int().min(1).max(60).default(12),
  })
  .strict();
export type ProductsDto = z.output<typeof productsInputSchema>;

export type WorkshopDto = z.output<typeof workshopInput>;
export type ProductDto = z.output<typeof productInput>;
