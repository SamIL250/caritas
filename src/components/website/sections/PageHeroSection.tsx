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
  imageUrl?: string;
  breadcrumbLabel?: string;
  quickNavHint?: string;
  quickNav?: QuickNavItem[];
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
  quickNavHint,
  quickNavMode = "anchor",
  activeQuickNavHref = null,
  onQuickNavSelect,
  children,
}: PageHeroSectionProps) {
  const hasQuickNav = quickNav.length > 0;
  const foundingYear = 1959;
  const yearsActive = new Date().getFullYear() - foundingYear;

  return (
    <section
      className={`hero-section-home hero-section-page${hasQuickNav ? " hero-section-page--with-quick-nav" : ""}`}
    >
      <div className="hero-section-home__inner">
        <div className="hero-slider-shell">
          <div className="hero-slider-frame hero-slider-frame--page">
            <div className="hero-slider-frame__media">
              <div
                className="hero-slider-frame__slide-bg"
                style={{ backgroundImage: `url(${imageUrl})` }}
                role="presentation"
              />
            </div>

            <div className="hero-slider-frame__overlay" aria-hidden />

            <div
              className="hero-years-watermark"
              aria-label={`${yearsActive} years of saving lives`}
            >
              <span className="hero-years-watermark__num">{yearsActive}</span>
              <span className="hero-years-watermark__label">
                years of
                <br />
                saving lives
              </span>
            </div>

            <div className="hero-slider-frame__content">
              <div className="hero-slider-frame__copy hero-slider-frame__copy--center hero-slider-frame__copy--page">
                {eyebrow ? (
                  <p className="hero-slider-frame__badge">{eyebrow}</p>
                ) : null}

                <h1 className="hero-slider-frame__title">
                  <HeadingWithAccent heading={heading} headingAccent={headingAccent} />
                </h1>

                {subheading ? (
                  <p className="hero-slider-frame__subtitle">{subheading}</p>
                ) : null}

                <nav className="hero-breadcrumb" aria-label="Breadcrumb">
                  <Link href="/">Home</Link>
                  <span aria-hidden>›</span>
                  <span>{breadcrumbLabel}</span>
                </nav>

                {hasQuickNav ? (
                  <div className="hero-quick-nav-row">
                    {quickNavHint ? (
                      <div className="hero-quick-nav-hint" aria-hidden>
                        <span className="hero-quick-nav-hint__icon" aria-hidden>
                          <i className="fa-solid fa-hand-point-right" aria-hidden />
                        </span>
                        <span className="hero-quick-nav-hint__label">{quickNavHint}</span>
                      </div>
                    ) : null}
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
                  </div>
                ) : null}

                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
