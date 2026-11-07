import { z } from "zod";
import { text } from "../../../common/validation";
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
