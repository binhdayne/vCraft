import { Schema } from "mongoose";
export const AccountModelName = "Account";
export const AccountSchema = new Schema(
  {
    name: String,
    email: { type: String, unique: true, index: true },
    passwordHash: { type: String, select: false },
    role: { type: String, enum: ["buyer", "artisan", "admin"] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, strict: true },
);
