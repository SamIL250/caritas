/**
 * Crawlable structured data for Caritas Rwanda + discreet Lerony attribution
 * (creator / developer). Lerony is intentionally NOT in the document <title>.
 */

import { resolveSiteOrigin } from "@/lib/site-origin";

export default function WebsiteJsonLd() {
  const site = resolveSiteOrigin();

  const caritasOrg = {
    "@type": "NGO",
    "@id": `${site}/#organization`,
    name: "Caritas Rwanda",
    url: site,
    logo: `${site}/img/logo_bg.webp`,
    description:
      "Caritas Rwanda empowers communities through healthcare, education, and humanitarian assistance across Rwanda’s dioceses.",
    areaServed: {
      "@type": "Country",
      name: "Rwanda",
    },
    sameAs: [site, "https://caritasrwanda.org"],
  };

  const leronyOrg = {
    "@type": "Organization",
    "@id": "https://lerony.com/#organization",
    name: "Lerony",
    alternateName: ["Lerony Co. Ltd", "Lerony IT Technology and Innovation"],
    url: "https://lerony.com",
    logo: `${site}/img/lerony_logo.png`,
    description:
      "Lerony is an IT technology and innovation in Kigali specializing in web and mobile app development, SEO, GovTech, AI automation, and enterprise software for African enterprises.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "1 KN 78 St",
      addressLocality: "Kigali",
      addressCountry: "RW",
    },
    telephone: "+250792054846",
    sameAs: ["https://lerony.com"],
  };

  const website = {
    "@type": "WebSite",
    "@id": `${site}/#website`,
    url: site,
    name: "Caritas Rwanda",
    description:
      "Official website of Caritas Rwanda — programs, stories, publications, donations, and how to get involved.",
    inLanguage: ["en", "fr", "rw"],
    publisher: { "@id": `${site}/#organization` },
    creator: { "@id": "https://lerony.com/#organization" },
    copyrightHolder: { "@id": `${site}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: `${site}/publications?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const webApp = {
    "@type": "WebApplication",
    "@id": `${site}/#webapp`,
    name: "Caritas Rwanda Website",
    url: site,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Any",
    isAccessibleForFree: true,
    creator: { "@id": "https://lerony.com/#organization" },
    provider: { "@id": `${site}/#organization` },
    description:
      "Public website for Caritas Rwanda designed and developed by Lerony, an IT technology and innovation company based in Kigali.",
  };

  const graph = {
    "@context": "https://schema.org",
    "@graph": [caritasOrg, leronyOrg, website, webApp],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
