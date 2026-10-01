import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { getCurrentUser } from "@/lib/auth";
import { Job } from "@/lib/models/Job";
import { Proposal } from "@/lib/models/Proposal";

export async function POST(request) {
  await connectDB();
  await ensureSeeded();
  const user = await getCurrentUser();

  if (!user || user.role !== "creator") {
    return NextResponse.json(
      { error: "Only creators can submit proposals" },
      { status: 403 }
    );
  }

  const { jobId, coverLetter, bidAmount, deliveryDays } = await request.json();
  if (!jobId || !coverLetter || !bidAmount || !deliveryDays) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const job = await Job.findById(jobId);
  if (!job || job.status !== "open") {
    return NextResponse.json({ error: "Job is not open" }, { status: 400 });
  }

  const existing = await Proposal.findOne({ job: jobId, creator: user.id });
  if (existing) {
    return NextResponse.json(
      { error: "You already proposed on this job" },
      { status: 409 }
    );
  }

  const proposal = await Proposal.create({
    job: jobId,
    creator: user.id,
    coverLetter,
    bidAmount: Number(bidAmount),
    deliveryDays: Number(deliveryDays),
  });

  job.proposalCount += 1;
  await job.save();

  return NextResponse.json({ proposal }, { status: 201 });
}
