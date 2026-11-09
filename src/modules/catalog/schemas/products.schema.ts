import { Schema } from "mongoose";
export const ArtworkModelName = "Artwork";
export const ArtworkSchema = new Schema(
  {
    workshopId: { type: String, index: true, default: null },
    name: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["general", "custom"],
      default: "general",
      index: true,
    },
    story: { type: String, default: "" },
    description: String,
    price: { type: Number, default: null },
    dimensions: String,
    material: String,
    images: [String],
    published: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, strict: true },
);
