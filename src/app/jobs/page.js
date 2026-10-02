import Link from "next/link";
import { connectDB } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { Job } from "@/lib/models/Job";
import JobCard from "@/components/JobCard";
import { CATEGORIES } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Jobs — Lumina",
};

export default async function JobsPage({ searchParams }) {
  const params = await searchParams;
  await connectDB();
  await ensureSeeded();

  const filter = { status: "open" };
  if (params.category) filter.category = params.category;

  const jobs = await Job.find(filter)
    .populate("client", "name company")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="section-pad pt-10">
      <div className="container-x">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-4xl font-semibold md:text-5xl">Jobs</h1>
            <p className="mt-3 max-w-xl text-[var(--ink-soft)]">
              Open briefs from brands looking for AI video creators.
            </p>
          </div>
          <Link href="/jobs/new" className="btn btn-primary">
            Post a job
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <Link
            href="/jobs"
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              !params.category
                ? "bg-[var(--ink)] text-white"
                : "border border-[var(--line)] bg-white/70"
            }`}
          >
            All
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/jobs?category=${cat.id}`}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                params.category === cat.id
                  ? "bg-[var(--ink)] text-white"
                  : "border border-[var(--line)] bg-white/70"
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={String(job._id)} job={job} />
          ))}
        </div>
        {jobs.length === 0 ? (
          <p className="mt-16 text-center text-[var(--ink-soft)]">No open jobs in this category.</p>
        ) : null}
      </div>
    </div>
  );
}
