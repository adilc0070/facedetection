"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
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
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
      </div>
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center text-sm text-[var(--ink-soft)]">
        Demo: ava@lumina.studio / password123 (creator) · elena@brandco.com / password123 (client)
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="section-pad pt-10">
      <div className="container-x max-w-md">
        <h1 className="font-display text-4xl font-semibold">Welcome back</h1>
        <p className="mt-3 text-[var(--ink-soft)]">
          Sign in to manage projects, escrow payments, and deliveries.
        </p>
        <Suspense fallback={<div className="mt-8 h-40 animate-pulse rounded-2xl bg-white/50" />}>
          <LoginForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-[var(--ink-soft)]">
          New here?{" "}
          <Link href="/auth/register" className="font-semibold text-[var(--accent)]">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
