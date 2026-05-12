'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X } from 'lucide-react';

import { useDonation } from '@/context/DonationContext';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';

type SubKey = 'about' | 'programs' | 'publications';

export default function WebsiteHeader() {
  const { openModal } = useDonation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openSub, setOpenSub] = useState<SubKey | null>(null);
  const pathname = usePathname();

  const closeNav = useCallback(() => {
    setMobileMenuOpen(false);
    setOpenSub(null);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  const isActive = (path: string) => pathname === path;

  const toggleSub = (key: SubKey) => {
    setOpenSub((s) => (s === key ? null : key));
  };

  const navClass = ['navbar-container', scrolled && 'scrolled'].filter(Boolean).join(' ');

  return (
    <header className={['site-header', scrolled && 'scrolled'].filter(Boolean).join(' ')}>
      <div className={navClass}>
        <Link
          href="/"
          className={['logo', scrolled && 'show-scroll-logo'].filter(Boolean).join(' ')}
          onClick={closeNav}
        >
          <img src="/img/logo_caritas.png" alt="Caritas Rwanda" className="logo-default" />
          <img src="/img/logo_bg.png" alt="" className="logo-scroll" aria-hidden />
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
              <Link href="/" className={isActive('/') ? 'current' : ''} onClick={closeNav}>
                Home
              </Link>
            </li>

            <li className={['has-dropdown', openSub === 'about' ? 'is-expanded' : ''].filter(Boolean).join(' ')}>
              <div className="nav-item-row">
                <Link href="/about" className={isActive('/about') ? 'current' : ''} onClick={closeNav}>
                  About Us <span className="caret">▾</span>
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
                  <Link href="/about#history" onClick={closeNav}>
                    <i className="fa-solid fa-clock-rotate-left"></i> History
                  </Link>
                  <Link href="/about#mission" onClick={closeNav}>
                    <i className="fa-solid fa-bullseye"></i> Mission
                  </Link>
                  <Link href="/about#vision" onClick={closeNav}>
                    <i className="fa-solid fa-eye"></i> Vision
                  </Link>
                  <Link href="/about#values" onClick={closeNav}>
                    <i className="fa-solid fa-star"></i> Values
                  </Link>
                  <div className="nav-dropdown-divider"></div>
                  <Link href="/about#network" onClick={closeNav}>
                    <i className="fa-solid fa-network-wired"></i> Network
                  </Link>
                  <Link href="/about#dioceses" onClick={closeNav}>
                    <i className="fa-solid fa-church"></i> All Dioceses
                  </Link>
                </div>
              </div>
            </li>

            <li className={['has-dropdown', openSub === 'programs' ? 'is-expanded' : ''].filter(Boolean).join(' ')}>
              <div className="nav-item-row">
                <Link
                  href="/programs"
                  className={isActive('/programs') ? 'current' : ''}
                  onClick={closeNav}
                >
                  Programs <span className="caret">▾</span>
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
                News
              </Link>
            </li>
            <li>
              <Link href="/get-involved" onClick={closeNav}>
                Get Involved
              </Link>
            </li>

            <li className={['has-dropdown', openSub === 'publications' ? 'is-expanded' : ''].filter(Boolean).join(' ')}>
              <div className="nav-item-row">
                <Link href="/publications" className={isActive('/publications') ? 'current' : ''} onClick={closeNav}>
                  Publications <span className="caret">▾</span>
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
                  <Link href="/publications#strategic" onClick={closeNav}>
                    <i className="fa-solid fa-chart-line"></i> Our Impact
                  </Link>
                  <Link href="/publications#success-stories" onClick={closeNav}>
                    <i className="fa-solid fa-quote-left"></i> Stories &amp; Testimonies
                  </Link>
                  <div className="nav-dropdown-divider"></div>
                  <Link href="/publications#annual-reports" onClick={closeNav}>
                    <i className="fa-solid fa-file-lines"></i> Annual Reports
                  </Link>
                  <Link href="/publications#newsletters" onClick={closeNav}>
                    <i className="fa-solid fa-book-open"></i> Training Resources
                  </Link>
                  <Link href="/publications#latest-news" onClick={closeNav}>
                    <i className="fa-solid fa-gavel"></i> Tenders
                  </Link>
                </div>
              </div>
            </li>

            <li>
              <a href="#contact" onClick={closeNav}>
                Contact
              </a>
            </li>
          </ul>
          <div className="nav-cta-group">
            <LanguageSwitcher variant="compact" />
            <button
              type="button"
              onClick={() => {
                closeNav();
                openModal();
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
