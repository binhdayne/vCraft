import { Schema } from "mongoose";
export const StudioModelName = "Studio";
export const StudioSchema = new Schema(
  {
    ownerId: { type: String, unique: true, index: true },
    name: String,
    story: String,
    address: String,
    latitude: Number,
    longitude: Number,
    openForVisits: Boolean,
    visitingHours: String,
    categories: [String],
    images: [String],
    certificates: [String],
    approved: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, strict: true },
);
