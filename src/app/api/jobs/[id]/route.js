import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { Job } from "@/lib/models/Job";
import { Proposal } from "@/lib/models/Proposal";

export async function GET(_request, { params }) {
  await connectDB();
  await ensureSeeded();
  const { id } = await params;

  const job = await Job.findById(id)
    .populate("client", "name company avatar location")
    .populate("hiredCreator", "name avatar headline")
    .lean();

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const proposals = await Proposal.find({ job: id })
    .populate("creator", "name avatar headline rating reviewCount startingPrice courseGraduate verified")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ job, proposals });
}
