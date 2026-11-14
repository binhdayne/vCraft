import { Schema } from "mongoose";
export const BatchModelName = "Batch";
export const BatchSchema = new Schema(
  {
    workshopId: String,
    quoteId: { type: String, index: true },
    productId: { type: String, index: true },
    productName: String,
    workshopName: String,
    workshopStory: String,
    coverImages: [String],
    code: { type: String, unique: true },
    quantity: Number,
    story: String,
    published: Boolean,
    events: [{ title: String, date: String, note: String, images: [String] }],
  },
  { timestamps: true, strict: true },
);
