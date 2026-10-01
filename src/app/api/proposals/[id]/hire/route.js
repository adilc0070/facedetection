import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { getCurrentUser } from "@/lib/auth";
import { Job } from "@/lib/models/Job";
import { Proposal } from "@/lib/models/Proposal";
import { Order } from "@/lib/models/Order";
import { calcFees } from "@/lib/utils";

export async function POST(request, { params }) {
  await connectDB();
  await ensureSeeded();
  const user = await getCurrentUser();
  const { id } = await params;

  if (!user || user.role !== "client") {
    return NextResponse.json({ error: "Only clients can hire" }, { status: 403 });
  }

  const proposal = await Proposal.findById(id).populate("job");
  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  const job = await Job.findById(proposal.job._id || proposal.job);
  if (!job || job.client.toString() !== user.id) {
    return NextResponse.json({ error: "Not your job" }, { status: 403 });
  }
  if (job.status !== "open") {
    return NextResponse.json({ error: "Job is not open" }, { status: 400 });
  }

  const fees = calcFees(proposal.bidAmount);
  const order = await Order.create({
    job: job._id,
    proposal: proposal._id,
    client: user.id,
    creator: proposal.creator,
    title: job.title,
    description: job.description,
    amount: proposal.bidAmount,
    ...fees,
    status: "pending_payment",
  });

  proposal.status = "accepted";
  await proposal.save();

  await Proposal.updateMany(
    { job: job._id, _id: { $ne: proposal._id }, status: "pending" },
    { $set: { status: "rejected" } }
  );

  job.status = "in_progress";
  job.hiredCreator = proposal.creator;
  await job.save();

  return NextResponse.json({ order });
}
