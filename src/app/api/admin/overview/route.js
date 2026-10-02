import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { getCurrentUser } from "@/lib/auth";
import { Order } from "@/lib/models/Order";
import { User } from "@/lib/models/User";
import { Job } from "@/lib/models/Job";

export async function GET() {
  await connectDB();
  await ensureSeeded();
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [orders, creatorCount, clientCount, openJobs, escrow] = await Promise.all([
    Order.find().sort({ createdAt: -1 }).limit(30).lean(),
    User.countDocuments({ role: "creator" }),
    User.countDocuments({ role: "client" }),
    Job.countDocuments({ status: "open" }),
    Order.aggregate([
      {
        $match: {
          status: { $in: ["funded", "in_progress", "delivered", "disputed"] },
        },
      },
      {
        $group: {
          _id: null,
          held: { $sum: "$amount" },
          fees: { $sum: "$platformFee" },
        },
      },
    ]),
  ]);

  return NextResponse.json({
    stats: {
      creatorCount,
      clientCount,
      openJobs,
      escrowHeld: escrow[0]?.held || 0,
      platformFeesPending: escrow[0]?.fees || 0,
    },
    orders,
  });
}
