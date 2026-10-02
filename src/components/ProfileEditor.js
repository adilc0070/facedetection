"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProfileEditor({ user }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: user.name || "",
    headline: user.headline || "",
    bio: user.bio || "",
    location: user.location || "",
    company: user.company || "",
    skills: (user.skills || []).join(", "),
    startingPrice: user.startingPrice || 0,
    hourlyRate: user.hourlyRate || 0,
  });

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        name: form.name,
        headline: form.headline,
        bio: form.bio,
        location: form.location,
        company: form.company,
      };
      if (user.role === "creator") {
        payload.skills = form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        payload.startingPrice = Number(form.startingPrice);
        payload.hourlyRate = Number(form.hourlyRate);
      }
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setMessage("Profile updated");
      router.refresh();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="h-fit rounded-[28px] border border-[var(--line)] bg-white/90 p-6">
      <h2 className="font-display text-2xl font-semibold">Profile</h2>
      <div className="mt-5 space-y-4">
        <div>
          <label className="field-label">Name</label>
          <input
            className="field"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Headline</label>
          <input
            className="field"
            value={form.headline}
            onChange={(e) => setForm({ ...form, headline: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Bio</label>
          <textarea
            className="field min-h-[100px]"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Location</label>
          <input
            className="field"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </div>
        {user.role === "client" ? (
          <div>
            <label className="field-label">Company</label>
            <input
              className="field"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </div>
        ) : null}
        {user.role === "creator" ? (
          <>
            <div>
              <label className="field-label">Skills</label>
              <input
                className="field"
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label">Starting price</label>
                <input
                  type="number"
                  className="field"
                  value={form.startingPrice}
                  onChange={(e) => setForm({ ...form, startingPrice: e.target.value })}
                />
              </div>
              <div>
                <label className="field-label">Hourly rate</label>
                <input
                  type="number"
                  className="field"
                  value={form.hourlyRate}
                  onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                />
              </div>
            </div>
          </>
        ) : null}
      </div>
      {message ? <p className="mt-3 text-sm text-[var(--ink-soft)]">{message}</p> : null}
      <button type="submit" className="btn btn-primary mt-5 w-full" disabled={saving}>
        {saving ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
