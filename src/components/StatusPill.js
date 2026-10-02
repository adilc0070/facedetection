"use client";

export default function StatusPill({ status }) {
  const map = {
    open: { label: "Open", color: "bg-[#e8f6ee] text-[var(--success)]" },
    pending_payment: { label: "Awaiting payment", color: "bg-[#fff4e5] text-[var(--warning)]" },
    funded: { label: "Escrow funded", color: "bg-[var(--accent-soft)] text-[var(--accent)]" },
    in_progress: { label: "In progress", color: "bg-[var(--accent-soft)] text-[var(--accent)]" },
    delivered: { label: "Delivered", color: "bg-[#efe9ff] text-[#5b4bb7]" },
    completed: { label: "Completed", color: "bg-[#e8f6ee] text-[var(--success)]" },
    disputed: { label: "Disputed", color: "bg-[#fdecea] text-[var(--danger)]" },
    refunded: { label: "Refunded", color: "bg-[#f3f3f5] text-[var(--ink-soft)]" },
    cancelled: { label: "Cancelled", color: "bg-[#f3f3f5] text-[var(--ink-soft)]" },
    pending: { label: "Pending", color: "bg-[#fff4e5] text-[var(--warning)]" },
    accepted: { label: "Accepted", color: "bg-[#e8f6ee] text-[var(--success)]" },
    rejected: { label: "Rejected", color: "bg-[#fdecea] text-[var(--danger)]" },
  };

  const item = map[status] || { label: status, color: "bg-[#f3f3f5] text-[var(--ink-soft)]" };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.color}`}>
      {item.label}
    </span>
  );
}
