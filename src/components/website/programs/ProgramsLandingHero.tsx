import React from "react";
import Link from "next/link";

export type ProgramsLandingHeroProps = {
  eyebrow: string;
  headlinePrefix: string;
  headlineAccent: string;
  intro: string;
};

export default function ProgramsLandingHero({
  eyebrow,
  headlinePrefix,
  headlineAccent,
  intro,
}: ProgramsLandingHeroProps) {
  return (
    <section className="prog-hero">
      <div className="prog-hero-inner">
        <div className="prog-hero-eyebrow">
          <i className="fa-solid fa-grid-2" aria-hidden />
          {eyebrow}
        </div>
        <h1>
          {(headlinePrefix || "Programs that").trim()}{" "}
          {(headlineAccent || "").trim() ? <span>{headlineAccent.trim()}</span> : null}
        </h1>
        {intro ? <p className="prog-hero-intro">{intro}</p> : null}
        <nav className="prog-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden>›</span>
          <span>Programs</span>
        </nav>
      </div>
    </section>
  );
}
