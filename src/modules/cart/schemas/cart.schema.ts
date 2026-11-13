import { Schema } from "mongoose";

export const CartModelName = "Cart";

export const CartItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, default: 10 },
    note: { type: String, default: "", maxLength: 500 },
    selected: { type: Boolean, default: true },
  },
  { _id: true, timestamps: true },
);

export const CartSchema = new Schema(
  {
    buyerId: { type: String, required: true, unique: true, index: true },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true, strict: true },
);
