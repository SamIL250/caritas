import React from "react";

type ValueItem = {
  num: string;
  icon: string;
  name: string;
  desc: string;
};

const values: ValueItem[] = [
  { num: "01", icon: "fa-megaphone", name: "Advocacy", desc: "Speaking up for the vulnerable and voiceless" },
  { num: "02", icon: "fa-heart", name: "Compassion", desc: "Meeting suffering with sincere care and empathy" },
  { num: "03", icon: "fa-scale-balanced", name: "Equity", desc: "Ensuring fair access and equal opportunity for all" },
  { num: "04", icon: "fa-leaf", name: "Environment Protection", desc: "Safeguarding creation for future generations" },
  { num: "05", icon: "fa-sun", name: "Hope", desc: "Inspiring confidence in a brighter tomorrow" },
  { num: "06", icon: "fa-person-rays", name: "Human Dignity", desc: "Honouring the sacred worth of every person" },
  { num: "07", icon: "fa-gavel", name: "Justice", desc: "Upholding rights, fairness, and moral integrity" },
  { num: "08", icon: "fa-hand-holding-heart", name: "Service", desc: "Giving selflessly to those who need it most" },
  { num: "09", icon: "fa-handshake", name: "Solidarity", desc: "Standing united across all communities" },
  { num: "10", icon: "fa-shield-halved", name: "Stewardship & Accountability", desc: "Managing every resource with full transparency" },
  { num: "11", icon: "fa-people-group", name: "Subsidiarity & Partnership", desc: "Empowering local action through collaboration" },
];

type MissionVisionValuesSectionProps = {
  showMissionVision?: boolean;
  showValues?: boolean;
};

export default function MissionVisionValuesSection({
  showMissionVision = true,
  showValues = true,
}: MissionVisionValuesSectionProps = {}) {
  if (!showMissionVision && !showValues) return null;

  const valuesOnly = showValues && !showMissionVision;

  const sectionClass = valuesOnly
    ? "about-mvv-section about-mvv-section--values-only"
    : "about-mvv-section";

  return (
    <section className={sectionClass} id={valuesOnly ? "values" : "mission"}>
      {showMissionVision ? (
      <div className="container">
        <div className="head-center">
          <h2 className="sub-section-title">Vision, Mission &amp; Values</h2>
        </div>

        <div className="about-mvv-statements">
          <div className="about-mvv-stmt about-mvv-stmt--mission">
            <div className="about-mvv-stmt-num">01</div>
            <div className="about-mvv-stmt-body">
              <div className="about-mvv-stmt-label">Our Mission</div>
              <p className="about-mvv-stmt-quote">
                To assist people in need and promote their <strong>integral human development</strong>,
                drawing on Charity as per the Word of God — reaching the poor, sick, elderly,
                refugees, people with disabilities, and all vulnerable communities across Rwanda.
              </p>
            </div>
          </div>
          <div className="about-mvv-stmt about-mvv-stmt--vision">
            <div className="about-mvv-stmt-num">02</div>
            <div className="about-mvv-stmt-body">
              <div className="about-mvv-stmt-label">Our Vision</div>
              <p className="about-mvv-stmt-quote">
                A Rwanda where every person — regardless of background, status, or circumstance
                — lives with full <strong>dignity, equal rights</strong>, and the opportunity to
                flourish in body, mind, and spirit through inclusive, non-discriminatory interventions.
              </p>
            </div>
          </div>
        </div>
      </div>
      ) : null}

      {showValues ? (
      <div className="about-mvv-values-strip" id="values">
        <div className="about-mvv-bg-slides">
          <div
            className="about-mvv-bg-slide"
            style={{ backgroundImage: "url('https://caritasrwanda.org/wp-content/uploads/2025/06/162A1384-scaled.jpg')" }}
          />
          <div
            className="about-mvv-bg-slide"
            style={{ backgroundImage: "url('https://caritasrwanda.org/wp-content/uploads/2025/03/162A9519-scaled.jpg')" }}
          />
          <div
            className="about-mvv-bg-slide"
            style={{ backgroundImage: "url('https://caritasrwanda.org/wp-content/uploads/2025/03/162A5107-scaled.jpg')" }}
          />
        </div>
        <div className="about-mvv-vals-header">
          <div className="about-mvv-vals-eyebrow">
            <i className="fa-solid fa-star" style={{ marginRight: "0.4rem" }} aria-hidden /> Core Values
          </div>
          <div className="about-mvv-vals-title">Principles We Live By</div>
        </div>
        <div className="about-mvv-values-grid">
          {values.map((v) => (
            <div key={v.num} className="about-mvv-value-pill" data-num={v.num}>
              <div className="about-mvv-value-pill-icon">
                <i className={`fa-solid ${v.icon}`} aria-hidden />
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
