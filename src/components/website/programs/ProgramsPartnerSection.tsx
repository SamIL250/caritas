"use client";

import { useDonation } from "@/context/DonationContext";
import type { ProgramsPartnerSectionContent } from "@/lib/programs-library-section";

type Props = ProgramsPartnerSectionContent;

export default function ProgramsPartnerSection({
  eyebrow,
  eyebrow_icon,
  title,
  subtitle,
  primary_label,
  secondary_label,
  secondary_action,
  outline_label,
  outline_href,
}: Props) {
  const { openModal } = useDonation();
  const titleLines = title.split("\n");

  return (
    <section className="prog-join-section" aria-label="Get Involved">
      <div className="prog-join-section__inner">
        <div className="prog-join-section__shell">
          <div className="prog-join-section__frame">
            <p className="prog-join-section__eyebrow">
              {eyebrow_icon ? <i className={`fa-solid ${eyebrow_icon}`} aria-hidden /> : null}
              {eyebrow}
            </p>
            <h2 className="prog-join-section__title">
              {titleLines.map((line, index) => (
                <span key={`${line}-${index}`}>
                  {line}
                  {index < titleLines.length - 1 ? <br /> : null}
                </span>
              ))}
            </h2>
            <p className="prog-join-section__lead">{subtitle}</p>
            <div className="prog-join-section__actions">
              <button
                type="button"
                className="prog-join-section__btn prog-join-section__btn--primary"
                onClick={() => openModal()}
              >
                <i className="fa-solid fa-heart" aria-hidden /> {primary_label}
              </button>
              {secondary_action === "back_to_top" ? (
                <button
                  type="button"
                  className="prog-join-section__btn prog-join-section__btn--secondary"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                  <i className="fa-solid fa-arrow-up" aria-hidden /> {secondary_label}
                </button>
              ) : (
                <a href="/contact" className="prog-join-section__btn prog-join-section__btn--secondary">
                  <i className="fa-solid fa-envelope" aria-hidden /> {secondary_label}
                </a>
              )}
              <a
                href={outline_href || "/contact"}
                className="prog-join-section__btn prog-join-section__btn--outline"
              >
                <i className="fa-solid fa-envelope" aria-hidden />
                {outline_label}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
