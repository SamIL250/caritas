'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X } from 'lucide-react';

import { useDonation } from '@/context/DonationContext';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';

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

  const isActive = (path: string) => pathname === path;

  const toggleSub = (key: SubKey) => {
    setOpenSub((s) => (s === key ? null : key));
  };

  const headerClass = `site-header${scrolled ? ' scrolled' : ''}${mobileMenuOpen ? ' menu-open' : ''}`;
  const containerClass = scrolled ? 'navbar-container scrolled' : 'navbar-container';

  return (
    <header className={headerClass}>
      <div className={containerClass}>
        <Link href="/" className={scrolled ? 'logo show-scroll-logo' : 'logo'} onClick={() => { closeNav(); closeModal(); }}>
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
                  About Us
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
                  onClick={(e) => {
                    if (window.innerWidth < 1024) {
                      e.preventDefault();
                      toggleSub('programs');
                    } else {
                      closeNav();
                    }
                  }}
                >
                  Programs
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
                  <Link href="/programs" className="md:hidden !font-bold text-[#8c2208]" onClick={closeNav}>
                    Explore All Programs
                  </Link>
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

            <li>
              <Link href="/metrics" className={isActive('/metrics') ? 'current' : ''} onClick={closeNav}>
                Metrics
              </Link>
            </li>

            {/* <li>
              <Link href="/get-involved" className={isActive('/get-involved') ? 'current' : ''} onClick={closeNav}>
                Get Involved
              </Link>
            </li> */}

            <li>
              <Link href="/publications" className={isActive('/publications') ? 'current' : ''} onClick={closeNav}>
                Publications
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
