"use client";

import React, { useState } from "react";

type FaqItem = {
  question: string;
  answer: string;
};

type FaqSectionProps = {
  eyebrow?: string;
  title?: string;
  items?: FaqItem[];
};

export default function FaqSection({
  eyebrow = "FAQ",
  title = "Frequently Asked Questions",
  items = [],
}: FaqSectionProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  if (!items.length) return null;

  return (
    <section className="ct-faq-section" id="faq">
      <div className="ct-faq-inner">
        <div className="ct-faq-head">
          {eyebrow ? (
            <div className="ct-faq-eyebrow">
              <i className="fa-solid fa-circle-question" aria-hidden />
              {eyebrow}
            </div>
          ) : null}
          {title ? <h2 className="ct-faq-title">{title}</h2> : null}
        </div>
        <div className="ct-faq-list">
          {items.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className={`ct-faq-item${isOpen ? " open" : ""}`}>
                <div
                  className="ct-faq-q"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setOpenIdx(isOpen ? null : idx);
                    }
                  }}
                  aria-expanded={isOpen}
                >
                  <span className="ct-faq-q-text">{item.question}</span>
                  <span className="ct-faq-icon">
                    <i className="fa-solid fa-plus" />
                  </span>
                </div>
                <div className="ct-faq-a">
                  <p>{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
