import { Schema } from "mongoose";
export const BulletinModelName = "Bulletin";
export const BulletinSchema = new Schema(
  {
    title: String,
    body: String,
    category: String,
    image: String,
    published: Boolean,
    authorId: String,
  },
  { timestamps: true, strict: true },
);
