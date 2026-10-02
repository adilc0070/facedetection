import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { getCurrentUser } from "@/lib/auth";
import { Order } from "@/lib/models/Order";

export async function GET(request) {
  await connectDB();
  await ensureSeeded();
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const filter =
    user.role === "admin"
      ? {}
      : user.role === "client"
        ? { client: user.id }
        : { creator: user.id };

  if (status) filter.status = status;

  const orders = await Order.find(filter)
    .populate("client", "name company avatar")
    .populate("creator", "name avatar headline")
    .populate("job", "title category")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ orders });
}

export async function POST(request) {
  await connectDB();
  await ensureSeeded();
  const user = await getCurrentUser();
  if (!user || user.role !== "client") {
    return NextResponse.json({ error: "Only clients can create direct hires" }, { status: 403 });
  }

  const { creatorId, title, description, amount } = await request.json();
  if (!creatorId || !title || !amount) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { calcFees } = await import("@/lib/utils");
  const fees = calcFees(Number(amount));

  const order = await Order.create({
    client: user.id,
    creator: creatorId,
    title,
    description: description || "",
    amount: Number(amount),
    ...fees,
    status: "pending_payment",
  });

  return NextResponse.json({ order }, { status: 201 });
}
