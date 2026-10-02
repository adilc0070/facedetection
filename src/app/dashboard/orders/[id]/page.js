import { notFound, redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { getCurrentUser } from "@/lib/auth";
import { Order } from "@/lib/models/Order";
import { formatCurrency, formatDate } from "@/lib/utils";
import StatusPill from "@/components/StatusPill";
import OrderActions from "@/components/OrderActions";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }) {
  const { id } = await params;
  await connectDB();
  await ensureSeeded();
  const user = await getCurrentUser();
  if (!user) redirect(`/auth/login?next=/dashboard/orders/${id}`);

  const order = await Order.findById(id)
    .populate("client", "name company email avatar")
    .populate("creator", "name email avatar headline")
    .populate("job", "title category")
    .lean();

  if (!order) notFound();

  const isClient = String(order.client._id) === user.id;
  const isCreator = String(order.creator._id) === user.id;
  const isAdmin = user.role === "admin";
  if (!isClient && !isCreator && !isAdmin) redirect("/dashboard");

  const steps = [
    { key: "pending_payment", label: "Pay Lumina" },
    { key: "in_progress", label: "In escrow" },
    { key: "delivered", label: "Delivered" },
    { key: "completed", label: "Paid out" },
  ];

  const stepIndex =
    order.status === "pending_payment"
      ? 0
      : ["funded", "in_progress", "disputed"].includes(order.status)
        ? 1
        : order.status === "delivered"
          ? 2
          : order.status === "completed"
            ? 3
            : 1;

  return (
    <div className="section-pad pt-10">
      <div className="container-x max-w-4xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--ink-faint)]">Order</p>
            <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">{order.title}</h1>
            <div className="mt-3">
              <StatusPill status={order.status} />
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-[var(--ink-faint)]">Project total</p>
            <p className="font-display text-3xl font-semibold">{formatCurrency(order.amount)}</p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {steps.map((step, i) => (
            <div
              key={step.key}
              className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
                i <= stepIndex
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-[var(--line)] bg-white/70 text-[var(--ink-faint)]"
              }`}
            >
              <span className="block text-xs opacity-70">Step {i + 1}</span>
              {step.label}
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-[24px] border border-[var(--line)] bg-white/90 p-6">
            <h2 className="font-display text-xl font-semibold">Escrow breakdown</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--ink-soft)]">Client pays Lumina</dt>
                <dd className="font-semibold">{formatCurrency(order.amount)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--ink-soft)]">
                  Platform fee ({order.platformFeePercent}%)
                </dt>
                <dd className="font-semibold">−{formatCurrency(order.platformFee)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-[var(--line)] pt-3">
                <dt className="text-[var(--ink-soft)]">Creator payout</dt>
                <dd className="font-semibold text-[var(--success)]">
                  {formatCurrency(order.creatorPayout)}
                </dd>
              </div>
            </dl>
            {order.paymentRef ? (
              <p className="mt-5 text-xs text-[var(--ink-faint)]">Payment ref: {order.paymentRef}</p>
            ) : null}
          </div>

          <div className="rounded-[24px] border border-[var(--line)] bg-white/90 p-6">
            <h2 className="font-display text-xl font-semibold">Parties</h2>
            <div className="mt-5 space-y-4 text-sm">
              <div>
                <p className="text-[var(--ink-faint)]">Client</p>
                <p className="font-semibold">{order.client.name}</p>
                <p className="text-[var(--ink-soft)]">{order.client.company || order.client.email}</p>
              </div>
              <div>
                <p className="text-[var(--ink-faint)]">Creator</p>
                <p className="font-semibold">{order.creator.name}</p>
                <p className="text-[var(--ink-soft)]">{order.creator.headline || order.creator.email}</p>
              </div>
              <div>
                <p className="text-[var(--ink-faint)]">Timeline</p>
                <p className="text-[var(--ink-soft)]">Created {formatDate(order.createdAt)}</p>
                {order.paidAt ? <p className="text-[var(--ink-soft)]">Paid {formatDate(order.paidAt)}</p> : null}
                {order.deliveredAt ? (
                  <p className="text-[var(--ink-soft)]">Delivered {formatDate(order.deliveredAt)}</p>
                ) : null}
                {order.completedAt ? (
                  <p className="text-[var(--ink-soft)]">Completed {formatDate(order.completedAt)}</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {order.description ? (
          <div className="mt-6 rounded-[24px] border border-[var(--line)] bg-white/90 p-6">
            <h2 className="font-display text-xl font-semibold">Brief</h2>
            <p className="mt-3 whitespace-pre-wrap text-[var(--ink-soft)]">{order.description}</p>
          </div>
        ) : null}

        {(order.deliveryUrl || order.deliveryNote) && (
          <div className="mt-6 rounded-[24px] border border-[var(--line)] bg-white/90 p-6">
            <h2 className="font-display text-xl font-semibold">Delivery</h2>
            {order.deliveryUrl ? (
              <a
                href={order.deliveryUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-[var(--accent)] underline"
              >
                {order.deliveryUrl}
              </a>
            ) : null}
            {order.deliveryNote ? (
              <p className="mt-3 text-[var(--ink-soft)]">{order.deliveryNote}</p>
            ) : null}
          </div>
        )}

        <div className="mt-8">
          <OrderActions
            orderId={String(order._id)}
            status={order.status}
            role={isAdmin ? "admin" : isClient ? "client" : "creator"}
            amount={order.amount}
            creatorPayout={order.creatorPayout}
          />
        </div>
      </div>
    </div>
  );
}
