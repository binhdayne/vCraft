import { Schema } from "mongoose";
export const QuotationModelName = "Quotation";
export const QuotationSchema = new Schema(
  {
    buyerId: { type: String, index: true },
    title: String,
    category: String,
    quantity: Number,
    deadline: String,
    description: String,
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
