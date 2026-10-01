import mongoose, { Schema } from "mongoose";

const JobSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "product-ads",
        "social-shorts",
        "explainers",
        "ugc",
        "brand-films",
        "motion-graphics",
        "other",
      ],
      default: "other",
    },
    budgetMin: { type: Number, required: true },
    budgetMax: { type: Number, required: true },
    deadline: { type: Date },
    skills: [{ type: String }],
    client: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["open", "in_progress", "completed", "cancelled"],
      default: "open",
    },
    proposalCount: { type: Number, default: 0 },
    hiredCreator: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

JobSchema.index({ status: 1, createdAt: -1 });
JobSchema.index({ category: 1 });

export const Job = mongoose.models.Job || mongoose.model("Job", JobSchema);
