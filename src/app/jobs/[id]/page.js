import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { getCurrentUser } from "@/lib/auth";
import { Job } from "@/lib/models/Job";
import { Proposal } from "@/lib/models/Proposal";
import { categoryLabel, formatCurrency, formatDate } from "@/lib/utils";
import StatusPill from "@/components/StatusPill";
import ProposalForm from "@/components/ProposalForm";
import HireProposalButton from "@/components/HireProposalButton";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({ params }) {
  const { id } = await params;
  await connectDB();
  await ensureSeeded();
  const user = await getCurrentUser();

  const job = await Job.findById(id)
    .populate("client", "name company avatar location")
    .lean();
  if (!job) notFound();

  const isOwner = user && user.role === "client" && String(job.client._id) === user.id;

  const proposals = isOwner
    ? await Proposal.find({ job: id })
        .populate(
          "creator",
          "name avatar headline rating reviewCount startingPrice courseGraduate verified"
        )
        .sort({ createdAt: -1 })
        .lean()
    : [];

  return (
    <div className="section-pad pt-10">
      <div className="container-x grid gap-10 lg:grid-cols-[1.5fr_0.9fr]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="badge">{categoryLabel(job.category)}</span>
            <StatusPill status={job.status} />
          </div>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-5xl">
            {job.title}
          </h1>
          <p className="mt-4 text-sm text-[var(--ink-faint)]">
            Posted {formatDate(job.createdAt)} · {job.proposalCount} proposals
          </p>
          <div className="mt-8 whitespace-pre-wrap leading-relaxed text-[var(--ink-soft)]">
            {job.description}
          </div>
          {(job.skills || []).length > 0 ? (
            <div className="mt-8 flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-[var(--line)] bg-white/80 px-3 py-1 text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : null}

          {isOwner ? (
            <div className="mt-12">
              <h2 className="font-display text-2xl font-semibold">Proposals</h2>
              <div className="mt-5 space-y-4">
                {proposals.length === 0 ? (
                  <p className="text-sm text-[var(--ink-soft)]">No proposals yet.</p>
                ) : (
                  proposals.map((proposal) => (
                    <div
                      key={String(proposal._id)}
                      className="rounded-[22px] border border-[var(--line)] bg-white/90 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <Link
                            href={`/creators/${proposal.creator._id}`}
                            className="font-display text-lg font-semibold hover:underline"
                          >
                            {proposal.creator.name}
                          </Link>
                          <p className="text-sm text-[var(--ink-soft)]">{proposal.creator.headline}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(proposal.bidAmount)}</p>
                          <p className="text-xs text-[var(--ink-faint)]">
                            {proposal.deliveryDays} days
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-[var(--ink-soft)]">{proposal.coverLetter}</p>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <StatusPill status={proposal.status} />
                        {proposal.status === "pending" && job.status === "open" ? (
                          <HireProposalButton proposalId={String(proposal._id)} />
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}

          {user?.role === "creator" && job.status === "open" ? (
            <div className="mt-12">
              <h2 className="font-display text-2xl font-semibold">Submit a proposal</h2>
              <ProposalForm jobId={String(job._id)} />
            </div>
          ) : null}

          {!user && job.status === "open" ? (
            <p className="mt-10 text-sm text-[var(--ink-soft)]">
              <Link href="/auth/login" className="font-semibold text-[var(--accent)]">
                Sign in
              </Link>{" "}
              as a creator to propose on this job.
            </p>
          ) : null}
        </div>

        <aside className="h-fit rounded-[28px] border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow-soft)]">
          <p className="text-sm text-[var(--ink-faint)]">Budget</p>
          <p className="font-display text-3xl font-semibold">
            {formatCurrency(job.budgetMin)}–{formatCurrency(job.budgetMax)}
          </p>
          {job.deadline ? (
            <p className="mt-3 text-sm text-[var(--ink-soft)]">Deadline {formatDate(job.deadline)}</p>
          ) : null}
          <div className="mt-6 border-t border-[var(--line)] pt-5">
            <p className="text-sm text-[var(--ink-faint)]">Client</p>
            <p className="mt-1 font-semibold">{job.client?.name}</p>
            {job.client?.company ? (
              <p className="text-sm text-[var(--ink-soft)]">{job.client.company}</p>
            ) : null}
          </div>
          <p className="mt-6 text-xs leading-relaxed text-[var(--ink-faint)]">
            When you hire, payment is collected by Lumina and held until you approve the delivery.
          </p>
        </aside>
      </div>
    </div>
  );
}
