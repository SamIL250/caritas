'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { CookieConsentSettings, ConsentChoice } from '@/lib/cookie-consent';
import { COOKIE_CONSENT_COOKIE_NAME } from '@/lib/cookie-consent';
import './cookie-consent-banner.css';

function setConsentCookie(choice: Omit<ConsentChoice, 'timestamp'>, expiryDays: number) {
  const value: ConsentChoice = { ...choice, timestamp: new Date().toISOString() };
  const expires = new Date(Date.now() + expiryDays * 86400000).toUTCString();
  document.cookie = `${COOKIE_CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(value))}; expires=${expires}; path=/; SameSite=Lax`;
}

function getConsentCookie(): ConsentChoice | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_CONSENT_COOKIE_NAME}=([^;]*)`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1])) as ConsentChoice;
  } catch {
    return null;
  }
}

export default function CookieConsentBanner({
  settings,
}: {
  settings: CookieConsentSettings;
}) {
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const existing = getConsentCookie();
    if (!existing && settings.enabled) {
      setVisible(true);
      requestAnimationFrame(() => setAnimating(true));
    }
  }, [settings.enabled]);

  const handleAccept = useCallback(() => {
    setConsentCookie({ necessary: true, analytics: true, marketing: true }, settings.consent_expiry_days);
    setAnimating(false);
    setTimeout(() => setVisible(false), 300);
  }, [settings.consent_expiry_days]);

  const handleDeny = useCallback(() => {
    setConsentCookie({ necessary: true, analytics: false, marketing: false }, settings.consent_expiry_days);
    setAnimating(false);
    setTimeout(() => setVisible(false), 300);
  }, [settings.consent_expiry_days]);

  const handleSaveCustom = useCallback(() => {
    setConsentCookie({ necessary: true, analytics, marketing }, settings.consent_expiry_days);
    setShowCustomize(false);
    setAnimating(false);
    setTimeout(() => setVisible(false), 300);
  }, [analytics, marketing, settings.consent_expiry_days]);

  if (!visible) return null;

  const positionClass = settings.position === 'top' ? 'ccb-top' : settings.position === 'bottom-left' ? 'ccb-bottom-left' : settings.position === 'bottom-right' ? 'ccb-bottom-right' : 'ccb-bottom';
  const themeClass = settings.theme === 'light' ? 'ccb-light' : 'ccb-dark';

  return (
    <>
      {settings.show_overlay && (
        <div className={`ccb-overlay ${animating ? 'ccb-overlay-open' : ''} ${showCustomize ? 'ccb-overlay-visible' : ''}`} onClick={() => setShowCustomize(false)} />
      )}

      <div className={`ccb-banner ${positionClass} ${themeClass} ${animating ? 'ccb-banner-open' : ''}`}>
        <div className="ccb-content">
          <div className="ccb-header">
            <div className="ccb-icon"><i className="fa-solid fa-shield-halved"></i></div>
            <div>
              <h3 className="ccb-title">{settings.banner_title}</h3>
              <p className="ccb-desc">{settings.banner_description}</p>
            </div>
          </div>
          <div className="ccb-actions">
            <div className="ccb-buttons">
              <button type="button" className="ccb-btn ccb-btn-accept" onClick={handleAccept}>
                <i className="fa-solid fa-check"></i> {settings.accept_label}
              </button>
              <button type="button" className="ccb-btn ccb-btn-deny" onClick={handleDeny}>
                <i className="fa-solid fa-xmark"></i> {settings.deny_label}
              </button>
              <button type="button" className="ccb-btn ccb-btn-customize" onClick={() => setShowCustomize(true)}>
                <i className="fa-solid fa-sliders"></i> {settings.customize_label}
              </button>
            </div>
            <div className="ccb-links">
              <Link href={settings.privacy_page_url} className="ccb-link" target="_blank">
                <i className="fa-solid fa-file-lines"></i> Privacy Policy
              </Link>
              <Link href={settings.cookie_policy_page_url} className="ccb-link" target="_blank">
                <i className="fa-solid fa-cookie-bite"></i> Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showCustomize && (
        <div className={`ccb-modal ${showCustomize ? 'ccb-modal-open' : ''}`} role="dialog" aria-modal="true" aria-label="Cookie Preferences">
          <div className="ccb-modal-card">
            <button className="ccb-modal-close" onClick={() => setShowCustomize(false)} aria-label="Close">
              <i className="fa-solid fa-xmark"></i>
            </button>
            <h3 className="ccb-modal-title"><i className="fa-solid fa-sliders"></i> Cookie Preferences</h3>
            <p className="ccb-modal-desc">Customize which cookies you allow on this website.</p>

            <div className="ccb-categories">
              <div className="ccb-category ccb-category-disabled">
                <div className="ccb-category-head">
                  <div>
                    <span className="ccb-category-name"><i className="fa-solid fa-shield"></i> Necessary</span>
                    <span className="ccb-category-desc">Required for basic site functionality. Cannot be disabled.</span>
                  </div>
                  <span className="ccb-category-toggle ccb-toggle-on"><i className="fa-solid fa-check"></i></span>
                </div>
              </div>

              {settings.analytics_cookies.length > 0 && (
                <div className="ccb-category">
                  <div className="ccb-category-head">
                    <div>
                      <span className="ccb-category-name"><i className="fa-solid fa-chart-line"></i> Analytics</span>
                      <span className="ccb-category-desc">Help us understand how visitors interact with our site.</span>
                    </div>
                    <button
                      type="button"
                      className={`ccb-category-toggle ${analytics ? 'ccb-toggle-on' : 'ccb-toggle-off'}`}
                      onClick={() => setAnalytics(!analytics)}
                      aria-label={`Toggle analytics cookies ${analytics ? 'off' : 'on'}`}
                    >
                      {analytics ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-xmark"></i>}
                    </button>
                  </div>
                </div>
              )}

              {settings.marketing_cookies.length > 0 && (
                <div className="ccb-category">
                  <div className="ccb-category-head">
                    <div>
                      <span className="ccb-category-name"><i className="fa-solid fa-bullseye"></i> Marketing</span>
                      <span className="ccb-category-desc">Used to deliver relevant advertisements and track campaigns.</span>
                    </div>
                    <button
                      type="button"
                      className={`ccb-category-toggle ${marketing ? 'ccb-toggle-on' : 'ccb-toggle-off'}`}
                      onClick={() => setMarketing(!marketing)}
                      aria-label={`Toggle marketing cookies ${marketing ? 'off' : 'on'}`}
                    >
                      {marketing ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-xmark"></i>}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="ccb-modal-actions">
              <button type="button" className="ccb-btn ccb-btn-accept" onClick={handleSaveCustom}>
                <i className="fa-solid fa-check"></i> Save Preferences
              </button>
              <button type="button" className="ccb-btn ccb-btn-deny" onClick={handleAccept}>
                <i className="fa-solid fa-check"></i> Accept All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
