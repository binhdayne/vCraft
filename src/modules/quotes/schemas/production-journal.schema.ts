import { Schema } from "mongoose";

export const ProductionJournalSchema = new Schema({
  productId: { type: String, default: "" },
  story: { type: String, default: "" },
  workshopStory: { type: String, default: "" },
  coverImages: [String],
  events: { type: [new Schema({
    title: { type: String, default: "" }, date: { type: String, default: "" },
    note: { type: String, default: "" }, images: [String],
  }, { _id: false })], default: [] },
  savedAt: Date,
}, { _id: false, strict: true });
