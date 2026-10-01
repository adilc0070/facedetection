"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

export default function HireButton({ creatorId, creatorName, rate }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: `Project with ${creatorName}`,
    description: "",
    amount: rate || 500,
  });

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const me = await fetch("/api/auth/me").then((r) => r.json());
      if (!me.user) {
        router.push("/auth/login?next=/creators/" + creatorId);
        return;
      }
      if (me.user.role !== "client") {
        setError("Switch to a client account to hire.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId,
          title: form.title,
          description: form.description,
          amount: Number(form.amount),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create order");
      router.push(`/dashboard/orders/${data.order._id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <>
      <button className="btn btn-primary w-full" onClick={() => setOpen(true)}>
        Hire {creatorName.split(" ")[0]}
      </button>
      {open ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <form
            onSubmit={submit}
            className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl"
          >
            <h3 className="font-display text-2xl font-semibold">Start a project</h3>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Payment goes to Lumina escrow. Suggested start: {formatCurrency(rate || 0)}.
            </p>
            <div className="mt-5 space-y-4">
              <div>
                <label className="field-label">Project title</label>
                <input
                  className="field"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="field-label">Brief</label>
                <textarea
                  className="field min-h-[100px]"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <label className="field-label">Budget (USD)</label>
                <input
                  type="number"
                  min="50"
                  className="field"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>
            </div>
            {error ? <p className="mt-3 text-sm text-[var(--danger)]">{error}</p> : null}
            <div className="mt-6 flex gap-2">
              <button type="button" className="btn btn-ghost flex-1" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-accent flex-1" disabled={loading}>
                {loading ? "Creating…" : "Continue to pay"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
