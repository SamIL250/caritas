import React from "react";
import { faSolidIconClass } from "@/lib/fontawesome";
import {
  DEFAULT_MVV_BG_SLIDES,
  DEFAULT_MVV_STATEMENTS,
  DEFAULT_MVV_TITLE,
  DEFAULT_MVV_VALUE_ITEMS,
  DEFAULT_MVV_VALUES_EYEBROW,
  DEFAULT_MVV_VALUES_EYEBROW_ICON,
  DEFAULT_MVV_VALUES_TITLE,
  type MvvStatement,
  type MvvValueItem,
} from "@/lib/mission-vision-values";
import { formatInlineBold } from "@/lib/text-format";

type MissionVisionValuesSectionProps = {
  showMissionVision?: boolean;
  showValues?: boolean;
  title?: string;
  statements?: MvvStatement[];
  valuesEyebrow?: string;
  valuesEyebrowIcon?: string;
  valuesTitle?: string;
  values?: MvvValueItem[];
  bgSlides?: string[];
};

function statementNum(index: number): string {
  return String(index + 1).padStart(2, "0");
}

export default function MissionVisionValuesSection({
  showMissionVision = true,
  showValues = true,
  title = DEFAULT_MVV_TITLE,
  statements = DEFAULT_MVV_STATEMENTS,
  valuesEyebrow = DEFAULT_MVV_VALUES_EYEBROW,
  valuesEyebrowIcon = DEFAULT_MVV_VALUES_EYEBROW_ICON,
  valuesTitle = DEFAULT_MVV_VALUES_TITLE,
  values = DEFAULT_MVV_VALUE_ITEMS,
  bgSlides = DEFAULT_MVV_BG_SLIDES,
}: MissionVisionValuesSectionProps = {}) {
  if (!showMissionVision && !showValues) return null;

  const valuesOnly = showValues && !showMissionVision;
  const sectionClass = valuesOnly
    ? "about-mvv-section about-mvv-section--values-only"
    : "about-mvv-section";
  const eyebrowIconClass = faSolidIconClass(valuesEyebrowIcon) ?? "fa-solid fa-star";

  return (
    <section className={sectionClass} id={valuesOnly ? "values" : "mission"}>
      {showMissionVision ? (
        <div className="container">
          <div className="head-center">
            <h2 className="sub-section-title">{title}</h2>
          </div>

          <div className="about-mvv-statements">
            {statements.map((stmt, index) => (
              <div
                key={`${stmt.variant}-${index}`}
                className={`about-mvv-stmt about-mvv-stmt--${stmt.variant}`}
              >
                <div className="about-mvv-stmt-num">{statementNum(index)}</div>
                <div className="about-mvv-stmt-body">
                  <div className="about-mvv-stmt-label">{stmt.label}</div>
                  <p className="about-mvv-stmt-quote">{formatInlineBold(stmt.body)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {showValues ? (
        <div className="about-mvv-values-strip" id="values">
          <div className="about-mvv-bg-slides">
            {bgSlides.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="about-mvv-bg-slide"
                style={{ backgroundImage: `url('${url}')` }}
              />
            ))}
          </div>
          <div className="about-mvv-vals-header">
            <div className="about-mvv-vals-eyebrow">
              <i className={eyebrowIconClass} style={{ marginRight: "0.4rem" }} aria-hidden />
              {valuesEyebrow}
            </div>
            <div className="about-mvv-vals-title">{valuesTitle}</div>
          </div>
          <div className="about-mvv-values-grid">
            {values.map((v, index) => (
              <div key={`${v.name}-${index}`} className="about-mvv-value-pill" data-num={statementNum(index)}>
                <div className="about-mvv-value-pill-icon">
                  <i className={faSolidIconClass(v.icon) ?? "fa-solid fa-star"} aria-hidden />
                </div>
                <div className="about-mvv-value-pill-name">{v.name}</div>
                <p className="about-mvv-value-pill-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
