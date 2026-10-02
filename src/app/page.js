import Link from "next/link";
import Image from "next/image";
import { connectDB } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";
import { User } from "@/lib/models/User";
import { Job } from "@/lib/models/Job";
import CreatorCard from "@/components/CreatorCard";
import JobCard from "@/components/JobCard";
import { ArrowRight, ShieldCheck, Sparkles, Wallet } from "lucide-react";

export const dynamic = "force-dynamic";

async function getHomeData() {
  await connectDB();
  await ensureSeeded();
  const [creators, jobs] = await Promise.all([
    User.find({ role: "creator", featured: true })
      .select("-passwordHash")
      .sort({ rating: -1 })
      .limit(3)
      .lean(),
    Job.find({ status: "open" })
      .populate("client", "name company")
      .sort({ createdAt: -1 })
      .limit(3)
      .lean(),
  ]);
  return { creators, jobs };
}

export default async function HomePage() {
  const { creators, jobs } = await getHomeData();

  return (
    <>
      <section className="relative min-h-[calc(100vh-5.5rem)] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=2000&h=1200&fit=crop"
            alt="Cinematic AI video creation workspace"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0c]/82 via-[#0b0b0c]/55 to-[#0b0b0c]/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0c]/50 via-transparent to-transparent" />
        </div>

        <div className="container-x relative flex min-h-[calc(100vh-5.5rem)] flex-col justify-end pb-16 pt-24 md:justify-center md:pb-24">
          <p className="animate-rise font-display text-5xl font-semibold tracking-tight text-white md:text-7xl lg:text-8xl">
            Lumina
          </p>
          <h1 className="animate-rise animate-rise-delay-1 mt-5 max-w-2xl font-display text-3xl font-medium leading-[1.1] tracking-tight text-white md:text-5xl">
            AI video talent, curated from our courses.
          </h1>
          <p className="animate-rise animate-rise-delay-2 mt-5 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
            Brands hire. Creators deliver. You pay Lumina — we hold funds in escrow and
            release payment when the work is approved.
          </p>
          <div className="animate-rise animate-rise-delay-3 mt-8 flex flex-wrap gap-3">
            <Link href="/creators" className="btn btn-accent">
              Browse creators <ArrowRight size={16} />
            </Link>
            <Link
              href="/jobs/new"
              className="btn border border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/20"
            >
              Post a project
            </Link>
          </div>
          <p className="mt-8 text-sm text-white/55">
            From a community of 3,500+ AI Creation & Creative Course students — ready for real freelance work.
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-x">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold md:text-4xl">
              One marketplace. Protected payments.
            </h2>
            <p className="mt-3 text-[var(--ink-soft)]">
              Designed so freelancers from our courses can take real client work — without chasing invoices.
            </p>
          </div>

          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: "Course-trained creators",
                text: "Discover verified AI video talent specializing in ads, UGC, explainers, and brand films.",
              },
              {
                icon: Wallet,
                title: "Pay Lumina first",
                text: "Clients fund the project through us. Money sits in escrow until delivery is approved.",
              },
              {
                icon: ShieldCheck,
                title: "We pay creators",
                text: "On approval, Lumina releases the creator payout and keeps a clear platform fee.",
              },
            ].map((item) => (
              <div key={item.title}>
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-[var(--shadow-soft)]">
                  <item.icon size={20} className="text-[var(--accent)]" />
                </div>
                <h3 className="font-display text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-x">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold">Featured creators</h2>
              <p className="mt-2 text-[var(--ink-soft)]">Top-rated AI video freelancers ready to hire.</p>
            </div>
            <Link href="/creators" className="hidden text-sm font-semibold text-[var(--accent)] md:inline-flex">
              View all
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {creators.map((creator) => (
              <CreatorCard key={String(creator._id)} creator={creator} />
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-x">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold">Open projects</h2>
              <p className="mt-2 text-[var(--ink-soft)]">Work waiting for the right creator.</p>
            </div>
            <Link href="/jobs" className="hidden text-sm font-semibold text-[var(--accent)] md:inline-flex">
              Browse jobs
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={String(job._id)} job={job} />
            ))}
          </div>
        </div>
      </section>

      <section className="pb-28">
        <div className="container-x">
          <div className="relative overflow-hidden rounded-[32px] bg-[var(--ink)] px-8 py-14 text-white md:px-14">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--accent)]/30 blur-3xl" />
            <div className="relative max-w-xl">
              <h2 className="font-display text-3xl font-semibold md:text-4xl">
                Ready to turn course skills into paid work?
              </h2>
              <p className="mt-4 text-white/70">
                Join as a creator or post your next AI video project. Lumina handles matching and money.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/auth/register?role=creator" className="btn btn-accent">
                  Join as creator
                </Link>
                <Link
                  href="/auth/register?role=client"
                  className="btn border border-white/20 bg-white/10 text-white hover:bg-white/15"
                >
                  Hire talent
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
