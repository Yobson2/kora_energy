import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogoMark } from "@/app/components/nav/logo";
import { LoginForm } from "@/app/components/admin/login-form";
import { currentSession } from "@/app/server/auth/current";
import { DEMO_ACCOUNT, demoLoginEnabled } from "@/app/server/auth/credentials";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

/** Only same-site relative paths are accepted, so `next` can't redirect off-site. */
function safeNext(next: string | undefined): string {
  return next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNext((await searchParams).next);
  if (await currentSession()) redirect(next);

  const demo = demoLoginEnabled();

  return (
    <main id="main" className="bg-plaster flex min-h-dvh items-center justify-center px-4 py-16">
      <div className="flex w-full max-w-md flex-col gap-8">
        <div className="flex items-center gap-3">
          <LogoMark className="size-9" />
          <div>
            <p className="font-semibold [font-stretch:115%]">Kora Energy</p>
            <p className="type-small text-muted">Back office</p>
          </div>
        </div>
        <div className="bg-paper ring-line flex flex-col gap-6 rounded-[var(--radius-md)] p-6 ring-1 md:p-8">
          <h1 className="type-h2">Sign in</h1>
          {demo && (
            <div className="bg-sun-soft type-small rounded-[var(--radius-sm)] p-4">
              <p className="font-semibold">Demo access for reviewers</p>
              <p className="mt-1">
                Email <code className="font-semibold">{DEMO_ACCOUNT.email}</code>
                <br />
                Password <code className="font-semibold">{DEMO_ACCOUNT.password}</code>
              </p>
              <p className="text-muted mt-2">All leads you see are demonstration data.</p>
            </div>
          )}
          <LoginForm next={next} />
        </div>
      </div>
    </main>
  );
}
