import { Link } from "@/app/components/primitives/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Container } from "@/app/components/primitives/container";
import { BreadcrumbJsonLd } from "@/app/components/seo/json-ld";
import { localizePath, type Locale } from "@/app/lib/i18n";
import { cn } from "@/app/lib/utils";

/** `path` is language-free: "/projects", not "/fr/projects". */
type Crumb = { name: string; path: string };

const HOME: Record<Locale, string> = { en: "Home", fr: "Accueil" };
const BREADCRUMB: Record<Locale, string> = { en: "Breadcrumb", fr: "Fil d'Ariane" };

/**
 * The opening of every inner page: breadcrumb, the page's single h1, and a
 * lead paragraph. Breadcrumbs render visibly AND as structured data from the
 * same list, so they cannot disagree.
 */
export function PageHeader({
  title,
  lead,
  crumbs,
  children,
  className,
  locale,
}: {
  locale: Locale;
  title: string;
  lead?: ReactNode;
  crumbs: Crumb[];
  children?: ReactNode;
  className?: string;
}) {
  const trail = [{ name: HOME[locale], path: "/" }, ...crumbs];
  return (
    <section className={cn("bg-plaster border-line border-b", className)}>
      <Container className="flex flex-col gap-6 pt-8 pb-12 md:pt-10 md:pb-16">
        <nav aria-label={BREADCRUMB[locale]}>
          <ol className="type-small text-muted flex flex-wrap items-center gap-1">
            {trail.map((crumb, i) => {
              const last = i === trail.length - 1;
              return (
                <li key={crumb.path} className="flex items-center gap-1">
                  {last ? (
                    <span aria-current="page" className="text-ink">
                      {crumb.name}
                    </span>
                  ) : (
                    <>
                      <Link
                        href={crumb.path}
                        className="hover:text-ink underline-offset-2 hover:underline"
                      >
                        {crumb.name}
                      </Link>
                      <ChevronRight className="size-3.5" aria-hidden />
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
        <div className="flex max-w-4xl flex-col gap-5">
          <h1 className="type-h1 text-balance">{title}</h1>
          {lead && <div className="type-lead text-muted max-w-[60ch]">{lead}</div>}
        </div>
        {children}
      </Container>
      <BreadcrumbJsonLd
        items={trail.map((c) => ({ name: c.name, path: localizePath(c.path, locale) }))}
      />
    </section>
  );
}
