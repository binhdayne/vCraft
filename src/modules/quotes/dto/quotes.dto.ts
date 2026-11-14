import { z } from "zod";
import { category, id, isoDate, text } from "../../../common/validation";
import { landingContentSchema } from "../../batches/dto/batches.dto";
export const quoteInput = z
  .object({
    title: text(150),
    category,
    quantity: z.number().int().min(1).max(1000000),
    deadline: isoDate,
    description: text(5000),
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
export type EditDto = z.output<typeof editInputSchema>;
export const bidInputSchema = z
  .object({
    version: z.number().int().min(0),
    unitPrice: z.number().positive().max(1e9),
    quantity: z.number().int().min(1).max(1000000),
    days: z.number().int().min(1).max(365),
    note: z.string().trim().max(2000),
  })
  .strict();
export type BidDto = z.output<typeof bidInputSchema>;
export const productionInputSchema = z
  .object({
    version: z.number().int().min(0),
    action: z.enum(["start", "ready"]),
    landingPage: landingContentSchema.optional(),
  })
  .strict();
export type ProductionDto = z.output<typeof productionInputSchema>;

export type CreateQuoteDto = z.output<typeof quoteInput>;
export type VersionDto = z.output<typeof versionInput>;
export type AllocationDto = z.output<typeof allocationInput>;
