import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { getCurrentUser } from "@/lib/auth";
import { Job } from "@/lib/models/Job";

export async function GET(request) {
  await connectDB();
  await ensureSeeded();

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const status = searchParams.get("status") || "open";
  const mine = searchParams.get("mine");

  const filter = {};
  if (status !== "all") filter.status = status;
  if (category) filter.category = category;

  if (mine === "true") {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role === "client") filter.client = user.id;
    if (user.role === "creator") filter.hiredCreator = user.id;
  }

  const jobs = await Job.find(filter)
    .populate("client", "name company avatar")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return NextResponse.json({ jobs });
}

export async function POST(request) {
  await connectDB();
  await ensureSeeded();
  const user = await getCurrentUser();

  if (!user || user.role !== "client") {
    return NextResponse.json(
      { error: "Only clients can post jobs" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const {
    title,
    description,
    category,
    budgetMin,
    budgetMax,
    deadline,
    skills,
  } = body;

  if (!title || !description || !budgetMin || !budgetMax) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const job = await Job.create({
    title,
    description,
    category: category || "other",
    budgetMin: Number(budgetMin),
    budgetMax: Number(budgetMax),
    deadline: deadline ? new Date(deadline) : undefined,
    skills: Array.isArray(skills) ? skills : [],
    client: user.id,
  });

  return NextResponse.json({ job }, { status: 201 });
}
