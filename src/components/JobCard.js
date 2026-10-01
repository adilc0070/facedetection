import Link from "next/link";
import { formatCurrency, formatDate, categoryLabel } from "@/lib/utils";

export default function JobCard({ job }) {
  const id = job._id || job.id;
  return (
    <Link
      href={`/jobs/${id}`}
      className="block rounded-[22px] border border-[var(--line)] bg-white/80 p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="badge">{categoryLabel(job.category)}</span>
          <h3 className="mt-3 font-display text-lg font-semibold leading-snug">{job.title}</h3>
        </div>
        <p className="shrink-0 text-sm font-semibold text-[var(--ink)]">
          {formatCurrency(job.budgetMin)}–{formatCurrency(job.budgetMax)}
        </p>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--ink-soft)]">
        {job.description}
      </p>
      <div className="mt-5 flex items-center justify-between text-xs text-[var(--ink-faint)]">
        <span>{job.proposalCount || 0} proposals</span>
        <span>Posted {formatDate(job.createdAt)}</span>
      </div>
    </Link>
  );
}
