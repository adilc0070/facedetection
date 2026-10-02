"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/creators", label: "Creators" },
  { href: "/jobs", label: "Jobs" },
  { href: "/how-it-works", label: "How it works" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "py-3" : "py-5"
      )}
    >
      <div className="container-x">
        <div
          className={cn(
            "glass flex items-center justify-between rounded-full px-4 py-2.5 md:px-5",
            scrolled && "shadow-[var(--shadow-soft)]"
          )}
        >
          <Link href="/" className="font-display text-[1.15rem] font-semibold tracking-tight">
            Lumina
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]",
                  pathname.startsWith(link.href) && "text-[var(--ink)]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <Link href="/dashboard" className="btn btn-ghost !py-2 !px-4 text-sm">
                  Dashboard
                </Link>
                <button onClick={logout} className="btn btn-primary !py-2 !px-4 text-sm">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn btn-ghost !py-2 !px-4 text-sm">
                  Sign in
                </Link>
                <Link href="/auth/register" className="btn btn-primary !py-2 !px-4 text-sm">
                  Join Lumina
                </Link>
              </>
            )}
          </div>

          <button
            className="rounded-full p-2 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open && (
          <div className="glass mt-2 rounded-3xl p-4 md:hidden">
            <div className="flex flex-col gap-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-white/70"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-[var(--line)] pt-3">
                {user ? (
                  <>
                    <Link href="/dashboard" className="btn btn-ghost" onClick={() => setOpen(false)}>
                      Dashboard
                    </Link>
                    <button onClick={logout} className="btn btn-primary">
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" className="btn btn-ghost" onClick={() => setOpen(false)}>
                      Sign in
                    </Link>
                    <Link
                      href="/auth/register"
                      className="btn btn-primary"
                      onClick={() => setOpen(false)}
                    >
                      Join Lumina
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
