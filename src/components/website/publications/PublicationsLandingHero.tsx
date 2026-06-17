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
  // original-website/publications.html uses img/slide2.jpg for the hero background
  return (
    <section className="pub-hero">
      <div className="pub-hero-container">
        <div className="pub-hero-inner">
          {eyebrow ? (
            <div className="pub-hero-eyebrow">
              <i className="fa-solid fa-circle-info" aria-hidden />
              {eyebrow}
            </div>
          ) : null}
          <h1>
            {(headlinePrefix || "Publications &").trim()} <span>{(headlineAccent || "Resources").trim()}</span>
          </h1>
          {intro ? <p className="pub-hero-intro">{intro}</p> : null}
          <nav className="pub-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden>›</span>
            <span>Publications</span>
          </nav>
        </div>
      </div>
    </section>
  );
}
