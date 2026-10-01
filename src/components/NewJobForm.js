"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES } from "@/lib/utils";

export default function NewJobForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "product-ads",
    budgetMin: "",
    budgetMax: "",
    deadline: "",
    skills: "",
  });

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const me = await fetch("/api/auth/me").then((r) => r.json());
      if (!me.user) {
        router.push("/auth/login?next=/jobs/new");
        return;
      }
      if (me.user.role !== "client") {
        setError("Only client accounts can post jobs.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          budgetMin: Number(form.budgetMin),
          budgetMax: Number(form.budgetMax),
          skills: form.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create job");
      router.push(`/jobs/${data.job._id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      <div>
        <label className="field-label">Title</label>
        <input
          className="field"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. 30s AI product film for earbuds"
        />
      </div>
      <div>
        <label className="field-label">Description</label>
        <textarea
          className="field min-h-[160px]"
          required
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label">Category</label>
          <select
            className="field"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">Deadline</label>
          <input
            type="date"
            className="field"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label">Budget min (USD)</label>
          <input
            type="number"
            min="50"
            className="field"
            required
            value={form.budgetMin}
            onChange={(e) => setForm({ ...form, budgetMin: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Budget max (USD)</label>
          <input
            type="number"
            min="50"
            className="field"
            required
            value={form.budgetMax}
            onChange={(e) => setForm({ ...form, budgetMax: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className="field-label">Skills (comma separated)</label>
        <input
          className="field"
          value={form.skills}
          onChange={(e) => setForm({ ...form, skills: e.target.value })}
          placeholder="Runway, Product Ads, Color Grade"
        />
      </div>
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      <button className="btn btn-primary" disabled={loading}>
        {loading ? "Publishing…" : "Publish job"}
      </button>
    </form>
  );
}
