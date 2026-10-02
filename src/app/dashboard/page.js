import Link from "next/link";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { getCurrentUser } from "@/lib/auth";
import { Order } from "@/lib/models/Order";
import { Job } from "@/lib/models/Job";
import { formatCurrency, formatDate } from "@/lib/utils";
import StatusPill from "@/components/StatusPill";
import ProfileEditor from "@/components/ProfileEditor";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await connectDB();
  await ensureSeeded();
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/dashboard");

  const orderFilter =
    user.role === "admin"
      ? {}
      : user.role === "client"
        ? { client: user.id }
        : { creator: user.id };

  const [orders, jobs] = await Promise.all([
    Order.find(orderFilter)
      .populate("client", "name company")
      .populate("creator", "name")
      .sort({ createdAt: -1 })
      .limit(12)
      .lean(),
    user.role === "client"
      ? Job.find({ client: user.id }).sort({ createdAt: -1 }).limit(8).lean()
      : Promise.resolve([]),
  ]);

  const escrowHeld = orders
    .filter((o) => ["funded", "in_progress", "delivered", "disputed"].includes(o.status))
    .reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="section-pad pt-10">
      <div className="container-x">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--ink-faint)]">
              {user.role}
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold">Hi, {user.name.split(" ")[0]}</h1>
            <p className="mt-2 text-[var(--ink-soft)]">
              {user.role === "creator"
                ? "Track proposals, deliveries, and payouts released by Lumina."
                : user.role === "client"
                  ? "Manage briefs, escrow payments, and creator deliveries."
                  : "Platform overview and escrow monitoring."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.role === "client" ? (
              <Link href="/jobs/new" className="btn btn-primary">
                Post a job
              </Link>
            ) : null}
            {user.role === "creator" ? (
              <Link href="/jobs" className="btn btn-primary">
                Find work
              </Link>
            ) : null}
            <Link href="/creators" className="btn btn-ghost">
              Browse creators
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[24px] border border-[var(--line)] bg-white/90 p-5">
            <p className="text-sm text-[var(--ink-faint)]">Active / recent orders</p>
            <p className="mt-2 font-display text-3xl font-semibold">{orders.length}</p>
          </div>
          <div className="rounded-[24px] border border-[var(--line)] bg-white/90 p-5">
            <p className="text-sm text-[var(--ink-faint)]">Escrow in flight</p>
            <p className="mt-2 font-display text-3xl font-semibold">{formatCurrency(escrowHeld)}</p>
          </div>
          <div className="rounded-[24px] border border-[var(--line)] bg-white/90 p-5">
            <p className="text-sm text-[var(--ink-faint)]">
              {user.role === "creator" ? "Available earnings" : "Platform fee"}
            </p>
            <p className="mt-2 font-display text-3xl font-semibold">
              {user.role === "creator"
                ? formatCurrency(user.earningsBalance || 0)
                : `${process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENT || 15}%`}
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_0.9fr]">
          <div>
            <h2 className="font-display text-2xl font-semibold">Orders</h2>
            <div className="mt-5 space-y-3">
              {orders.length === 0 ? (
                <p className="text-sm text-[var(--ink-soft)]">No orders yet.</p>
              ) : (
                orders.map((order) => (
                  <Link
                    key={String(order._id)}
                    href={`/dashboard/orders/${order._id}`}
                    className="flex flex-col gap-3 rounded-[20px] border border-[var(--line)] bg-white/90 p-5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold">{order.title}</p>
                      <p className="mt-1 text-sm text-[var(--ink-soft)]">
                        {user.role === "client"
                          ? `Creator: ${order.creator?.name}`
                          : `Client: ${order.client?.name}`}
                        {" · "}
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusPill status={order.status} />
                      <span className="font-semibold">{formatCurrency(order.amount)}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {user.role === "client" ? (
              <div className="mt-10">
                <h2 className="font-display text-2xl font-semibold">Your jobs</h2>
                <div className="mt-5 space-y-3">
                  {jobs.map((job) => (
                    <Link
                      key={String(job._id)}
                      href={`/jobs/${job._id}`}
                      className="flex items-center justify-between rounded-[20px] border border-[var(--line)] bg-white/90 p-5"
                    >
                      <div>
                        <p className="font-semibold">{job.title}</p>
                        <p className="text-sm text-[var(--ink-soft)]">
                          {job.proposalCount} proposals · {formatDate(job.createdAt)}
                        </p>
                      </div>
                      <StatusPill status={job.status} />
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <ProfileEditor user={JSON.parse(JSON.stringify(user))} />
        </div>
      </div>
    </div>
  );
}
