import { Archivo } from "next/font/google";
import type { Locale } from "@/app/lib/i18n";
import "@/app/globals.css";

/**
 * One family with a width axis. Loading the variable font (no fixed weights)
 * is what makes the `wdth` axis available; the expanded display style and the
 * normal-width body are the same file.
 */
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
});

/**
 * The <html> and <body> shared by the two root layouts: the public site
 * (app/[lang], which knows the page language) and the back office (English).
 */
export function RootDocument({ lang, children }: { lang: Locale; children: React.ReactNode }) {
  return (
    <html lang={lang} className={archivo.variable}>
      {/* suppressHydrationWarning is scoped to <body> alone: it is the element
          browser extensions (password managers, Grammarly) inject attributes
          into before React hydrates. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
