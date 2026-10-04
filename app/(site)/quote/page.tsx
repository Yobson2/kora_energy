import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/app/components/primitives/page-header";
import { Container } from "@/app/components/primitives/container";
import { QuoteForm } from "@/app/components/quote/quote-form";
import { pageMetadata } from "@/app/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Request a quote",
  description:
    "Tell us about your site and an energy specialist will prepare a solar proposal for you. Four short steps, about three minutes.",
  path: "/quote",
});

export default function QuotePage() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Request a quote", path: "/quote" }]}
        title="Request a quote"
        lead="Four short steps, about three minutes. An energy specialist reviews every request and replies within one working day."
      />
      <Container className="py-12 md:py-16">
        <Suspense fallback={<div className="bg-plaster h-[36rem] rounded-[var(--radius-md)]" />}>
          <QuoteForm />
        </Suspense>
      </Container>
    </>
  );
}
