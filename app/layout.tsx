import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import { siteConfig } from "@/app/lib/site";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: "en",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={archivo.variable}>
      {/* suppressHydrationWarning is scoped to <body> alone: it is the element
          browser extensions (password managers, Grammarly) inject attributes
          into before React hydrates. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
