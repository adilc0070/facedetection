import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { getCurrentUser } from "@/lib/auth";
import { Order } from "@/lib/models/Order";
import { User } from "@/lib/models/User";
import { Job } from "@/lib/models/Job";
import { Review } from "@/lib/models/Review";
import { randomUUID } from "crypto";

async function getAuthorizedOrder(id, user) {
  const order = await Order.findById(id);
  if (!order) return { error: "Order not found", status: 404 };
  const isParty =
    order.client.toString() === user.id ||
    order.creator.toString() === user.id ||
    user.role === "admin";
  if (!isParty) return { error: "Forbidden", status: 403 };
  return { order };
}

export async function GET(_request, { params }) {
  await connectDB();
  await ensureSeeded();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const result = await getAuthorizedOrder(id, user);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const order = await Order.findById(id)
    .populate("client", "name company avatar email")
    .populate("creator", "name avatar headline email")
    .populate("job", "title category")
    .lean();

  return NextResponse.json({ order });
}

export async function PATCH(request, { params }) {
  await connectDB();
  await ensureSeeded();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { action } = body;

  const result = await getAuthorizedOrder(id, user);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  const { order } = result;

  // Client pays platform — funds enter escrow
  if (action === "pay") {
    if (user.role !== "client" || order.client.toString() !== user.id) {
      return NextResponse.json({ error: "Only the client can pay" }, { status: 403 });
    }
    if (order.status !== "pending_payment") {
      return NextResponse.json({ error: "Order cannot be paid" }, { status: 400 });
    }
    order.status = "funded";
    order.paidAt = new Date();
    order.paymentRef = `lumina_${randomUUID().slice(0, 8)}`;
    await order.save();
    order.status = "in_progress";
    await order.save();
    return NextResponse.json({
      order,
      message: "Payment received by Lumina. Funds held in escrow.",
    });
  }

  // Creator delivers work
  if (action === "deliver") {
    if (user.role !== "creator" || order.creator.toString() !== user.id) {
      return NextResponse.json({ error: "Only the creator can deliver" }, { status: 403 });
    }
    if (!["funded", "in_progress"].includes(order.status)) {
      return NextResponse.json({ error: "Order not in progress" }, { status: 400 });
    }
    order.deliveryUrl = body.deliveryUrl || "";
    order.deliveryNote = body.deliveryNote || "";
    order.deliveredAt = new Date();
    order.status = "delivered";
    await order.save();
    return NextResponse.json({ order });
  }

  // Client approves — platform releases payout to creator
  if (action === "approve") {
    if (user.role !== "client" || order.client.toString() !== user.id) {
      return NextResponse.json({ error: "Only the client can approve" }, { status: 403 });
    }
    if (order.status !== "delivered") {
      return NextResponse.json({ error: "Order not delivered yet" }, { status: 400 });
    }
    order.status = "completed";
    order.completedAt = new Date();
    await order.save();

    await User.findByIdAndUpdate(order.creator, {
      $inc: {
        earningsBalance: order.creatorPayout,
        completedOrders: 1,
      },
    });

    if (order.job) {
      await Job.findByIdAndUpdate(order.job, { status: "completed" });
    }

    if (body.rating) {
      await Review.findOneAndUpdate(
        { order: order._id },
        {
          order: order._id,
          client: order.client,
          creator: order.creator,
          rating: Number(body.rating),
          comment: body.comment || "",
        },
        { upsert: true, new: true }
      );

      const stats = await Review.aggregate([
        { $match: { creator: order.creator } },
        {
          $group: {
            _id: "$creator",
            avg: { $avg: "$rating" },
            count: { $sum: 1 },
          },
        },
      ]);
      if (stats[0]) {
        await User.findByIdAndUpdate(order.creator, {
          rating: Math.round(stats[0].avg * 10) / 10,
          reviewCount: stats[0].count,
        });
      }
    }

    return NextResponse.json({
      order,
      message: `$${order.creatorPayout} released to creator. Platform fee $${order.platformFee}.`,
    });
  }

  // Client disputes / requests refund path
  if (action === "dispute") {
    if (user.role !== "client" || order.client.toString() !== user.id) {
      return NextResponse.json({ error: "Only the client can dispute" }, { status: 403 });
    }
    if (!["in_progress", "delivered", "funded"].includes(order.status)) {
      return NextResponse.json({ error: "Cannot dispute this order" }, { status: 400 });
    }
    order.status = "disputed";
    await order.save();
    return NextResponse.json({ order });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
