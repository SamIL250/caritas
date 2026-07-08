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
  /** Background image URL — baked into --page-hero-image CSS var */
  imageUrl?: string;
  breadcrumbLabel?: string;
  quickNav?: QuickNavItem[];
  /** When "select", pills toggle sections instead of scrolling to anchors. */
  quickNavMode?: "anchor" | "select";
  activeQuickNavHref?: string | null;
  onQuickNavSelect?: (href: string) => void;
  children?: React.ReactNode;
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
  imageUrl = "/img/slide1.webp",
  breadcrumbLabel = "About Us",
  quickNav = [],
  quickNavMode = "anchor",
  activeQuickNavHref = null,
  onQuickNavSelect,
  children,
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
      <div className="page-hero-container">
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
                const isActive =
                  quickNavMode === "select" && activeQuickNavHref === item.href;
                const pillClass = isActive ? "qnav-pill is-active" : "qnav-pill";

                if (quickNavMode === "select" && onQuickNavSelect) {
                  return (
                    <button
                      key={item.href}
                      type="button"
                      className={pillClass}
                      aria-current={isActive ? "true" : undefined}
                      onClick={() => onQuickNavSelect(item.href)}
                    >
                      {iconClass ? <i className={iconClass} aria-hidden /> : null}
                      {item.label}
                    </button>
                  );
                }

                return (
                  <a key={item.href} href={item.href} className={pillClass}>
                    {iconClass ? <i className={iconClass} aria-hidden /> : null}
                    {item.label}
                  </a>
                );
              })}
            </nav>
          ) : null}
          {children}
        </div>
      </div>
    </section>
  );
}
