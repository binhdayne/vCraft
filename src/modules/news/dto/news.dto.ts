import { z } from "zod";
import { imagePath, text } from "../../../common/validation";
export const newsInput = z
  .object({
    title: text(200),
    body: text(15000),
    category: z.enum(["Thông báo", "Làng nghề", "Sự kiện"]),
    image: imagePath.or(z.literal("")),
    published: z.boolean(),
  })
  .strict();

export type NewsDto = z.output<typeof newsInput>;
