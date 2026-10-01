import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { User } from "@/lib/models/User";

export async function GET(request) {
  await connectDB();
  await ensureSeeded();

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const skill = searchParams.get("skill");
  const featured = searchParams.get("featured");

  const filter = { role: "creator" };
  if (featured === "true") filter.featured = true;
  if (skill) filter.skills = skill;
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { headline: { $regex: q, $options: "i" } },
      { skills: { $regex: q, $options: "i" } },
    ];
  }

  const creators = await User.find(filter)
    .select("-passwordHash")
    .sort({ featured: -1, rating: -1, completedOrders: -1 })
    .limit(48)
    .lean();

  return NextResponse.json({ creators });
}
