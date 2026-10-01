"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HireProposalButton({ proposalId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function hire() {
    setLoading(true);
    try {
      const res = await fetch(`/api/proposals/${proposalId}/hire`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Hire failed");
      router.push(`/dashboard/orders/${data.order._id}`);
    } catch (err) {
      alert(err.message);
      setLoading(false);
    }
  }

  return (
    <button type="button" className="btn btn-accent !py-2 !px-4 text-sm" onClick={hire} disabled={loading}>
      {loading ? "Hiring…" : "Hire & pay Lumina"}
    </button>
  );
}
