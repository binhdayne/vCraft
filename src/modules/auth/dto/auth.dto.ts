import { z } from "zod";
import { text } from "../../../common/validation";
export const registerInputSchema = z
  .object({
    name: text(100),
    email: z
      .string()
      .email()
      .max(254)
      .transform((s) => s.toLowerCase()),
    password: z.string().min(10).max(72),
  })
  .strict();
export type RegisterDto = z.output<typeof registerInputSchema>;
export const loginInputSchema = z
  .object({
    email: z
      .string()
      .email()
      .max(254)
      .transform((s) => s.toLowerCase()),
    password: z.string().min(1).max(72),
  })
  .strict();
export type LoginDto = z.output<typeof loginInputSchema>;

export const updateProfileSchema = z
  .object({
    name: text(100).optional(),
    phone: z.string().trim().max(20).optional(),
    address: z.string().trim().max(300).optional(),
  })
  .strict();
export type UpdateProfileDto = z.output<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(72),
    newPassword: z.string().min(10).max(72),
  })
  .strict();
export type ChangePasswordDto = z.output<typeof changePasswordSchema>;
