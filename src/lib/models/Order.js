import mongoose, { Schema } from "mongoose";

/**
 * Escrow flow:
 * pending_payment → funded (client paid platform) → in_progress →
 * delivered → completed (funds released to creator) | disputed | refunded
 */
const OrderSchema = new Schema(
  {
    job: { type: Schema.Types.ObjectId, ref: "Job" },
    proposal: { type: Schema.Types.ObjectId, ref: "Proposal" },
    client: { type: Schema.Types.ObjectId, ref: "User", required: true },
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    amount: { type: Number, required: true },
    platformFeePercent: { type: Number, default: 15 },
    platformFee: { type: Number, required: true },
    creatorPayout: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "pending_payment",
        "funded",
        "in_progress",
        "delivered",
        "completed",
        "disputed",
        "refunded",
        "cancelled",
      ],
      default: "pending_payment",
    },
    deliveryUrl: { type: String, default: "" },
    deliveryNote: { type: String, default: "" },
    paidAt: { type: Date },
    deliveredAt: { type: Date },
    completedAt: { type: Date },
    paymentRef: { type: String, default: "" },
  },
  { timestamps: true }
);

OrderSchema.index({ client: 1, createdAt: -1 });
OrderSchema.index({ creator: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });

export const Order =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);
