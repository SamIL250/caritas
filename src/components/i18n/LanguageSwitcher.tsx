"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import {
  PAGE_LANGUAGE,
  applyTranslateLocale,
  canonicalTranslateLangCode,
  getActiveTranslateLocaleClient,
  getAllTranslateSearchRows,
  isKnownSearchLangCode,
  languageLabelEn,
  looksLikeLangTag,
  normalizeTypedLangCode,
} from "@/lib/google-translate";
import { languageFlagEmoji } from "@/lib/language-flag-emoji";
import "./language-switcher.css";

type Variant = "header" | "compact";

function codesMatch(a: string, b: string): boolean {
  return canonicalTranslateLangCode(a).toLowerCase() === canonicalTranslateLangCode(b).toLowerCase();
}

function LangFlag({ code }: { code: string }) {
  return (
    <span className="lang-switch__flag-ring" aria-hidden>
      <span className="lang-switch__flag-emoji">{languageFlagEmoji(code)}</span>
    </span>
  );
}

export default function LanguageSwitcher({ variant = "header" }: { variant?: Variant }) {
  const [currentCode, setCurrentCode] = useState<string>(PAGE_LANGUAGE);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const allRows = useMemo(() => getAllTranslateSearchRows(), []);

  /* eslint-disable react-hooks/set-state-in-effect -- googtrans cookie is only available after mount */
  useEffect(() => {
    setCurrentCode(getActiveTranslateLocaleClient());
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!open) return;
    const t = window.requestAnimationFrame(() => {
      searchRef.current?.focus({ preventScroll: true });
    });
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      window.cancelAnimationFrame(t);
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allRows;
    const compact = q.replace(/\s+/g, "");
    return allRows.filter(
      (r) => r.label.toLowerCase().includes(q) || r.code.toLowerCase().includes(compact),
    );
  }, [query, allRows]);

  const typedSuggestion = useMemo(() => {
    const raw = query.trim();
    if (!looksLikeLangTag(raw)) return null;
    const norm = normalizeTypedLangCode(raw);
    if (!norm || norm.toLowerCase() === PAGE_LANGUAGE) return null;
    if (filteredRows.some((r) => codesMatch(r.code, norm))) return null;
    return norm;
  }, [query, filteredRows]);

  const unknownActive =
    currentCode !== PAGE_LANGUAGE && !isKnownSearchLangCode(currentCode);

  function pick(code: string) {
    const next = code.trim();
    if (!next) {
      setOpen(false);
      return;
    }
    if (next.toLowerCase() === PAGE_LANGUAGE && currentCode === PAGE_LANGUAGE) {
      setOpen(false);
      return;
    }
    if (codesMatch(next, currentCode)) {
      setOpen(false);
      return;
    }
    setBusy(true);
    applyTranslateLocale(next);
  }

  const currentDisplay =
    currentCode === PAGE_LANGUAGE ? "English" : languageLabelEn(currentCode);
  const currentParen =
    currentCode === PAGE_LANGUAGE ? PAGE_LANGUAGE.toUpperCase() : currentCode;

  return (
    <div ref={wrapRef} className={`lang-switch lang-switch--${variant} notranslate`} translate="no">
      <button
        type="button"
        className="lang-switch__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
        data-open={open ? "true" : undefined}
        onClick={() =>
          setOpen((o) => {
            const next = !o;
            if (next) setQuery("");
            return next;
          })
        }
        disabled={busy}
      >
        <LangFlag code={currentCode === PAGE_LANGUAGE ? "en" : currentCode} />
        <span className="lang-switch__trigger-text">
          <span className="lang-switch__trigger-name">{currentDisplay}</span>
          <span className="lang-switch__trigger-paren"> ({currentParen})</span>
        </span>
        <ChevronDown
          size={16}
          aria-hidden
          className={`lang-switch__chev ${open ? "is-open" : ""}`}
        />
      </button>

      {open ? (
        <div className="lang-switch__popover">
          <div className="lang-switch__search-row">
            <Search size={15} className="lang-switch__search-icon" aria-hidden />
            <input
              ref={searchRef}
              type="search"
              className="lang-switch__search"
              placeholder="Search language or code (e.g. Danish, da, zh-CN)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              aria-label="Search languages"
            />
          </div>

          <ul className="lang-switch__menu lang-switch__menu--scroll" role="listbox" aria-label="Languages">
            <li role="none">
              <button
                type="button"
                role="option"
                className={`lang-switch__option ${currentCode === PAGE_LANGUAGE ? "is-active" : ""}`}
                aria-selected={currentCode === PAGE_LANGUAGE}
                onClick={() => pick(PAGE_LANGUAGE)}
                disabled={busy}
              >
                <LangFlag code="en" />
                <span className="lang-switch__option-body">
                  <span className="lang-switch__option-line">
                    <span className="lang-switch__option-name">English</span>
                    <span className="lang-switch__option-paren"> ({PAGE_LANGUAGE})</span>
                  </span>
                  <span className="lang-switch__option-hint">Original site language</span>
                </span>
                {currentCode === PAGE_LANGUAGE ? (
                  <Check size={15} aria-hidden className="lang-switch__check" />
                ) : (
                  <span className="lang-switch__check-slot" aria-hidden />
                )}
              </button>
            </li>

            {unknownActive ? (
              <li role="none">
                <button
                  type="button"
                  role="option"
                  className="lang-switch__option is-active"
                  aria-selected={true}
                  onClick={() => pick(currentCode)}
                  disabled={busy}
                >
                  <LangFlag code={currentCode} />
                  <span className="lang-switch__option-body">
                    <span className="lang-switch__option-line">
                      <span className="lang-switch__option-name">{languageLabelEn(currentCode)}</span>
                      <span className="lang-switch__option-paren"> ({currentCode})</span>
                    </span>
                    <span className="lang-switch__option-hint">Current translation</span>
                  </span>
                  <Check size={15} aria-hidden className="lang-switch__check" />
                </button>
              </li>
            ) : null}

            {typedSuggestion ? (
              <li role="none">
                <button
                  type="button"
                  role="option"
                  className="lang-switch__option lang-switch__option--accent"
                  aria-selected={false}
                  onClick={() => pick(typedSuggestion)}
                  disabled={busy}
                >
                  <LangFlag code={typedSuggestion} />
                  <span className="lang-switch__option-body">
                    <span className="lang-switch__option-line">
                      <span className="lang-switch__option-name">{languageLabelEn(typedSuggestion)}</span>
                      <span className="lang-switch__option-paren"> ({typedSuggestion})</span>
                    </span>
                    <span className="lang-switch__option-hint">Use typed language code</span>
                  </span>
                  <span className="lang-switch__check-slot" aria-hidden />
                </button>
              </li>
            ) : null}

            {filteredRows.map((row) => {
              const active = codesMatch(row.code, currentCode);
              return (
                <li key={row.code} role="none">
                  <button
                    type="button"
                    role="option"
                    className={`lang-switch__option ${active ? "is-active" : ""}`}
                    aria-selected={active}
                    onClick={() => pick(row.code)}
                    disabled={busy}
                  >
                    <LangFlag code={row.code} />
                    <span className="lang-switch__option-body">
                      <span className="lang-switch__option-line">
                        <span className="lang-switch__option-name">{row.label}</span>
                        <span className="lang-switch__option-paren"> ({row.code})</span>
                      </span>
                    </span>
                    {active ? (
                      <Check size={15} aria-hidden className="lang-switch__check" />
                    ) : (
                      <span className="lang-switch__check-slot" aria-hidden />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
