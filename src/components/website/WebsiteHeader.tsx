'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X } from 'lucide-react';

import { useDonation } from '@/context/DonationContext';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { ABOUT_SECTION_NAV, aboutSectionPath, hrefToAboutAnchor } from '@/lib/about-section-nav';
import { replaceProgramsHash } from '@/lib/programs-hash';
import NavMegaMenu from '@/components/website/NavMegaMenu';
import type { NavMegaMenuData } from '@/lib/nav-mega-menu-data';

type SubKey = 'about' | 'programs' | 'publications';

const PROGRAMS_NAV_ITEMS = [
  { slug: "social-welfare", label: "Social Welfare", icon: "fa-people-roof" },
  { slug: "health", label: "Health", icon: "fa-heart-pulse" },
  { slug: "development", label: "Development", icon: "fa-seedling" },
  { slug: "finance-administration", label: "Finance & Administration", icon: "fa-building-columns" },
] as const;

type Props = {
  navMegaMenu: NavMegaMenuData;
};

export default function WebsiteHeader({ navMegaMenu }: Props) {
  const { isModalOpen, openModal, closeModal } = useDonation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openSub, setOpenSub] = useState<SubKey | null>(null);
  const [suppressDropdowns, setSuppressDropdowns] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const tickingRef = useRef(false);

  const closeNav = useCallback(() => {
    setMobileMenuOpen(false);
    setOpenSub(null);
    setSuppressDropdowns(true);
  }, []);

  useEffect(() => {
    closeNav();
  }, [pathname, closeNav]);

  useEffect(() => {
    const onHashChange = () => closeNav();
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [closeNav]);

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

  const goToProgramsSection = (slug: string) => {
    closeNav();
    if (pathname === '/programs') {
      replaceProgramsHash(slug);
    }
  };

  const headerClass = `site-header site-header--light${solidNav ? ' scrolled' : ''}${mobileMenuOpen ? ' menu-open' : ''}${suppressDropdowns ? ' nav-dropdowns-suppressed' : ''}`;
  const containerClass = `navbar-container${solidNav ? ' scrolled' : ''}`;

  return (
    <header className={headerClass}>
      <div className={containerClass}>
        <Link href="/" className="logo show-scroll-logo" onClick={() => { closeNav(); closeModal(); }}>
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

        <nav
          id="site-primary-nav"
          className={mobileMenuOpen ? 'nav--open' : undefined}
          aria-label="Primary"
          onMouseLeave={() => setSuppressDropdowns(false)}
        >
          <ul>
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
                  What We Do <ChevronDown size={14} className="nav-inline-caret inline-block ml-1 opacity-60" />
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
                  {PROGRAMS_NAV_ITEMS.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/programs#${item.slug}`}
                      className="nav-mega-category"
                      onClick={(e) => {
                        if (pathname === "/programs") {
                          e.preventDefault();
                          goToProgramsSection(item.slug);
                          return;
                        }
                        closeNav();
                      }}
                    >
                      <span className="nav-mega-category-icon" aria-hidden>
                        <i className={`fa-solid ${item.icon}`} />
                      </span>
                      <span className="nav-mega-category-label">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </li>

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
