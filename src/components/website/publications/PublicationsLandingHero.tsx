import React from "react";
import Link from "next/link";

export type PublicationsLandingHeroProps = {
  eyebrow: string;
  headlinePrefix: string;
  headlineAccent: string;
  intro: string;
};

export default function PublicationsLandingHero({
  eyebrow,
  headlinePrefix,
  headlineAccent,
  intro,
}: PublicationsLandingHeroProps) {
  return (
    <section className="pub-hero">
      <div className="pub-hero-inner">
        <div className="pub-hero-eyebrow">
          <i className="fa-solid fa-book-open" aria-hidden />
          {eyebrow}
        </div>
        <h1>
          {(headlinePrefix || "Publications &").trim()}{" "}
          {(headlineAccent || "").trim() ? <span>{headlineAccent.trim()}</span> : null}
        </h1>
        <p className="pub-hero-intro">{intro}</p>
        <nav className="pub-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden>›</span>
          <span>Publications</span>
        </nav>
      </div>
    </section>
  );
}
