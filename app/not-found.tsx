import Link from "next/link";
import { LogoMark } from "@/app/components/nav/logo";
import { ButtonLink } from "@/app/components/primitives/button";

export default function NotFound() {
  return (
    <main id="main" className="bg-plaster flex min-h-dvh items-center">
      <div className="mx-auto flex max-w-xl flex-col items-start gap-6 px-4 py-20">
        <Link href="/" aria-label="Kora Energy home">
          <LogoMark className="size-10" />
        </Link>
        <h1 className="type-h1">This page isn&apos;t here.</h1>
        <p className="type-lead text-muted">
          The address may be mistyped, or the page may have moved. Projects that are no longer
          published also end up here.
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/" variant="secondary">
            Go to the homepage
          </ButtonLink>
          <ButtonLink href="/calculator" variant="outline">
            Open the calculator
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
