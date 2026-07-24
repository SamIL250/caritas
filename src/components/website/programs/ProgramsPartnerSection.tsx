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
    <section className="prog-partner-section" aria-label="Get Involved">
      <div className="prog-partner-inner">
        <div className="prog-partner-label">
          {eyebrow_icon ? <i className={`fa-solid ${eyebrow_icon}`} aria-hidden /> : null}
          {eyebrow}
        </div>
        <h2 className="prog-partner-title">
          {titleLines.map((line, index) => (
            <span key={`${line}-${index}`}>
              {line}
              {index < titleLines.length - 1 ? <br /> : null}
            </span>
          ))}
        </h2>
        <p className="prog-partner-sub">{subtitle}</p>
        <div className="prog-partner-btns">
          <button
            type="button"
            className="prog-partner-btn-primary"
            onClick={() => openModal()}
          >
            <i className="fa-solid fa-heart" aria-hidden /> {primary_label}
          </button>
          {secondary_action === "back_to_top" ? (
            <button
              type="button"
              className="prog-partner-btn-primary"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              style={{ background: "#111111" }}
            >
              <i className="fa-solid fa-arrow-up" aria-hidden /> {secondary_label}
            </button>
          ) : (
            <a href="/contact" className="prog-partner-btn-primary" style={{ background: "#111111" }}>
              <i className="fa-solid fa-envelope" aria-hidden /> {secondary_label}
            </a>
          )}
          <a href={outline_href || "/contact"} className="prog-partner-btn-outline">
            <i className="fa-solid fa-envelope" aria-hidden />
            {outline_label}
          </a>
        </div>
      </div>
    </section>
  );
}
