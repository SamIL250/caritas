import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Newsletter subscription — Caritas Rwanda",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ ok?: string }> };

export default async function NewsletterUnsubscribedPage({ searchParams }: Props) {
  const sp = await searchParams;
  const ok = sp.ok !== "0";

  return (
    <div className="container-wide newsletter-status-page">
      <div className="newsletter-status-card">
        <div className={`newsletter-status-icon ${ok ? "is-success" : "is-muted"}`} aria-hidden>
          <i className={`fa-solid ${ok ? "fa-circle-check" : "fa-circle-info"}`} />
        </div>
        <h1 className="newsletter-status-title">
          {ok ? "Subscription updated" : "Link couldn’t be processed"}
        </h1>
        <p className="newsletter-status-text">
          {ok
            ? "You won’t receive further newsletters from Caritas Rwanda at this address. You can subscribe again anytime from our website footer."
            : "This unsubscribe link may be incomplete or expired. If you still receive emails, contact us and we’ll remove your address manually."}
        </p>
        <Link href="/" className="newsletter-status-home">
          Back to home
        </Link>
      </div>
    </div>
  );
}
