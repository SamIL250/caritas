"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { faSolidIconClass } from "@/lib/fontawesome";

import type { DioceseCard } from "./diocese-network-types";

function isSpecialDiocese(d: DioceseCard): boolean {
  if (Boolean(d.special)) return true;
  const ic = typeof d.icon === "string" ? d.icon.toLowerCase() : "";
  return Boolean(d.highlight && ic.includes("star"));
}

function padDioceseNum(index: number, raw?: string): string {
  const t = typeof raw === "string" ? raw.trim() : "";
  if (/^\d{1,2}$/.test(t)) return t.padStart(2, "0");
  return String(index + 1).padStart(2, "0");
}

function opensInNewTab(href: string): boolean {
  const t = href.trim();
  return (
    /^https?:\/\//i.test(t) ||
    t.startsWith("//") ||
    t.startsWith("mailto:") ||
    t.startsWith("tel:")
  );
}

function trimStr(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function hasModalContent(d: DioceseCard): boolean {
  const m = d.modal;
  if (!m || typeof m !== "object") return false;
  const keys = [
    "founded",
    "bishop",
    "address",
    "phone",
    "email",
    "website",
    "website_label",
  ] as const;
  return keys.some((k) => trimStr(m[k]).length > 0);
}

function imgSrc(src?: string): string {
  if (!src) return "";
  const t = src.trim();
  if (!t) return "";
  return t.startsWith("http") ? t : t.startsWith("/") ? t : `/${t}`;
}

function phoneTelHref(phone: string): string | null {
  const primary = phone.split(/[/|]/)[0]?.trim() ?? phone;
  const digits = primary.replace(/[^\d+]/g, "");
  if (digits.replace(/\D/g, "").length >= 8) return `tel:${digits}`;
  return null;
}

function DioceseDetailsPill() {
  return (
    <span className="dioc-readmore dioc-readmore--static">
      Details <i className="fa-solid fa-arrow-right" aria-hidden />
    </span>
  );
}

function DioceseCardSurface({
  detailsHref,
  className,
  name,
  children,
}: {
  detailsHref: string;
  className: string;
  name: string;
  children: ReactNode;
}) {
  const trimmed = detailsHref.trim();
  if (!trimmed) {
    return <article className={className}>{children}</article>;
  }
  const external = opensInNewTab(trimmed);
  return (
    <Link
      href={trimmed}
      className={className}
      aria-label={`View more details — ${name}`}
      {...(external ? ({ target: "_blank", rel: "noopener noreferrer" } as const) : {})}
    >
      {children}
    </Link>
  );
}

function DioceseModal({
  open,
  card,
  cardIndex,
  nameId,
  onClose,
}: {
  open: boolean;
  card: DioceseCard | null;
  /** Row index for default “01–09” badge when `card.number` is empty */
  cardIndex: number;
  nameId: string;
  onClose: () => void;
}) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    prevFocusRef.current = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 0);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      prevFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open || !card) return null;

  const m = card.modal;
  const site = trimStr(m?.website);
  const siteLabel = trimStr(m?.website_label) || site.replace(/^https?:\/\//i, "");
  const num = padDioceseNum(cardIndex, card.number);
  const heroSrc = imgSrc(card.image);
  const founded = trimStr(m?.founded);
  const bishop = trimStr(m?.bishop);
  const address = trimStr(m?.address);
  const phone = trimStr(m?.phone);
  const email = trimStr(m?.email);

  return (
    <div
      className="dioc-modal-overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dioc-modal" role="dialog" aria-modal="true" aria-labelledby={nameId}>
        <button
          ref={closeBtnRef}
          type="button"
          className="dioc-modal-closebtn"
          aria-label="Close"
          onClick={onClose}
        >
          <i className="fa-solid fa-xmark" aria-hidden />
        </button>

        <div className="dioc-modal-imgwrap">
          {heroSrc ? <img src={heroSrc} alt={card.name} loading="lazy" /> : null}
          <div className="dioc-modal-titlewrap">
            <div className="dioc-modal-numbadge">{num}</div>
            <div className="dioc-modal-name" id={nameId}>
              {card.name}
            </div>
          </div>
        </div>

        <div className="dioc-modal-body">
          {founded ? (
            <div className="dioc-info-row">
              <div className="dioc-row-icon">
                <i className="fa-solid fa-calendar-days" aria-hidden />
              </div>
              <div>
                <div className="dioc-row-label">Date Founded</div>
                <div className="dioc-row-val">{founded}</div>
              </div>
            </div>
          ) : null}
          {bishop ? (
            <div className="dioc-info-row">
              <div className="dioc-row-icon">
                <i className="fa-solid fa-mitre" aria-hidden />
              </div>
              <div>
                <div className="dioc-row-label">Bishop / Archbishop</div>
                <div className="dioc-row-val">{bishop}</div>
              </div>
            </div>
          ) : null}
          {address ? (
            <div className="dioc-info-row">
              <div className="dioc-row-icon">
                <i className="fa-solid fa-location-dot" aria-hidden />
              </div>
              <div>
                <div className="dioc-row-label">Address</div>
                <div className="dioc-row-val">{address}</div>
              </div>
            </div>
          ) : null}
          {phone ? (
            <div className="dioc-info-row">
              <div className="dioc-row-icon">
                <i className="fa-solid fa-phone" aria-hidden />
              </div>
              <div>
                <div className="dioc-row-label">Telephone</div>
                <div className="dioc-row-val">
                  {(() => {
                    const href = phoneTelHref(phone);
                    return href ? (
                      <a href={href}>{phone}</a>
                    ) : (
                      <>{phone}</>
                    );
                  })()}
                </div>
              </div>
            </div>
          ) : null}
          {email ? (
            <div className="dioc-info-row">
              <div className="dioc-row-icon">
                <i className="fa-solid fa-envelope" aria-hidden />
              </div>
              <div>
                <div className="dioc-row-label">Email</div>
                <div className="dioc-row-val">
                  <a href={`mailto:${email}`}>{email}</a>
                </div>
              </div>
            </div>
          ) : null}
          {site ? (
            <div className="dioc-info-row">
              <div className="dioc-row-icon">
                <i className="fa-solid fa-globe" aria-hidden />
              </div>
              <div>
                <div className="dioc-row-label">Website</div>
                <div className="dioc-row-val">
                  <a href={site} target="_blank" rel="noopener noreferrer">
                    {siteLabel || site}
                  </a>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="dioc-modal-footer">
          {site ? (
            <a
              className="dioc-modal-visit"
              href={site}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden /> Visit Website
            </a>
          ) : null}
          <button type="button" className="dioc-modal-dismiss" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function DioceseNetworkGrid({ items }: { items: DioceseCard[] }) {
  const nameId = useId();
  const [active, setActive] = useState<{ card: DioceseCard; idx: number } | null>(
    null,
  );

  const openModal = useCallback((card: DioceseCard, idx: number) => {
    setActive({ card, idx });
  }, []);

  const closeModal = useCallback(() => setActive(null), []);

  const rows = useMemo(() => items ?? [], [items]);

  return (
    <>
      <div className="diocese-grid">
        {rows.map((d, i) => {
          const special = isSpecialDiocese(d);
          const src = typeof d.image === "string" ? d.image.trim() : "";
          const fallbackHref =
            typeof d.details_href === "string" ? d.details_href.trim() : "";
          const num = padDioceseNum(i, d.number);
          const modalOn = hasModalContent(d);
          const accentWash = Boolean(d.accent_wash);

          if (special) {
            const starIc = faSolidIconClass(d.icon || "fa-star") ?? "fa-solid fa-star";
            return (
              <article
                key={`${d.name}-${i}`}
                className="diocese-card diocese-card--special"
              >
                <div className="dioc-bg-placeholder" aria-hidden />
                <div className="dioc-overlay" aria-hidden />
                <div className="dioc-icon-center">
                  <i className={starIc} aria-hidden />
                  <span>Pastoral Zones</span>
                </div>
                <div className="dioc-info">
                  <h3 className="dioc-name">{d.name}</h3>
                  <div className="dioc-est">
                    <i className="fa-solid fa-location-dot" aria-hidden />
                    {d.date_line}
                  </div>
                </div>
              </article>
            );
          }

          const inner = (
            <>
              {src ? (
                <img className="dioc-bg" src={imgSrc(src)} alt="" loading="lazy" />
              ) : (
                <div className="dioc-bg-fallback" aria-hidden>
                  <i
                    className={
                      faSolidIconClass(d.icon || "fa-church") ?? "fa-solid fa-church"
                    }
                  />
                </div>
              )}
              {accentWash ? <div className="dioc-accent-wash" aria-hidden /> : null}
              <div className="dioc-overlay" aria-hidden />
              <div className="dioc-num">{num}</div>
              <div className="dioc-info">
                <h3 className="dioc-name">{d.name}</h3>
                <div className="dioc-est">
                  <i className="fa-solid fa-cross" aria-hidden />
                  {d.date_line}
                </div>
                {modalOn ? (
                  <button
                    type="button"
                    className="dioc-readmore"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openModal(d, i);
                    }}
                  >
                    Details <i className="fa-solid fa-arrow-right" aria-hidden />
                  </button>
                ) : (
                  <DioceseDetailsPill />
                )}
              </div>
            </>
          );

          const cls = `diocese-card${accentWash ? " diocese-card--accent-wash" : ""}`;

          if (modalOn) {
            return (
              <article key={`${d.name}-${i}`} className={cls}>
                {inner}
              </article>
            );
          }

          return (
            <DioceseCardSurface
              key={`${d.name}-${i}`}
              detailsHref={fallbackHref}
              className={cls}
              name={d.name}
            >
              {inner}
            </DioceseCardSurface>
          );
        })}
      </div>

      <DioceseModal
        open={Boolean(active)}
        card={active?.card ?? null}
        cardIndex={active?.idx ?? 0}
        nameId={nameId}
        onClose={closeModal}
      />
    </>
  );
}
