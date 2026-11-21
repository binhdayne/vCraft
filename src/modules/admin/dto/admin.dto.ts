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

export const artworkApprovalInputSchema = z
  .object({
    status: z.enum(["approved", "rejected"]),
    reason: text(500).optional(),
  })
  .strict();
export type ArtworkApprovalDto = z.output<typeof artworkApprovalInputSchema>;

export const adminArtworksQuerySchema = z
  .object({
    type: z.enum(["general", "custom"]).optional().default("general"),
    approvalStatus: z
      .enum(["all", "pending", "approved", "rejected"])
      .optional()
      .default("all"),
    category: z.string().max(80).optional(),
    search: z.string().max(100).optional(),
    page: z.coerce.number().int().min(1).max(10000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(12),
  })
  .strict();
export type AdminArtworksQueryDto = z.output<typeof adminArtworksQuerySchema>;
