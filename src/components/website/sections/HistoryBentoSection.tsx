import React from "react";

type HistoryCard = {
  year: string;
  eraPill: string;
  eraPillIcon?: string;
  title: string;
  body: string;
  imageUrl: string;
  variant: "crimson" | "navy" | "light" | "gold";
  span?: 1 | 2 | 3;
};

const historyCards: HistoryCard[] = [
  {
    year: "1959",
    eraPill: "Founding",
    eraPillIcon: "fa-church",
    title: "Creation of Caritas Rwanda",
    body: "<strong>Secours Catholique Rwandais</strong> established by the Catholic Bishops of Rwanda — a Gospel-rooted response to humanitarian hardship and the call to serve the poor without discrimination.",
    imageUrl: "/img/bg_3.webp",
    variant: "crimson",
    span: 2,
  },
  {
    year: "1960",
    eraPill: "Founding",
    eraPillIcon: "fa-gavel",
    title: "Legal Registration",
    body: "Officially registered as a <strong>non-profit organization</strong> by Prime Minister's Order No. 488/08 — formal legal standing to operate nationally.",
    imageUrl: "https://caritasrwanda.org/wp-content/uploads/2026/03/162A8733-scaled.jpg",
    variant: "light",
    span: 1,
  },
  {
    year: "1963",
    eraPill: "Founding",
    eraPillIcon: "fa-pen-nib",
    title: "Name Change",
    body: "Renamed to <strong>Caritas Rwanda</strong> by Prime Minister's Order No. 75/08 — aligning with the global Caritas confederation identity.",
    imageUrl: "/img/bg_1.webp",
    variant: "light",
    span: 1,
  },
  {
    year: "1965",
    eraPill: "Global",
    eraPillIcon: "fa-globe",
    title: "International Membership",
    body: "Became a member of <strong>Caritas Internationalis</strong> — a confederation of 162 National Caritas across the world — expanding our reach through global solidarity and partnership.",
    imageUrl: "https://caritasrwanda.org/wp-content/uploads/2025/03/162A2264-1-scaled.jpg",
    variant: "navy",
    span: 2,
  },
  {
    year: "1994",
    eraPill: "Recovery",
    eraPillIcon: "fa-hands-holding-circle",
    title: "Post-Genocide Expansion",
    body: "Following the Genocide against the Tutsi, Caritas Rwanda expanded to include <strong>Health, Development, and Finance & Administration</strong> departments to meet Rwanda's vast recovery needs.",
    imageUrl: "https://caritasrwanda.org/wp-content/uploads/2024/06/162A4432-scaled.jpg",
    variant: "navy",
    span: 2,
  },
  {
    year: "2012",
    eraPill: "Modern Era",
    eraPillIcon: "fa-building-columns",
    title: "National NGO Status",
    body: "Registered as a <strong>National Non-Governmental Organisation</strong> under Law No. 04/2012 — an independent humanitarian mandate for the future.",
    imageUrl: "https://caritasrwanda.org/wp-content/uploads/2026/03/162A7732-scaled.jpg",
    variant: "light",
    span: 1,
  },
  {
    year: "2025",
    eraPill: "Jubilee",
    eraPillIcon: "fa-trophy",
    title: "125th Jubilee of Evangelization",
    body: "Celebrating <strong>125 years of evangelization</strong> in Rwanda and 66 years of Caritas service — a milestone of faith, perseverance, and nationwide impact.",
    imageUrl: "https://caritasrwanda.org/wp-content/uploads/2024/09/Youth-Forum-scaled.jpg",
    variant: "gold",
    span: 3,
  },
];

export default function HistoryBentoSection() {
  return (
    <section className="about-history-section" id="history">
      <div className="container">
        <div className="head-center">
          <div className="sub-section-label">
            <i className="fa-solid fa-clock-rotate-left" aria-hidden /> Our History
          </div>
          <h2 className="sub-section-title">Six Decades of Faith &amp; Service</h2>
          <p className="sub-section-subtitle">
            From a small charity established by Catholic Bishops to a nationwide
            humanitarian network — our journey spans over 66 years of unwavering
            service to the most vulnerable Rwandans.
          </p>
        </div>

        <div className="about-hist-bento">
          {historyCards.map((card, i) => (
            <div
              key={i}
              className={`about-hist-card about-hist-card--${card.variant}${card.span && card.span > 1 ? ` about-hist-span${card.span}` : ""}`}
              style={{ backgroundImage: `url(${card.imageUrl})` }}
            >
              <div className="about-hist-yr-bg">{card.year}</div>
              {card.eraPillIcon ? (
                <div className="about-hist-icon">
                  <i className={`fa-solid ${card.eraPillIcon}`} aria-hidden />
                </div>
              ) : null}
              <div className="about-hist-meta">
                <span className="about-hist-era-pill">{card.eraPill}</span>
                <span className="about-hist-year-tag">{card.year}</span>
              </div>
              <div className="about-hist-title">{card.title}</div>
              <div
                className="about-hist-body"
                dangerouslySetInnerHTML={{ __html: card.body }}
              />

              {card.year === "2025" ? (
                <div className="about-hist-jubilee-stats">
                  <div className="about-hist-stat-item">
                    <div className="about-hist-stat-num">7M+</div>
                    <div className="about-hist-stat-lbl">People Served</div>
                  </div>
                  <div className="about-hist-stat-item">
                    <div className="about-hist-stat-num">10</div>
                    <div className="about-hist-stat-lbl">Dioceses</div>
                  </div>
                  <div className="about-hist-stat-item">
                    <div className="about-hist-stat-num">56K+</div>
                    <div className="about-hist-stat-lbl">Volunteers</div>
                  </div>
                  <div className="about-hist-stat-item">
                    <div className="about-hist-stat-num">66</div>
                    <div className="about-hist-stat-lbl">Years of Service</div>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
