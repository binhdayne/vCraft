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
