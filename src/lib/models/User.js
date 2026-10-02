import mongoose, { Schema } from "mongoose";

const PortfolioItemSchema = new Schema(
  {
    title: String,
    thumbnail: String,
    url: String,
    type: { type: String, default: "video" },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["creator", "client", "admin"],
      required: true,
    },
    avatar: { type: String, default: "" },
    headline: { type: String, default: "" },
    bio: { type: String, default: "" },
    location: { type: String, default: "" },
    skills: [{ type: String }],
    hourlyRate: { type: Number, default: 0 },
    startingPrice: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    completedOrders: { type: Number, default: 0 },
    responseTime: { type: String, default: "Within 24 hours" },
    portfolio: [PortfolioItemSchema],
    featured: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    courseGraduate: { type: Boolean, default: false },
    earningsBalance: { type: Number, default: 0 },
    company: { type: String, default: "" },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1, featured: -1, rating: -1 });
UserSchema.index({ skills: 1 });

export const User =
  mongoose.models.User || mongoose.model("User", UserSchema);
