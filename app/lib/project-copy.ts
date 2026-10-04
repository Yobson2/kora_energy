import type { Project, ProjectCopy } from "@/app/lib/domain";
import type { Locale } from "@/app/lib/i18n";

/**
 * A case study's words in a language: its translation when there is one,
 * otherwise the English original. `lang` says which, so the page can mark
 * untranslated text with lang="en" for screen readers and translators.
 */
export function projectCopy(project: Project, locale: Locale): ProjectCopy & { lang: Locale } {
  const translated = locale === "en" ? undefined : project.translations?.[locale];
  if (translated) return { ...translated, lang: locale };
  const { title, client, area, summary, challenge, approach, results } = project;
  return { title, client, area, summary, challenge, approach, results, lang: "en" };
}
