"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/app/components/primitives/button";

/**
 * Last-resort boundary for unexpected render errors. Says what happened and
 * offers the two useful next steps; the digest lets support find the log line.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="bg-plaster flex min-h-dvh items-center">
      <div className="mx-auto flex max-w-xl flex-col items-start gap-6 px-4 py-20">
        <h1 className="type-h1">This page didn&apos;t load.</h1>
        <p className="type-lead text-muted">
          Something failed on our side. Trying again usually works; if it doesn&apos;t, the homepage
          will.
        </p>
        {error.digest && <p className="type-small text-muted tabular">Reference: {error.digest}</p>}
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={reset}>
            Try again
          </Button>
          <ButtonLink href="/" variant="outline">
            Go to the homepage
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
