import { Schema } from "mongoose";

export const MediaAssetModelName = "MediaAsset";
export const MediaAssetSchema = new Schema(
  {
    url: { type: String, required: true, unique: true },
    ownerId: { type: String, required: true, index: true },
  },
  { timestamps: true, strict: true },
);
