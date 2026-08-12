import { Metadata } from "next";
import { getPolicyPage } from "@/lib/policy-pages";
import "../privacy-policy/policy-page.css";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Caritas Rwanda Terms and Conditions for website use and donations.",
};

const FALLBACK_HTML = `
  <h2>Introduction</h2>
  <p>These Terms and Conditions govern your use of the Caritas Rwanda website and donation services. By making a donation or using this site, you agree to these terms.</p>
  <h2>Donations</h2>
  <p>Donations are voluntary contributions to support Caritas Rwanda programmes. One-time and recurring (monthly) gifts may be offered. Recurring gifts continue until you cancel or pause them, or until an optional commitment period ends.</p>
  <h2>Payment processing</h2>
  <p>Card payments are processed securely by Stripe. Bank transfer and mobile money pledges are confirmed by our team before being marked as received.</p>
  <h2>Recurring gifts</h2>
  <p>If you choose a monthly or other recurring donation, you authorise Caritas Rwanda (via Stripe) to charge the selected amount on the agreed schedule. You may request pause or cancellation by contacting us, and staff can manage subscriptions in the dashboard.</p>
  <h2>Privacy</h2>
  <p>Personal data collected for donations is handled according to our <a href="/privacy-policy">Privacy Policy</a>.</p>
  <h2>Contact</h2>
  <p>Questions about these terms: <strong>info@caritasrwanda.org</strong>.</p>
`;

export default async function TermsPage() {
  const page = await getPolicyPage("terms");
  const title = page?.title || "Terms and Conditions";
  const content = page?.content || FALLBACK_HTML;
  const updatedAt = page?.updated_at || new Date().toISOString();

  return (
    <div className="policy-page">
      <div className="policy-page-hero">
        <div className="policy-page-hero-inner">
          <h1>{title}</h1>
          <p className="policy-page-date">
            Last updated:{" "}
            {new Date(updatedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
      <div className="policy-page-content">
        <div
          className="policy-page-body"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}
