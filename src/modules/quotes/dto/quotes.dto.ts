import { z } from "zod";
import { category, id, isoDate, text } from "../../../common/validation";

export const customerInfoInputSchema = z.object({
  fullName: z.string().trim().max(100).optional().default(""),
  phoneNumber: z.string().trim().max(20).optional().default(""),
  shippingAddress: z.string().trim().max(300).optional().default(""),
  packagingNote: z.string().trim().max(500).optional().default(""),
});

export const lotItemInputSchema = z.object({
  productId: id,
  artworkName: z.string().trim().max(150).optional(),
  image: z.string().optional().default(""),
  category: z.string().optional(),
  dimensions: z.string().optional().default("26 × 37 cm"),
  type: z.enum(["general", "custom"]).optional().default("general"),
  workshopId: id.nullable().optional().default(null),
  workshopName: z.string().optional().default(""),
  quantity: z.number().int().min(1, "Số lượng tối thiểu là 1").max(1000000),
  note: z.string().trim().max(500).optional().default(""),
});

export const quoteInput = z
  .object({
    title: text(150),
    category: category.optional(),
    quantity: z.number().int().min(1).max(1000000).optional(),
    deadline: isoDate,
    description: text(5000),
    targetType: z.enum(["direct", "bidding"]).optional().default("bidding"),
    targetWorkshopId: id.nullable().optional().default(null),
    customerInfo: customerInfoInputSchema.optional().default({}),
    items: z.array(lotItemInputSchema).optional().default([]),
  })
  .strict();

export const acceptSingleWorkshopSchema = z
  .object({
    workshopId: id,
    version: z.number().int().min(0),
  })
  .strict();

export const versionInput = z
  .object({ version: z.number().int().min(0) })
  .strict();

export const allocationInput = z
  .object({
    version: z.number().int().min(0),
    allocations: z
      .array(
        z
          .object({ workshopId: id, quantity: z.number().int().min(1) })
          .strict(),
      )
      .min(1)
      .max(100),
  })
  .strict();

export const editInputSchema = quoteInput.extend({
  version: z.number().int().min(0),
});

export const bidInputSchema = z
  .object({
    version: z.number().int().min(0),
    unitPrice: z.number().positive().max(1e9),
    quantity: z.number().int().min(1).max(1000000),
    days: z.number().int().min(1).max(365),
    note: z.string().trim().max(2000),
  })
  .strict();

export const productionInputSchema = z
  .object({
    version: z.number().int().min(0),
    action: z.enum(["start", "ready"]),
  })
  .strict();

export type CreateQuoteDto = z.output<typeof quoteInput>;
export type EditDto = z.output<typeof editInputSchema>;
export type BidDto = z.output<typeof bidInputSchema>;
export type ProductionDto = z.output<typeof productionInputSchema>;
export type VersionDto = z.output<typeof versionInput>;
export type AllocationDto = z.output<typeof allocationInput>;
export type AcceptSingleWorkshopDto = z.output<typeof acceptSingleWorkshopSchema>;
