import { z } from "zod";
import { id } from "../../../common/validation";

export const addToCartInputSchema = z.object({
  productId: id,
  quantity: z.number().int().min(1, "Số lượng tối thiểu là 1 bản").default(10),
  note: z.string().trim().max(500, "Ghi chú không vượt quá 500 ký tự").optional().default(""),
});

export const updateCartItemInputSchema = z.object({
  quantity: z.number().int().min(1, "Số lượng tối thiểu là 1 bản").optional(),
  note: z.string().trim().max(500, "Ghi chú không vượt quá 500 ký tự").optional(),
  selected: z.boolean().optional(),
});

export const clearCartInputSchema = z.object({
  onlySelected: z.boolean().optional().default(false),
});

export type AddToCartInput = z.infer<typeof addToCartInputSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemInputSchema>;
export type ClearCartInput = z.infer<typeof clearCartInputSchema>;
