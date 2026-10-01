import mongoose, { Schema } from "mongoose";

const ProposalSchema = new Schema(
  {
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    coverLetter: { type: String, required: true },
    bidAmount: { type: Number, required: true },
    deliveryDays: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "withdrawn"],
      default: "pending",
    },
  },
  { timestamps: true }
);

ProposalSchema.index({ job: 1, creator: 1 }, { unique: true });

export const Proposal =
  mongoose.models.Proposal || mongoose.model("Proposal", ProposalSchema);
