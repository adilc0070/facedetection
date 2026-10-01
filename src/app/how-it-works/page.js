import Link from "next/link";
import { ShieldCheck, CreditCard, Clapperboard, BadgeCheck } from "lucide-react";

export const metadata = {
  title: "How it works — Lumina",
};

const steps = [
  {
    icon: Clapperboard,
    title: "Post or apply",
    text: "Clients publish briefs. Course-trained creators propose with a clear bid and timeline.",
  },
  {
    icon: CreditCard,
    title: "Pay Lumina",
    text: "When a creator is hired, the client pays Lumina. Funds are held securely in escrow — not sent directly.",
  },
  {
    icon: ShieldCheck,
    title: "Create & deliver",
    text: "The creator produces the AI video work and submits delivery through the platform.",
  },
  {
    icon: BadgeCheck,
    title: "Approve & release",
    text: "Client approves. Lumina keeps the platform fee and pays the creator their payout instantly on the books.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="section-pad pt-10">
      <div className="container-x">
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl font-semibold md:text-5xl">How Lumina works</h1>
          <p className="mt-4 text-lg text-[var(--ink-soft)]">
            A simple escrow marketplace built for AI Creation & Creative Course graduates who want real freelance work —
            and brands who want reliable talent.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {steps.map((step, i) => (
            <div key={step.title} className="rounded-[28px] border border-[var(--line)] bg-white/80 p-7">
              <div className="flex items-center gap-3">
                <span className="font-display text-sm font-semibold text-[var(--ink-faint)]">
                  0{i + 1}
                </span>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-soft)]">
                  <step.icon size={18} className="text-[var(--accent)]" />
                </div>
              </div>
              <h2 className="mt-5 font-display text-2xl font-semibold">{step.title}</h2>
              <p className="mt-2 text-[var(--ink-soft)] leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-[32px] bg-[var(--ink)] px-8 py-12 text-white md:px-12">
          <h2 className="font-display text-3xl font-semibold">Why payments go through Lumina</h2>
          <p className="mt-4 max-w-2xl text-white/70">
            Direct peer-to-peer payments create risk on both sides. Our model keeps client money protected until delivery,
            and ensures creators get paid when the work is approved — with a transparent platform fee.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/auth/register?role=creator" className="btn btn-accent">
              I want freelance work
            </Link>
            <Link
              href="/auth/register?role=client"
              className="btn border border-white/20 bg-white/10 text-white hover:bg-white/15"
            >
              I want to hire
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
