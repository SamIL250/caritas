import React from "react";

type Props = {
  photoUrl?: string;
  photoAlt?: string;
  badgeText?: string;
  name?: string;
  title?: string;
  quote?: string;
  meta?: string;
};

export default function ChairpersonSection({
  photoUrl = "/img/Chairperson/anaclet.jpg",
  photoAlt = "H.E. Mgr. Anaclet Mwumvaneza",
  badgeText = "Current Chairperson",
  name = "H.E. Mgr. Anaclet Mwumvaneza",
  title = "Bishop of Nyundo Diocese<br/>Chairperson, Caritas Rwanda",
  quote = `Catholic Church is proud of Caritas Rwanda's <strong>66 years of services</strong> to Rwandans, especially its contribution to socio-economic development, health promotion, paying particular attention to the poor, the sick, the elderly, people living with disabilities, refugees — as well as building a just and resilient society.
<br/><br/>
May this be not only a reminder of the past, but above all an invitation to continue the mission of charity and service to the poor, so that the Gospel may continue to be <strong>Good News for every Rwandan</strong>.`,
  meta = "125th Jubilee of Evangelization — 2025",
}: Props) {
  return (
    <div className="about-chairperson">
      <div className="about-chairperson-inner">
        <div className="about-chairperson-visual">
          <div className="about-chairperson-photo-wrap">
            <div className="about-chairperson-photo">
              <img src={photoUrl} alt={photoAlt} loading="lazy" />
            </div>
          </div>
          <div className="about-chairperson-badge">
            <i className="fa-solid fa-crown" aria-hidden /> {badgeText}
          </div>
          <div
            className="about-chairperson-name"
            dangerouslySetInnerHTML={{ __html: name }}
          />
          <div
            className="about-chairperson-title"
            dangerouslySetInnerHTML={{ __html: title }}
          />
        </div>

        <div className="about-chairperson-content">
          <div className="about-chair-eyebrow">
            <i className="fa-solid fa-quote-left" aria-hidden /> Chairperson&rsquo;s Statement
          </div>
          <span className="about-quote-mark">&ldquo;</span>
          <div
            className="about-chairperson-quote"
            dangerouslySetInnerHTML={{ __html: quote }}
          />
          <div className="about-chairperson-divider" />
          <div className="about-chairperson-meta">
            <i className="fa-solid fa-landmark" aria-hidden /> {meta}
          </div>
        </div>
      </div>
    </div>
  );
}
