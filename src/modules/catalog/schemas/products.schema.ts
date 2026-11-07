import { Schema } from "mongoose";
export const ArtworkModelName = "Artwork";
export const ArtworkSchema = new Schema(
  {
    workshopId: { type: String, index: true },
    name: String,
    category: { type: String, index: true },
    description: String,
    price: Number,
    dimensions: String,
    material: String,
    images: [String],
    published: { type: Boolean, default: false },
  },
  { timestamps: true, strict: true },
);
