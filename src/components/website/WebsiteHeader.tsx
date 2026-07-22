'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X } from 'lucide-react';

import { useDonation } from '@/context/DonationContext';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { ABOUT_SECTION_NAV, aboutSectionPath, hrefToAboutAnchor } from '@/lib/about-section-nav';

type SubKey = 'about' | 'programs' | 'publications';

export default function WebsiteHeader() {
  const { isModalOpen, openModal, closeModal } = useDonation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openSub, setOpenSub] = useState<SubKey | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const tickingRef = useRef(false);

  const closeNav = useCallback(() => {
    setMobileMenuOpen(false);
    setOpenSub(null);
  }, []);

  useEffect(() => {
    closeNav();
  }, [pathname, closeNav]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeNav();
    };
    if (mobileMenuOpen) {
      document.addEventListener('keydown', onKey);
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', onKey);
        document.body.style.overflow = prev;
      };
    }
  }, [mobileMenuOpen, closeNav]);

  useEffect(() => {
    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
        tickingRef.current = false;
      });
    };
    setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /** Light-background pages need solid nav links immediately (no hero behind the bar). */
  const prefersSolidNav = Boolean(
    pathname?.startsWith('/publications/testimonies/') ||
      (pathname?.startsWith('/news/') && pathname !== '/news'),
  );
  const solidNav = scrolled || prefersSolidNav;

  const isActive = (path: string) => pathname === path;

  const toggleSub = (key: SubKey) => {
    setOpenSub((s) => (s === key ? null : key));
  };

  const goToAboutSection = (href: string) => {
    closeNav();
    const anchor = hrefToAboutAnchor(href);
    if (pathname === '/about') {
      window.location.hash = anchor;
      return;
    }
  };

  const headerClass = `site-header${solidNav ? ' scrolled' : ''}${mobileMenuOpen ? ' menu-open' : ''}`;
  const containerClass = solidNav ? 'navbar-container scrolled' : 'navbar-container';

  return (
    <header className={headerClass}>
      <div className={containerClass}>
        <Link href="/" className={solidNav ? 'logo show-scroll-logo' : 'logo'} onClick={() => { closeNav(); closeModal(); }}>
          <img src="/img/logo_caritas.webp" alt="Caritas Rwanda" className="logo-default" />
          <img src="/img/logo_bg.webp" alt="Caritas Rwanda" className="logo-scroll" />
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={mobileMenuOpen}
          aria-controls="site-primary-nav"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setMobileMenuOpen((o) => !o)}
        >
          {mobileMenuOpen ? <X size={26} strokeWidth={2} aria-hidden /> : <Menu size={26} strokeWidth={2} aria-hidden />}
        </button>

        {mobileMenuOpen && (
          <button
            type="button"
            className="nav-scrim"
            tabIndex={-1}
            aria-hidden
            onClick={closeNav}
          />
        )}

        <nav id="site-primary-nav" className={mobileMenuOpen ? 'nav--open' : undefined} aria-label="Primary">
          <ul>
            <li>
              <Link href="/" className={isActive('/') ? 'current' : ''} onClick={() => { closeNav(); closeModal(); }}>
                Home
              </Link>
            </li>

            <li className={['has-dropdown', openSub === 'about' ? 'is-expanded' : ''].filter(Boolean).join(' ')}>
              <div className="nav-item-row">
                <Link 
                  href="/about" 
                  className={isActive('/about') ? 'current' : ''} 
                  onClick={(e) => {
                    if (window.innerWidth < 1024) {
                      e.preventDefault();
                      toggleSub('about');
                    } else {
                      closeNav();
                    }
                  }}
                >
                  About Us <ChevronDown size={14} className="inline-block ml-1 opacity-60" />
                </Link>
                <button
                  type="button"
                  className="nav-submenu-toggle"
                  aria-expanded={openSub === 'about'}
                  aria-label="Toggle About submenu"
                  onClick={() => toggleSub('about')}
                >
                  <ChevronDown
                    size={18}
                    aria-hidden
                    className={openSub === 'about' ? 'rotate-180 transition-transform' : 'transition-transform'}
                  />
                </button>
              </div>
              <div className="nav-dropdown">
                <div className="nav-dropdown-inner">
                  <Link href="/about" className="md:hidden !font-bold text-[#8c2208]" onClick={closeNav}>
                    Explore All About Us
                  </Link>
                  {ABOUT_SECTION_NAV.map((item) => (
                    <Link
                      key={item.href}
                      href={aboutSectionPath(item.href)}
                      onClick={(e) => {
                        if (pathname === '/about') {
                          e.preventDefault();
                          goToAboutSection(item.href);
                        } else {
                          closeNav();
                        }
                      }}
                    >
                      <i className={`fa-solid ${item.icon.replace(/^fa-solid\s+/i, '')}`}></i>{' '}
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </li>

            <li className={['has-dropdown', openSub === 'programs' ? 'is-expanded' : ''].filter(Boolean).join(' ')}>
              <div className="nav-item-row">
                <Link
                  href="/programs"
                  className={isActive('/programs') ? 'current' : ''}
                  onClick={(e) => {
                    if (window.innerWidth < 1024) {
                      e.preventDefault();
                      toggleSub('programs');
                    } else {
                      closeNav();
                    }
                  }}
                >
                  Programs <ChevronDown size={14} className="inline-block ml-1 opacity-60" />
                </Link>
                <button
                  type="button"
                  className="nav-submenu-toggle"
                  aria-expanded={openSub === 'programs'}
                  aria-label="Toggle Programs submenu"
                  onClick={() => toggleSub('programs')}
                >
                  <ChevronDown
                    size={18}
                    aria-hidden
                    className={openSub === 'programs' ? 'rotate-180 transition-transform' : 'transition-transform'}
                  />
                </button>
              </div>
              <div className="nav-dropdown">
                <div className="nav-dropdown-inner nav-dropdown-cards">
                  <Link href="/programs#social-welfare" onClick={closeNav}>
                    <i className="fa-solid fa-people-roof"></i> Social Welfare
                  </Link>
                  <Link href="/programs#health" onClick={closeNav}>
                    <i className="fa-solid fa-heart-pulse"></i> Health
                  </Link>
                  <Link href="/programs#development" onClick={closeNav}>
                    <i className="fa-solid fa-seedling"></i> Development
                  </Link>
                  <Link href="/programs#finance-administration" onClick={closeNav}>
                    <i className="fa-solid fa-building-columns"></i> Finance &amp; Administration
                  </Link>
                </div>
              </div>
            </li>

            <li>
              <Link href="/news" onClick={closeNav}>
                News &amp; Updates
              </Link>
            </li>

            {/* <li>
              <Link href="/diocesan" className={isActive('/diocesan') ? 'current' : ''} onClick={closeNav}>
                Diocesan Caritas
              </Link>
            </li> */}

            <li className={['has-dropdown', openSub === 'publications' ? 'is-expanded' : ''].filter(Boolean).join(' ')}>
              <div className="nav-item-row">
                <Link
                  href="/publications"
                  className={isActive('/publications') ? 'current' : ''}
                  onClick={(e) => {
                    if (window.innerWidth < 1024) {
                      e.preventDefault();
                      toggleSub('publications');
                    } else {
                      closeNav();
                    }
                  }}
                >
                  Publications <ChevronDown size={14} className="inline-block ml-1 opacity-60" />
                </Link>
                <button
                  type="button"
                  className="nav-submenu-toggle"
                  aria-expanded={openSub === 'publications'}
                  aria-label="Toggle Publications submenu"
                  onClick={() => toggleSub('publications')}
                >
                  <ChevronDown
                    size={18}
                    aria-hidden
                    className={openSub === 'publications' ? 'rotate-180 transition-transform' : 'transition-transform'}
                  />
                </button>
              </div>
              <div className="nav-dropdown">
                <div className="nav-dropdown-inner">
                  <Link href="/publications#annual-reports" onClick={closeNav}>
                    <i className="fa-solid fa-chart-bar"></i> Annual Reports
                  </Link>
                  <Link href="/publications#newsletters" onClick={closeNav}>
                    <i className="fa-solid fa-newspaper"></i> Newsletters
                  </Link>
                  <Link href="/publications#caritas-contact" onClick={closeNav}>
                    <i className="fa-solid fa-download"></i> Caritas Contact
                  </Link>
                  <Link href="/publications#policies" onClick={closeNav}>
                    <i className="fa-solid fa-file-lines"></i> Policies
                  </Link>
                  <Link href="/publications#testimonies" onClick={closeNav}>
                    <i className="fa-solid fa-user"></i> Testimonies
                  </Link>
                  <div className="nav-dropdown-divider"></div>
                  <Link href="/publications#strategic" onClick={closeNav}>
                    <i className="fa-solid fa-map"></i> Strategic Plan
                  </Link>
                </div>
              </div>
            </li>

            <li>
              <Link href="/metrics" className={isActive('/metrics') ? 'current' : ''} onClick={closeNav}>
                Impact Metrics
              </Link>
            </li>

            <li>
              <Link href="/contact" onClick={closeNav}>
                Contact Us
              </Link>
            </li>
          </ul>
          <div className="nav-cta-group">
            <LanguageSwitcher variant="compact" />
            <button
              type="button"
              onClick={() => {
                closeNav();
                if (isModalOpen) {
                  closeModal();
                } else {
                  openModal();
                }
              }}
              className="btn btn-donate nav-donate"
            >
              Donate
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
