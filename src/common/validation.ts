import { BadRequestException } from "@nestjs/common";
import { z } from "zod";
export function parse<S extends z.ZodTypeAny>(
  schema: S,
  value: unknown,
): z.output<S> {
  const r = schema.safeParse(value);
  if (!r.success)
    throw new BadRequestException(
      r.error.issues.map((i) => i.path.join(".") + ": " + i.message).join("; "),
    );
  return r.data;
}
export const id = z.string().regex(/^[a-f0-9]{24}$/i, "ID không hợp lệ");
export const text = (max = 200) => z.string().trim().min(1).max(max);
export const imagePath = z
  .string()
  .regex(
    /^\/(uploads|art)\/[a-zA-Z0-9_.-]+$/,
    "Ảnh phải được tải lên hệ thống",
  );
export const images = z.array(imagePath).max(8);
export const category = z.enum([
  "Chúc tụng",
  "Sinh hoạt",
  "Lịch sử & dân gian",
  "Tứ quý",
]);
export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (v) =>
      !Number.isNaN(Date.parse(v)) &&
      new Date(v).toISOString().slice(0, 10) === v,
    "Ngày không hợp lệ",
  );
