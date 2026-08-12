'use client';

import Link from 'next/link';
import { FOOTER_DEFAULTS, type FooterSettings } from '@/lib/footer-settings';
import FooterNewsletterForm from '@/components/website/FooterNewsletterForm';

const DEFAULT_LOGO = '/img/logo_caritas.webp';

type WebsiteFooterProps = {
  settings?: FooterSettings;
};

export default function WebsiteFooter({ settings: settingsProp }: WebsiteFooterProps) {
  const s = settingsProp ?? FOOTER_DEFAULTS;
  const logoSrc = (s.brand.logoUrl && s.brand.logoUrl.trim()) || DEFAULT_LOGO;

  const socialEntries: { key: keyof FooterSettings['social']; icon: string; label: string }[] = [
    { key: 'twitter', icon: 'fa-brands fa-x-twitter', label: 'X (Twitter)' },
    { key: 'youtube', icon: 'fab fa-youtube', label: 'YouTube' },
    { key: 'facebook', icon: 'fab fa-facebook-f', label: 'Facebook' },
    { key: 'linkedin', icon: 'fab fa-linkedin-in', label: 'LinkedIn' },
    { key: 'flickr', icon: 'fab fa-flickr', label: 'Flickr' },
  ];

  const hasSystems = s.systems.links.length > 0;

  return (
    <footer className="cr-footer website-footer">
      <div className="cr-footer__main">
        <div className="cr-footer__inner">
          <div className="footer-grid">
            <div className="footer-col">
              <img
                src={logoSrc}
                alt={s.bottom.orgName}
                className="footer-logo"
              />
              <div className="ft-socials">
                {socialEntries.map(({ key, icon, label }) => {
                  const url = s.social[key].trim();
                  if (!url) return null;
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ft-social-btn"
                      aria-label={label}
                    >
                      {key === 'twitter' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src="/img/x-logo.png"
                          alt="X"
                          className="ft-x-icon"
                          width={14}
                          height={14}
                        />
                      ) : (
                        <i className={icon} />
                      )}
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="footer-col">
              <div className="ft-col-heading">Contact Us</div>
              <div className="ft-chip">
                <div className="ft-chip-icon">
                  <i className="fa-solid fa-location-dot" />
                </div>
                <div>
                  <div className="ft-chip-label">{s.contact.addressLabel}</div>
                  <div className="ft-chip-value">{s.contact.address}</div>
                </div>
              </div>
              <div className="ft-chip">
                <div className="ft-chip-icon">
                  <i className="fa-solid fa-phone" />
                </div>
                <div>
                  <div className="ft-chip-label">{s.contact.phoneLabel}</div>
                  <div className="ft-chip-value">{s.contact.phone}</div>
                </div>
              </div>
              <div className="ft-chip">
                <div className="ft-chip-icon">
                  <i className="fa-solid fa-envelope" />
                </div>
                <div>
                  <div className="ft-chip-label">{s.contact.emailLabel}</div>
                  <div className="ft-chip-value">{s.contact.email}</div>
                </div>
              </div>
            </div>

            {hasSystems && (
              <div className="footer-col">
                <div className="ft-col-heading">{s.systems.heading}</div>
                <ul className="ft-links">
                  {s.systems.links.map((link, i) => (
                    <li key={`sys-${i}`}>
                      <a href={link.href} target="_blank" rel="noopener noreferrer">
                        <span className="ft-sys-name">{link.label}</span>
                        {link.description && (
                          <span className="ft-sys-desc">{link.description}</span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="footer-col">
              <div className="ft-col-heading">{s.newsletter.heading}</div>
              <p className="ft-newsletter-text">{s.newsletter.description}</p>
              <FooterNewsletterForm
                heading=""
                description=""
                placeholder={s.newsletter.placeholder}
                buttonLabel={s.newsletter.buttonLabel}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="ft-bottom">
        <div className="ft-bottom-inner">
          <div className="ft-bottom-left">
            <div>
              &copy; {new Date().getFullYear()} {s.bottom.orgName}. All rights reserved.
            </div>
            {s.bottom.showDeveloperCredit ? (
              <div className="ft-developer">
                <a
                  href="https://lerony.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ft-developer__brand"
                  title="Lerony — IT Technology and Innovation in Kigali"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/img/lerony_logo.png"
                    alt="Lerony"
                    className="ft-developer__logo"
                    width={88}
                    height={28}
                    loading="lazy"
                  />
                </a>
                <span>
                  Designed &amp; developed by{" "}
                  <a
                    href="https://lerony.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Lerony — IT Technology and Innovation in Kigali"
                  >
                    <strong>{s.bottom.developerCredit || "Lerony"}</strong>
                  </a>
                </span>
              </div>
            ) : null}
          </div>
          <div className="ft-bottom-links">
            {s.legalLinks.map((link, i) => (
              <Link key={`l-${i}`} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
