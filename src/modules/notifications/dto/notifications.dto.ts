import { z } from "zod";

export const notificationKey = z.string().regex(
  /^(order:[a-f0-9]{24}:\d+|announcement:[a-f0-9]{24})$/i,
  "Thông báo không hợp lệ",
);
export const notificationsQuery = z.object({
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  unreadOnly: z.enum(["true", "false"]).default("false"),
}).strict();
