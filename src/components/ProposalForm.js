"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProposalForm({ jobId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    coverLetter: "",
    bidAmount: "",
    deliveryDays: "7",
  });

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          coverLetter: form.coverLetter,
          bidAmount: Number(form.bidAmount),
          deliveryDays: Number(form.deliveryDays),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      router.refresh();
      setForm({ coverLetter: "", bidAmount: "", deliveryDays: "7" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-4 rounded-[22px] border border-[var(--line)] bg-white/90 p-5">
      <div>
        <label className="field-label">Cover letter</label>
        <textarea
          className="field min-h-[120px]"
          required
          value={form.coverLetter}
          onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label">Your bid (USD)</label>
          <input
            type="number"
            min="50"
            className="field"
            required
            value={form.bidAmount}
            onChange={(e) => setForm({ ...form, bidAmount: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Delivery days</label>
          <input
            type="number"
            min="1"
            className="field"
            required
            value={form.deliveryDays}
            onChange={(e) => setForm({ ...form, deliveryDays: e.target.value })}
          />
        </div>
      </div>
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Submitting…" : "Submit proposal"}
      </button>
    </form>
  );
}
