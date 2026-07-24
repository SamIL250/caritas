'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X } from 'lucide-react';

import { useDonation } from '@/context/DonationContext';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { ABOUT_SECTION_NAV, aboutSectionPath, hrefToAboutAnchor } from '@/lib/about-section-nav';
import NavMegaMenu from '@/components/website/NavMegaMenu';
import type { NavMegaMenuData } from '@/lib/nav-mega-menu-data';

type SubKey = 'about' | 'programs' | 'news' | 'publications';

type Props = {
  navMegaMenu: NavMegaMenuData;
};

export default function WebsiteHeader({ navMegaMenu }: Props) {
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
      pathname?.startsWith('/publications/') ||
      (pathname?.startsWith('/news/') && pathname !== '/news') ||
      pathname === '/news',
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
                  About Us <ChevronDown size={14} className="nav-inline-caret inline-block ml-1 opacity-60" />
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
                <div className="nav-dropdown-inner nav-sub-menu">
                  {ABOUT_SECTION_NAV.map((item) => (
                    <Link
                      key={item.href}
                      href={aboutSectionPath(item.href)}
                      className="nav-mega-category"
                      onClick={(e) => {
                        if (pathname === '/about') {
                          e.preventDefault();
                          goToAboutSection(item.href);
                        } else {
                          closeNav();
                        }
                      }}
                    >
                      <span className="nav-mega-category-icon" aria-hidden>
                        <i className={`fa-solid ${item.icon}`} />
                      </span>
                      <span className="nav-mega-category-label">{item.label}</span>
                    </Link>
                  ))}
                  <Link href="/about" className="nav-mega-view-all" onClick={closeNav}>
                    View all about us
                    <i className="fa-solid fa-arrow-right" aria-hidden />
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
                  Programs <ChevronDown size={14} className="nav-inline-caret inline-block ml-1 opacity-60" />
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
                <div className="nav-dropdown-inner nav-sub-menu">
                  <Link href="/programs#social-welfare" className="nav-mega-category" onClick={closeNav}>
                    <span className="nav-mega-category-icon" aria-hidden>
                      <i className="fa-solid fa-people-roof" />
                    </span>
                    <span className="nav-mega-category-label">Social Welfare</span>
                  </Link>
                  <Link href="/programs#health" className="nav-mega-category" onClick={closeNav}>
                    <span className="nav-mega-category-icon" aria-hidden>
                      <i className="fa-solid fa-heart-pulse" />
                    </span>
                    <span className="nav-mega-category-label">Health</span>
                  </Link>
                  <Link href="/programs#development" className="nav-mega-category" onClick={closeNav}>
                    <span className="nav-mega-category-icon" aria-hidden>
                      <i className="fa-solid fa-seedling" />
                    </span>
                    <span className="nav-mega-category-label">Development</span>
                  </Link>
                  <Link href="/programs#finance-administration" className="nav-mega-category" onClick={closeNav}>
                    <span className="nav-mega-category-icon" aria-hidden>
                      <i className="fa-solid fa-building-columns" />
                    </span>
                    <span className="nav-mega-category-label">Finance &amp; Administration</span>
                  </Link>
                  <Link href="/programs" className="nav-mega-view-all" onClick={closeNav}>
                    View all programs
                    <i className="fa-solid fa-arrow-right" aria-hidden />
                  </Link>
                </div>
              </div>
            </li>

            <NavMegaMenu
              menuKey="news"
              label="News & Updates"
              href="/news"
              isActive={isActive('/news') || Boolean(pathname?.startsWith('/news/'))}
              categories={navMegaMenu.news}
              isExpanded={openSub === 'news'}
              onToggle={() => toggleSub('news')}
              onCloseNav={closeNav}
            />

            {/* <li>
              <Link href="/diocesan" className={isActive('/diocesan') ? 'current' : ''} onClick={closeNav}>
                Diocesan Caritas
              </Link>
            </li> */}

            <NavMegaMenu
              menuKey="publications"
              label="Publications"
              href="/publications"
              isActive={isActive('/publications') || Boolean(pathname?.startsWith('/publications/'))}
              categories={navMegaMenu.publications}
              isExpanded={openSub === 'publications'}
              onToggle={() => toggleSub('publications')}
              onCloseNav={closeNav}
            />

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
