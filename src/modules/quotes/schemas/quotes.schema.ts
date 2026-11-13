import { Schema } from "mongoose";

export const QuotationModelName = "Quotation";

export const LotItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    artworkName: { type: String, required: true },
    image: { type: String, default: "" },
    category: { type: String, required: true },
    dimensions: { type: String, default: "26 × 37 cm" },
    type: {
      type: String,
      enum: ["general", "custom"],
      default: "general",
    },
    workshopId: { type: String, default: null },
    workshopName: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    note: { type: String, default: "", maxLength: 500 },
  },
  { _id: false },
);

export const CustomerInfoSchema = new Schema(
  {
    fullName: { type: String, default: "" },
    phoneNumber: { type: String, default: "" },
    shippingAddress: { type: String, default: "" },
    packagingNote: { type: String, default: "" },
  },
  { _id: false },
);

export const QuotationSchema = new Schema(
  {
    buyerId: { type: String, index: true },
    title: String,
    category: String,
    quantity: Number,
    deadline: String,
    description: String,
    targetType: {
      type: String,
      enum: ["direct", "bidding"],
      default: "bidding",
      index: true,
    },
    targetWorkshopId: { type: String, default: null, index: true },
    items: { type: [LotItemSchema], default: [] },
    customerInfo: { type: CustomerInfoSchema, default: () => ({}) },
    acceptedWorkshopId: { type: String, default: null, index: true },
    status: { type: String, index: true },
    recipients: [String],
    version: { type: Number, default: 0 },
    bids: [
      {
        workshopId: String,
        artisanId: String,
        unitPrice: Number,
        quantity: Number,
        days: Number,
        note: String,
      },
    ],
    allocations: [
      {
        workshopId: String,
        quantity: Number,
        unitPrice: Number,
        status: String,
      },
    ],
    proposedAllocations: [{ workshopId: String, quantity: Number }],
    history: [{ status: String, at: Date, actor: String, note: String }],
  },
  { timestamps: true, strict: true },
);
