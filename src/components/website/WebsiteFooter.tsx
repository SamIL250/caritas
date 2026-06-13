'use client';

import Link from 'next/link';
import { useDonation } from '@/context/DonationContext';
import { FOOTER_DEFAULTS, type FooterSettings } from '@/lib/footer-settings';
import { isExternalOrSpecialHref } from '@/lib/footer-nav';
import FooterNewsletterForm from '@/components/website/FooterNewsletterForm';

const DEFAULT_LOGO = '/img/logo_caritas.webp';

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
    { key: 'twitter', icon: 'fa-brands fa-x-twitter', label: 'X (Twitter)' },
    { key: 'youtube', icon: 'fab fa-youtube', label: 'YouTube' },
    { key: 'facebook', icon: 'fab fa-facebook-f', label: 'Facebook' },
    { key: 'linkedin', icon: 'fab fa-linkedin-in', label: 'LinkedIn' },
    { key: 'flickr', icon: 'fab fa-flickr', label: 'Flickr' },
  ];

  return (
    <footer className="website-footer">
      <div className="ft-blob-1" />
      <div className="ft-blob-2" />

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
              <div className="ft-chip-label">Headquarters</div>
              <div className="ft-chip-value">Kigali, Rwanda</div>
            </div>
          </div>
          <div className="ft-chip">
            <div className="ft-chip-icon">
              <i className="fa-solid fa-phone" />
            </div>
            <div>
              <div className="ft-chip-label">Phone</div>
              <div className="ft-chip-value">(+250) 252 574 34</div>
            </div>
          </div>
          <div className="ft-chip">
            <div className="ft-chip-icon">
              <i className="fa-solid fa-envelope" />
            </div>
            <div>
              <div className="ft-chip-label">Email</div>
              <div className="ft-chip-value">info@caritasrwanda.org</div>
            </div>
          </div>
        </div>

        <div className="footer-col">
          <div className="ft-col-heading">Stay Updated</div>
          <p className="ft-newsletter-text">
            Subscribe to our newsletter and get the latest stories, program updates, and impact reports delivered to your inbox.
          </p>
          <FooterNewsletterForm
            heading=""
            description=""
            placeholder="your@email.com"
            buttonLabel="Subscribe"
          />
        </div>
      </div>

      <div className="ft-bottom">
        <div className="ft-bottom-inner">
          <div className="ft-bottom-left">
            <div>&copy; {new Date().getFullYear()} Caritas Rwanda. All rights reserved.</div>
            <div className="ft-developer">
              Designed &amp; developed by <a href="https://lerony.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}><strong>Lerony</strong></a>
            </div>
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
