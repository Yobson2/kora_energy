import Link from "next/link";
import { Container } from "@/app/components/primitives/container";

/**
 * Present on every public page. Kora Energy is fictional, and the site is
 * built to be convincing — so it must also be impossible to mistake for a
 * real company that could take someone's money or data.
 */
export function ConceptBanner() {
  return (
    <div className="bg-ink text-on-ink-muted">
      <Container className="type-small flex min-h-9 items-center justify-center py-1.5 text-center">
        <p>
          <span className="text-paper font-semibold">Concept project.</span> Kora Energy is a
          fictional company built for a software engineering portfolio — no services are offered.{" "}
          <Link href="/about#concept" className="text-paper underline underline-offset-2">
            About this project
          </Link>
        </p>
      </Container>
    </div>
  );
}
