import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--line)] py-12">
      <div className="container-x flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-2xl font-semibold">Lumina</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--ink-soft)]">
            The marketplace where AI Creation & Creative Course graduates meet brands —
            with payments held securely by Lumina.
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-[var(--ink-soft)]">
          <Link href="/creators" className="hover:text-[var(--ink)]">
            Creators
          </Link>
          <Link href="/jobs" className="hover:text-[var(--ink)]">
            Jobs
          </Link>
          <Link href="/how-it-works" className="hover:text-[var(--ink)]">
            How it works
          </Link>
          <Link href="/auth/register" className="hover:text-[var(--ink)]">
            Join
          </Link>
        </div>
      </div>
      <div className="container-x mt-10 text-xs text-[var(--ink-faint)]">
        © {new Date().getFullYear()} Lumina Studio Marketplace
      </div>
    </footer>
  );
}
