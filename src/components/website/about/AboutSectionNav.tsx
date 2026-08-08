"use client";

import "@/app/about-section-nav.css";

export type AboutSectionNavItem = {
  label: string;
  href: string;
  icon?: string;
};

type AboutSectionNavProps = {
  items: AboutSectionNavItem[];
  activeHref: string | null;
  onSelect: (href: string) => void;
  /** CMS / dashboard preview — cards are non-interactive */
  preview?: boolean;
};

function iconClass(raw?: string) {
  const ic = (raw || "").trim();
  if (!ic) return null;
  if (ic.includes("fa-")) {
    return ic.startsWith("fa-solid") || ic.startsWith("fa-regular") || ic.startsWith("fa-brands")
      ? ic
      : `fa-solid ${ic.replace(/^fa-solid\s+/i, "")}`;
  }
  return `fa-solid fa-${ic.replace(/^fa-?/i, "")}`;
}

export default function AboutSectionNav({
  items,
  activeHref,
  onSelect,
  preview = false,
}: AboutSectionNavProps) {
  if (items.length === 0) return null;

  return (
    <section
      className="cr-about-nav"
      aria-labelledby="cr-about-nav-title"
    >
      <div className="cr-about-nav__inner">
        <header className="cr-about-nav__header">
          <p className="cr-about-nav__eyebrow">On this page</p>
          <h2 id="cr-about-nav-title" className="cr-about-nav__title">
            Explore Caritas Rwanda
          </h2>
          <p className="cr-about-nav__lead">
            Choose a topic below to open its section — history, mission, values, network, and leadership.
          </p>
        </header>

        <div className="cr-about-nav__shell">
          <div className="cr-about-nav__frame">
            <div className="cr-about-nav__grid" role="tablist" aria-label="About page sections">
              {items.map((item) => {
                const isActive = activeHref === item.href;
                const ic = iconClass(item.icon);
                const className = `cr-about-nav__item${isActive ? " is-active" : ""}`;

                if (preview) {
                  return (
                    <div
                      key={item.href}
                      className={className}
                      role="tab"
                      aria-selected={isActive}
                    >
                      {ic ? (
                        <span className="cr-about-nav__icon" aria-hidden>
                          <i className={ic} />
                        </span>
                      ) : null}
                      <span className="cr-about-nav__label">{item.label}</span>
                      <span className="cr-about-nav__hint">View section</span>
                    </div>
                  );
                }

                return (
                  <button
                    key={item.href}
                    type="button"
                    role="tab"
                    className={className}
                    aria-selected={isActive}
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => onSelect(item.href)}
                  >
                    {ic ? (
                      <span className="cr-about-nav__icon" aria-hidden>
                        <i className={ic} />
                      </span>
                    ) : null}
                    <span className="cr-about-nav__label">{item.label}</span>
                    <span className="cr-about-nav__hint">
                      {isActive ? "Currently open" : "View section"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
