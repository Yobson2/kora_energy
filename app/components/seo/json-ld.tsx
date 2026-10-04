import { siteConfig } from "@/app/lib/site";

/**
 * Structured data. JSON.stringify output is additionally escaped for "<" so a
 * value can never close the <script> element — relevant for any graph built
 * from stored content (project titles come from the back office).
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": `${siteConfig.url}/#organization`,
            name: siteConfig.name,
            legalName: siteConfig.legalName,
            url: siteConfig.url,
            description: `${siteConfig.description} Fictional company — portfolio concept project.`,
            areaServed: { "@type": "Country", name: siteConfig.office.country },
          },
          {
            "@type": "WebSite",
            "@id": `${siteConfig.url}/#website`,
            url: siteConfig.url,
            name: siteConfig.name,
            publisher: { "@id": `${siteConfig.url}/#organization` },
            inLanguage: "en",
          },
        ],
      }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: Array<{ name: string; path: string }> }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: `${siteConfig.url}${item.path}`,
        })),
      }}
    />
  );
}
