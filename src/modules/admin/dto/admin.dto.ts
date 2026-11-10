import { z } from "zod";
import { category, images, text } from "../../../common/validation";
import { workshopInput } from "../../catalog/dto/catalog.dto";

export const createInputSchema = z
  .object({
    name: text(100),
    email: z
      .string()
      .email()
      .max(254)
      .transform((s) => s.toLowerCase()),
    password: z.string().min(10).max(72),
    workshop: workshopInput,
  })
  .strict();
export type CreateDto = z.output<typeof createInputSchema>;

export const approvalInputSchema = z.object({ approved: z.boolean() }).strict();
export type ApprovalDto = z.output<typeof approvalInputSchema>;

export const accountInputSchema = z.object({ active: z.boolean() }).strict();
export type AccountDto = z.output<typeof accountInputSchema>;

export const adminArtworkInput = z
  .object({
    name: text(120),
    category,
    description: text(10000).optional().default(""),
    story: text(20000).optional().default(""),
    dimensions: text(100),
    material: text(200).optional().default("Giấy điệp thủ công, màu tự nhiên"),
    images: images.min(1).max(8),
    published: z.boolean().optional().default(true),
  })
  .strict();
export type AdminArtworkDto = z.output<typeof adminArtworkInput>;

export const updateAdminArtworkInput = adminArtworkInput.partial();
export type UpdateAdminArtworkDto = z.output<typeof updateAdminArtworkInput>;
