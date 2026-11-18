import { Schema } from "mongoose";

export const NotificationReadModelName = "NotificationRead";
export const NotificationReadSchema = new Schema({
  recipientId: { type: String, required: true },
  key: { type: String, required: true },
  readAt: { type: Date, required: true },
}, { strict: true });
NotificationReadSchema.index({ recipientId: 1, key: 1 }, { unique: true });
