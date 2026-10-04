import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/app/components/nav/logo";
import { AdminNav } from "@/app/components/admin/admin-nav";
import { SignOutButton } from "@/app/components/admin/sign-out-button";
import { requireAdminPage } from "@/app/server/auth/current";

export const metadata: Metadata = {
  title: { default: "Back office", template: "%s | Kora back office" },
  robots: { index: false, follow: false },
};

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminPage();

  return (
    <div className="bg-plaster min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]">
      <a
        href="#admin-main"
        className="bg-sun text-ink sr-only z-50 rounded-[var(--radius-sm)] px-4 py-2 font-semibold focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3"
      >
        Skip to content
      </a>
      <aside className="bg-ink text-paper flex flex-col gap-6 px-4 py-5 lg:sticky lg:top-0 lg:h-dvh lg:py-8">
        <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-start">
          <Link href="/admin" aria-label="Back office overview">
            <Logo />
          </Link>
          <span className="type-small bg-ink-soft text-on-ink-muted rounded-[var(--radius-pill)] px-2.5 py-0.5">
            Demo data
          </span>
        </div>
        <AdminNav />
        <div className="border-ink-line mt-auto hidden flex-col gap-3 border-t pt-5 lg:flex">
          <p className="type-small text-on-ink-muted">
            Signed in as <span className="text-paper">{session.name}</span>
          </p>
          <SignOutButton />
          <Link
            href="/"
            className="type-small text-on-ink-muted hover:text-paper underline underline-offset-2"
          >
            View public site
          </Link>
        </div>
      </aside>
      <main
        id="admin-main"
        tabIndex={-1}
        className="min-w-0 px-4 py-8 outline-none md:px-8 lg:px-10 lg:py-10"
      >
        {children}
        <div className="mt-12 flex flex-wrap gap-4 lg:hidden">
          <SignOutButton tone="light" />
        </div>
      </main>
    </div>
  );
}
