import type { Metadata, Viewport } from "next";
import { RootDocument } from "@/app/components/root-document";
import { siteConfig } from "@/app/lib/site";

/** Root layout of the back office. It is not localised: the team works in English. */
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: "Back office", template: `%s | ${siteConfig.name}` },
  applicationName: siteConfig.name,
};

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  width: "device-width",
  initialScale: 1,
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="en">{children}</RootDocument>;
}
