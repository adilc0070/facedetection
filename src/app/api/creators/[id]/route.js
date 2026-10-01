import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { User } from "@/lib/models/User";
import { Review } from "@/lib/models/Review";

export async function GET(_request, { params }) {
  await connectDB();
  await ensureSeeded();
  const { id } = await params;

  const creator = await User.findOne({ _id: id, role: "creator" })
    .select("-passwordHash")
    .lean();

  if (!creator) {
    return NextResponse.json({ error: "Creator not found" }, { status: 404 });
  }

  const reviews = await Review.find({ creator: id })
    .populate("client", "name avatar company")
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return NextResponse.json({ creator, reviews });
}
