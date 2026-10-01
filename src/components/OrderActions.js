"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

export default function OrderActions({ orderId, status, role, amount, creatorPayout }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [deliveryUrl, setDeliveryUrl] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  async function run(action, extra = {}) {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      setMessage(data.message || "Updated");
      router.refresh();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-[var(--shadow-soft)]">
      <h2 className="font-display text-xl font-semibold">Actions</h2>

      {role === "client" && status === "pending_payment" ? (
        <div className="mt-4">
          <p className="text-sm text-[var(--ink-soft)]">
            Pay {formatCurrency(amount)} to Lumina. Funds stay in escrow until you approve the delivery.
          </p>
          <button
            className="btn btn-accent mt-4"
            disabled={loading}
            onClick={() => run("pay")}
          >
            {loading ? "Processing…" : `Pay ${formatCurrency(amount)} to Lumina`}
          </button>
          <p className="mt-3 text-xs text-[var(--ink-faint)]">
            Demo checkout — no real card charged. In production this connects to Stripe.
          </p>
        </div>
      ) : null}

      {role === "creator" && ["funded", "in_progress"].includes(status) ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-[var(--ink-soft)]">
            Submit your delivery. After client approval, Lumina releases {formatCurrency(creatorPayout)}.
          </p>
          <input
            className="field"
            placeholder="Delivery URL (Drive, Frame.io, YouTube unlisted…)"
            value={deliveryUrl}
            onChange={(e) => setDeliveryUrl(e.target.value)}
          />
          <textarea
            className="field min-h-[90px]"
            placeholder="Delivery notes"
            value={deliveryNote}
            onChange={(e) => setDeliveryNote(e.target.value)}
          />
          <button
            className="btn btn-primary"
            disabled={loading}
            onClick={() => run("deliver", { deliveryUrl, deliveryNote })}
          >
            {loading ? "Submitting…" : "Mark as delivered"}
          </button>
        </div>
      ) : null}

      {role === "client" && status === "delivered" ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-[var(--ink-soft)]">
            Approve to release {formatCurrency(creatorPayout)} to the creator. Lumina keeps the platform fee.
          </p>
          <div>
            <label className="field-label">Rating</label>
            <select
              className="field"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} stars
                </option>
              ))}
            </select>
          </div>
          <textarea
            className="field min-h-[80px]"
            placeholder="Optional review"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <button
              className="btn btn-accent"
              disabled={loading}
              onClick={() => run("approve", { rating, comment })}
            >
              {loading ? "Releasing…" : "Approve & release payout"}
            </button>
            <button
              className="btn btn-ghost"
              disabled={loading}
              onClick={() => run("dispute")}
            >
              Dispute
            </button>
          </div>
        </div>
      ) : null}

      {role === "client" && ["funded", "in_progress"].includes(status) ? (
        <div className="mt-4">
          <p className="text-sm text-[var(--ink-soft)]">
            Waiting on creator delivery. Funds are held by Lumina.
          </p>
          <button className="btn btn-ghost mt-3" disabled={loading} onClick={() => run("dispute")}>
            Open dispute
          </button>
        </div>
      ) : null}

      {status === "completed" ? (
        <p className="mt-4 text-sm text-[var(--success)]">
          Order complete. Creator payout released through Lumina.
        </p>
      ) : null}

      {status === "disputed" ? (
        <p className="mt-4 text-sm text-[var(--warning)]">
          Dispute open. Lumina admin will review escrow before release or refund.
        </p>
      ) : null}

      {!["pending_payment", "funded", "in_progress", "delivered", "completed", "disputed"].includes(
        status
      ) ||
      (role === "admin" && !["pending_payment"].includes(status)) ? (
        role === "admin" ? (
          <p className="mt-4 text-sm text-[var(--ink-soft)]">Admin view — monitor escrow status above.</p>
        ) : null
      ) : null}

      {message ? <p className="mt-4 text-sm text-[var(--ink-soft)]">{message}</p> : null}
    </div>
  );
}
