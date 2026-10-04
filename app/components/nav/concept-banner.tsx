import { Link } from "@/app/components/primitives/link";
import { Container } from "@/app/components/primitives/container";
import type { Locale } from "@/app/lib/i18n";

const COPY: Record<Locale, { strong: string; text: string; link: string }> = {
  en: {
    strong: "Concept project.",
    text: "Kora Energy is a fictional company built for a software engineering portfolio; no services are offered.",
    link: "About this project",
  },
  fr: {
    strong: "Projet fictif.",
    text: "Kora Energy est une entreprise fictive créée pour un portfolio d'ingénierie logicielle ; aucun service n'est proposé.",
    link: "À propos de ce projet",
  },
};

/**
 * Present on every public page, in every language. Kora Energy is fictional,
 * and the site is built to be convincing  so it must also be impossible to
 * mistake for a real company that could take someone's money or data.
 */
export function ConceptBanner({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  return (
    <div className="bg-ink text-on-ink-muted">
      <Container className="type-small flex min-h-9 items-center justify-center py-1.5 text-center">
        <p>
          <span className="text-paper font-semibold">{t.strong}</span> {t.text}{" "}
          <Link href="/about#concept" className="text-paper underline underline-offset-2">
            {t.link}
          </Link>
        </p>
      </Container>
    </div>
  );
}
