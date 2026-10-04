import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/app/components/primitives/page-header";
import { Container } from "@/app/components/primitives/container";
import { Calculator } from "@/app/components/calculator/calculator";
import { pageMetadata } from "@/app/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Solar savings calculator",
  description:
    "Estimate the solar system your business needs, what it costs and how much it could save — in FCFA, for your city in Côte d'Ivoire.",
  path: "/calculator",
});

export default function CalculatorPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Calculator", path: "/calculator" }]}
        title="Estimate your solar savings"
        lead="Tell us about your site and see a suggested system, its cost and its payback, updated as you type. Every figure is an estimate, and the assumptions are listed beneath the result."
      />
      <Container className="py-12 md:py-16">
        {/* useSearchParams needs a Suspense boundary so the page shell can
            still be statically rendered. */}
        <Suspense fallback={<div className="bg-plaster h-[40rem] rounded-[var(--radius-md)]" />}>
          <Calculator />
        </Suspense>
      </Container>
    </>
  );
}
