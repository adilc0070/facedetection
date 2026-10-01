import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { getCurrentUser } from "@/lib/auth";
import { User } from "@/lib/models/User";

export async function PATCH(request) {
  await connectDB();
  await ensureSeeded();
  const current = await getCurrentUser();
  if (!current) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const allowed = [
    "name",
    "headline",
    "bio",
    "location",
    "skills",
    "hourlyRate",
    "startingPrice",
    "avatar",
    "company",
    "portfolio",
    "responseTime",
  ];

  const updates = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  const user = await User.findByIdAndUpdate(current.id, updates, {
    new: true,
  }).select("-passwordHash");

  return NextResponse.json({ user });
}
