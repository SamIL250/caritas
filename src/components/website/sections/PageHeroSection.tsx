import Link from "next/link";
import React from "react";

type QuickNavItem = {
  label: string;
  href: string;
  icon?: string;
};

type PageHeroSectionProps = {
  eyebrow: string;
  heading: string;
  headingAccent?: string;
  subheading: string;
  /** Background image URL (fallback /img/slide1.png) */
  imageUrl?: string;
  breadcrumbLabel?: string;
  quickNav?: QuickNavItem[];
};

function HeadingWithAccent({
  heading,
  headingAccent,
}: {
  heading: string;
  headingAccent?: string;
}) {
  if (!headingAccent?.trim()) {
    return (
      <>
        {heading.split("\n").map((line, i) => (
          <React.Fragment key={i}>
            {i > 0 ? <br /> : null}
            {line}
          </React.Fragment>
        ))}
      </>
    );
  }
  const i = heading.indexOf(headingAccent);
  if (i < 0) {
    return <>{heading}</>;
  }
  return (
    <>
      {heading.slice(0, i)}
      <span>{headingAccent}</span>
      {heading.slice(i + headingAccent.length)}
    </>
  );
}

export default function PageHeroSection({
  eyebrow,
  heading,
  headingAccent,
  subheading,
  imageUrl = "/img/slide1.png",
  breadcrumbLabel = "About Us",
  quickNav = [],
}: PageHeroSectionProps) {
  return (
    <section
      className="page-hero"
      style={
        {
          ["--page-hero-image" as string]: `url(${JSON.stringify(imageUrl)})`,
        } as React.CSSProperties
      }
    >
      <div className="page-hero-inner">
        {eyebrow ? (
          <div className="hero-eyebrow">
            <i className="fa-solid fa-circle-info" aria-hidden />
            {eyebrow}
          </div>
        ) : null}
        <h1>
          <HeadingWithAccent heading={heading} headingAccent={headingAccent} />
        </h1>
        {subheading ? <p>{subheading}</p> : null}
        <nav className="hero-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden>›</span>
          <span>{breadcrumbLabel}</span>
        </nav>
        {quickNav.length > 0 ? (
          <nav className="hero-quick-nav" aria-label="On this page">
            {quickNav.map((item) => {
              const ic = item.icon?.trim();
              const iconClass = ic
                ? ic.includes("fa-")
                  ? `fa-solid ${ic.replace(/^fa-solid\s+/i, "")}`
                  : `fa-solid fa-${ic}`
                : null;
              return (
                <a key={item.href} href={item.href} className="qnav-pill">
                  {iconClass ? <i className={iconClass} aria-hidden /> : null}
                  {item.label}
                </a>
              );
            })}
          </nav>
        ) : null}
      </div>
    </section>
  );
}
