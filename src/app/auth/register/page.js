"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "client" ? "client" : "creator";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: initialRole,
  });

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[var(--line)] bg-white/70 p-1">
        {["creator", "client"].map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => setForm({ ...form, role })}
            className={`rounded-xl px-3 py-2.5 text-sm font-semibold capitalize transition ${
              form.role === role ? "bg-[var(--ink)] text-white" : "text-[var(--ink-soft)]"
            }`}
          >
            {role}
          </button>
        ))}
      </div>
      <div>
        <label className="field-label">Full name</label>
        <input
          className="field"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div>
        <label className="field-label">Email</label>
        <input
          type="email"
          className="field"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>
      <div>
        <label className="field-label">Password</label>
        <input
          type="password"
          className="field"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
      </div>
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <div className="section-pad pt-10">
      <div className="container-x max-w-md">
        <h1 className="font-display text-4xl font-semibold">Join Lumina</h1>
        <p className="mt-3 text-[var(--ink-soft)]">
          Creators find freelance work. Clients hire the best AI video talent. Payments run through us.
        </p>
        <Suspense fallback={<div className="mt-8 h-40 animate-pulse rounded-2xl bg-white/50" />}>
          <RegisterForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-[var(--ink-soft)]">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-[var(--accent)]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
