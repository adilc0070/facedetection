import mongoose, { Schema } from "mongoose";

const ReviewSchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    client: { type: Schema.Types.ObjectId, ref: "User", required: true },
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Review =
  mongoose.models.Review || mongoose.model("Review", ReviewSchema);
