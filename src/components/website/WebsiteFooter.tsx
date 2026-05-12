'use client';

import Link from 'next/link';
import { useDonation } from '@/context/DonationContext';
import { FOOTER_DEFAULTS, type FooterSettings } from '@/lib/footer-settings';
import { isExternalOrSpecialHref } from '@/lib/footer-nav';
import FooterNewsletterForm from '@/components/website/FooterNewsletterForm';

const DEFAULT_LOGO = '/img/logo_caritas.png';

type WebsiteFooterProps = {
  settings?: FooterSettings;
};

function NavOrExternal({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (isExternalOrSpecialHref(href)) {
    return (
      <a
        href={href}
        className={className}
        target={href.startsWith('mailto:') || href.startsWith('tel:') ? undefined : '_blank'}
        rel={href.startsWith('mailto:') || href.startsWith('tel:') ? undefined : 'noopener noreferrer'}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export default function WebsiteFooter({ settings: settingsProp }: WebsiteFooterProps) {
  const { openModal } = useDonation();
  const s = settingsProp ?? FOOTER_DEFAULTS;
  const logoSrc = (s.brand.logoUrl && s.brand.logoUrl.trim()) || DEFAULT_LOGO;

  const socialEntries: { key: keyof FooterSettings['social']; icon: string; label: string }[] = [
    { key: 'twitter', icon: 'fab fa-twitter', label: 'Twitter' },
    { key: 'youtube', icon: 'fab fa-youtube', label: 'YouTube' },
    { key: 'facebook', icon: 'fab fa-facebook-f', label: 'Facebook' },
    { key: 'linkedin', icon: 'fab fa-linkedin-in', label: 'LinkedIn' },
    { key: 'flickr', icon: 'fab fa-flickr', label: 'Flickr' },
  ];

  return (
    <footer className="website-footer">
      <div className="footer-banner">
        <div className="footer-banner-inner">
          <div className="footer-banner-tagline">
            {s.banner.lineBefore}
            <span>{s.banner.accent}</span>
            {s.banner.lineAfter}
          </div>
          <Link href={s.banner.ctaHref} className="footer-banner-cta">
            <i className="fa-solid fa-envelope" aria-hidden />
            {s.banner.ctaLabel}
          </Link>
        </div>
      </div>

      <div className="container-wide">
        <div className="footer-grid">
          <div className="footer-col">
            <img
              src={logoSrc}
              alt={s.bottom.orgName}
              className="footer-logo"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <p className="footer-tagline">{s.brand.mission}</p>
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
                    <i className={icon} />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="footer-col">
            <div className="ft-col-heading">Quick Links</div>
            <ul className="ft-links">
              {s.quickLinks.map((item, i) => (
                <li key={`q-${i}`}>
                  {item.behavior === 'donate' ? (
                    <button type="button" onClick={() => openModal()} className="ft-link-btn">
                      {item.label}
                    </button>
                  ) : (
                    <NavOrExternal href={item.href}>{item.label}</NavOrExternal>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <div className="ft-col-heading">{s.programColumn.heading}</div>
            <ul className="ft-links">
              {s.programColumn.links.map((item, i) => (
                <li key={`p-${i}`}>
                  <NavOrExternal href={item.href}>{item.label}</NavOrExternal>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <FooterNewsletterForm
              heading={s.newsletter.heading}
              description={s.newsletter.description}
              placeholder={s.newsletter.placeholder}
              buttonLabel={s.newsletter.buttonLabel}
            />
          </div>
        </div>

        <div className="ft-contact-bar">
          <div className="ft-contact-chips">
            <div className="ft-chip">
              <div className="ft-chip-icon">
                <i className="fa-solid fa-location-dot" aria-hidden />
              </div>
              <div>
                <div className="ft-chip-label">{s.contact.addressLabel}</div>
                <div className="ft-chip-value">{s.contact.address}</div>
              </div>
            </div>
            <div className="ft-chip">
              <div className="ft-chip-icon">
                <i className="fa-solid fa-phone" aria-hidden />
              </div>
              <div>
                <div className="ft-chip-label">{s.contact.phoneLabel}</div>
                <div className="ft-chip-value">{s.contact.phone}</div>
              </div>
            </div>
            <div className="ft-chip">
              <div className="ft-chip-icon">
                <i className="fa-solid fa-envelope" aria-hidden />
              </div>
              <div>
                <div className="ft-chip-label">{s.contact.emailLabel}</div>
                <div className="ft-chip-value">
                  <a href={`mailto:${s.contact.email}`}>{s.contact.email}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="ft-bottom">
        <div className="container-wide">
          <div className="ft-bottom-inner">
            <div className="ft-bottom-left">
              <div>
                &copy; {new Date().getFullYear()} {s.bottom.orgName}. All rights reserved.
              </div>
              {s.bottom.showDeveloperCredit && s.bottom.developerCredit.trim() ? (
                <div className="ft-developer">
                  Designed & developed by <strong>{s.bottom.developerCredit}</strong>
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
      </div>
    </footer>
  );
}
