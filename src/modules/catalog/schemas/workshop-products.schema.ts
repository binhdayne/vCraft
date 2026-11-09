import { Schema } from "mongoose";

export const WorkshopProductModelName = "WorkshopProduct";

export const WorkshopProductSchema = new Schema(
  {
    productId: { type: String, required: true, index: true },
    workshopId: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    images: { type: [String], default: [] },
    inStock: { type: Boolean, default: true },
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, strict: true },
);

WorkshopProductSchema.index({ productId: 1, workshopId: 1 }, { unique: true });
