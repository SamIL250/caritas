import React from "react";

export type NewsLandingHeroProps = {
  eyebrow: string;
  headlinePrefix: string;
  headlineAccent: string;
  intro: string;
  heroImageUrl?: string | null;
};

export default function NewsLandingHero({
  eyebrow,
  headlinePrefix,
  headlineAccent,
  intro,
  heroImageUrl,
  children,
}: NewsLandingHeroProps & { children?: React.ReactNode }) {
  const heroBg =
    heroImageUrl && heroImageUrl.trim()
      ? `url("${heroImageUrl.replace(/"/g, "")}")`
      : undefined;

  return (
    <section
      className="news-hero"
      style={
        heroBg
          ? ({ ["--news-hero-image" as string]: heroBg } as React.CSSProperties)
          : undefined
      }
    >
      <div className="news-hero-inner">
        <div className="hero-eyebrow">
          <i className="fa-solid fa-newspaper" aria-hidden />
          {eyebrow}
        </div>
        <h1>
          {(headlinePrefix || "News &").trim()}{" "}
          {(headlineAccent || "").trim() ? (
            <span>{(headlineAccent || "").trim()}</span>
          ) : null}
        </h1>
        <p className="news-hero-intro">{intro}</p>
        {children}
      </div>
    </section>
  );
}
