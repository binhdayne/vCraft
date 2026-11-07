import { Schema } from "mongoose";
export const BatchModelName = "Batch";
export const BatchSchema = new Schema(
  {
    workshopId: String,
    productId: { type: String, index: true },
    code: { type: String, unique: true },
    quantity: Number,
    story: String,
    published: Boolean,
    events: [{ title: String, date: String, note: String, images: [String] }],
  },
  { timestamps: true, strict: true },
);
