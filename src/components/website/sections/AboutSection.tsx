'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { FiCrosshair, FiStar, FiEye, FiArrowRight, FiChevronRight } from 'react-icons/fi';
import '@/app/home-about-section.css';

/* Website fonts (Poppins, Inter, Playfair Display) loaded globally via WebsiteLayout */

/* ─── Data ─── */

interface NodeSpec {
  label: string;
  desc: string;
  size: number;
  left: number;
  top: number;
}

const NODES: NodeSpec[] = [
  { label: '1',      desc: 'Caritas Rwanda',                 size: 90,  left: 520, top: 120 },
  { label: '10',     desc: 'Diocesan Caritas',               size: 90,  left: 690, top: 120 },
  { label: '229',    desc: 'Parish Caritas',                 size: 90,  left: 855, top: 355 },
  { label: '882',    desc: 'Sub-Parish Caritas',             size: 90,  left: 730, top: 571 },
  { label: '29,141', desc: 'Basic Christian Community Caritas', size: 100, left: 475, top: 566 },
  { label: '56,345+', desc: 'Volunteers',                     size: 110, left: 345, top: 345 },
];

const MISSION_TEXT =
  'To assist people in needs and promote their integral human development, drawing on the Charity as per the Word of God.';

const DEFAULT_VALUES: string[] = [
  'Advocacy', 'Compassion', 'Environment Protection', 'Equity',
  'Hope', 'Human Dignity', 'Justice', 'Service',
  'Solidarity', 'Stewardship and Accountability', 'Subsidiarity and Partnership',
];

/* ─── Default content (used when no CMS props provided) ─── */

interface AboutContent {
  title?: string;
  subtitle?: string;
  missionText?: string;
  values?: string[];
  visionText?: string;
}

const DEFAULT_CONTENT: AboutContent = {
  title: 'About Us',
  subtitle: 'Caritas Rwanda Interventions Scale Through Its Network',
  missionText: MISSION_TEXT,
  values: DEFAULT_VALUES,
  visionText: 'Promoting Human<br />Dignity for All',
};

/* ─── Labels (plain text, no containers) ─── */

interface LabelData {
  text: string;
  left: number;
  top: number;
  width: number;
  align?: 'center' | 'right';
}

const LABELS: LabelData[] = [
  { text: 'Caritas Rwanda',          left: 515, top: 75,  width: 120, align: 'center' },
  { text: 'Diocesan Caritas',         left: 665, top: 75,  width: 160, align: 'center' },
  { text: 'Parish Caritas',           left: 910, top: 355, width: 100, align: 'center' },
  { text: 'Sub-Parish Caritas',       left: 910, top: 585, width: 110, align: 'center' },
  { text: 'Basic Christian\nCommunity\nCaritas', left: 270, top: 570, width: 120, align: 'right' },
  { text: 'Volunteers',               left: 225, top: 355, width: 110, align: 'center' },
];

/* ─── Component ─── */

export default function AboutSection(props: Record<string, unknown> = {}) {
  const content: AboutContent = {
    title: (props.title as string) || DEFAULT_CONTENT.title,
    subtitle: (props.subtitle as string) || DEFAULT_CONTENT.subtitle,
    missionText: (props.missionText as string) || DEFAULT_CONTENT.missionText,
    values: Array.isArray(props.values) ? (props.values as string[]) : DEFAULT_CONTENT.values,
    visionText: (props.visionText as string) || DEFAULT_CONTENT.visionText,
  };
  const wrapperRef = useRef<HTMLDivElement>(null);
  const infographicRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const graphic = infographicRef.current;
    if (!wrapper || !graphic) return;

    const scale = () => {
      const w = wrapper.clientWidth;
      const s = Math.min(1, w / 1300);
      graphic.style.transform = `scale(${s})`;
    };

    scale();

    const observer = new ResizeObserver(scale);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="cr-home-about">
      <div className="cr-about-inner">
        {/* ─── Header ─── */}
        <div className="cr-about-header">
          <h2 className="cr-about-title">{content.title}</h2>
          <p className="cr-about-subtitle">{content.subtitle}</p>
          <div className="cr-about-rule" />
        </div>

        {/* ─── Infographic wrapper (aspect-ratio via padding-top) ─── */}
        <div className="cr-infographic-wrapper" ref={wrapperRef}>
          <div className="cr-infographic" ref={infographicRef}>
            {/* ─── SVG lines overlay ─── */}
            <svg className="cr-info-lines" width="1300" height="850" aria-hidden="true">
              <defs>
                <linearGradient id="fadeLineLeft" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0.8)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.8)" />
                </linearGradient>
                <linearGradient id="fadeLineRight" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0.8)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
                <linearGradient id="fadeLineDown" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
                <filter id="lineShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.3)" />
                </filter>
              </defs>

              {/* ── Lines from left panel (target icon) → OUR MISSION ── */}
              <line x1="260" y1="240" x2="565" y2="375" stroke="url(#fadeLineLeft)" strokeWidth="3" filter="url(#lineShadow)" />
              <circle cx="565" cy="375" r="5" fill="#fff" filter="url(#lineShadow)" />

              {/* ── Lines from right panel (hand icon) → OUR VALUES ── */}
              <line x1="1040" y1="200" x2="745" y2="375" stroke="url(#fadeLineRight)" strokeWidth="3" filter="url(#lineShadow)" />
              <circle cx="745" cy="375" r="5" fill="#fff" filter="url(#lineShadow)" />

              {/* ── Bottom vertical line from eye icon → OUR VISION ── */}
              <line x1="655" y1="690" x2="655" y2="555" stroke="url(#fadeLineDown)" strokeWidth="3" filter="url(#lineShadow)" />
              <circle cx="655" cy="555" r="5" fill="#fff" filter="url(#lineShadow)" />

              {/* ── Inner circle MISSION → node 1 (top-left) ── */}
              <line x1="556" y1="316" x2="565" y2="165" stroke="rgba(148,58,55,0.8)" strokeWidth="2" />
              <circle cx="565" cy="165" r="4" fill="rgba(148,58,55,0.8)" />

              {/* ── Inner circle VALUES → node 10 (top-right) ── */}
              <line x1="736" y1="316" x2="735" y2="165" stroke="rgba(148,58,55,0.8)" strokeWidth="2" />
              <circle cx="735" cy="165" r="4" fill="rgba(148,58,55,0.8)" />

              {/* ── Inner circle VALUES → node 229 (right) ── */}
              <line x1="736" y1="316" x2="900" y2="400" stroke="rgba(148,58,55,0.8)" strokeWidth="2" />
              <circle cx="900" cy="400" r="4" fill="rgba(148,58,55,0.8)" />

              {/* ── Inner circle VISION → node 882 (bottom-right) ── */}
              <line x1="646" y1="496" x2="775" y2="616" stroke="rgba(148,58,55,0.8)" strokeWidth="2" />
              <circle cx="775" cy="616" r="4" fill="rgba(148,58,55,0.8)" />

              {/* ── Inner circle VISION → node 29,141 (bottom-left) ── */}
              <line x1="646" y1="496" x2="525" y2="616" stroke="rgba(148,58,55,0.8)" strokeWidth="2" />
              <circle cx="525" cy="616" r="4" fill="rgba(148,58,55,0.8)" />

              {/* ── Inner circle MISSION → node 56,345+ (left) ── */}
              <line x1="556" y1="316" x2="400" y2="400" stroke="rgba(148,58,55,0.8)" strokeWidth="2" />
              <circle cx="400" cy="400" r="4" fill="rgba(148,58,55,0.8)" />

              {/* ── Lines connecting the central concepts ── */}
              <line x1="560" y1="345" x2="740" y2="345" stroke="rgba(148,58,55,0.8)" strokeWidth="2" />
              <line x1="740" y1="345" x2="650" y2="525" stroke="rgba(148,58,55,0.8)" strokeWidth="2" />
              <line x1="650" y1="525" x2="560" y2="345" stroke="rgba(148,58,55,0.8)" strokeWidth="2" />
            </svg>

            {/* ─── Center big circle ─── */}
            <div className="cr-info-center">
              {/* Inner circles */}
              <div className="cr-info-inner" style={{ left: '90px', top: '100px' }}>
                <span className="cr-inner-label">OUR</span>
                <strong className="cr-inner-name">MISSION</strong>
              </div>
              <div className="cr-info-inner" style={{ left: '270px', top: '100px' }}>
                <span className="cr-inner-label">OUR</span>
                <strong className="cr-inner-name">VALUES</strong>
              </div>
              <div className="cr-info-inner" style={{ left: '180px', top: '280px' }}>
                <span className="cr-inner-label">OUR</span>
                <strong className="cr-inner-name">VISION</strong>
              </div>
            </div>

            {/* ─── Satellite nodes ─── */}
            {NODES.map((n) => (
              <div
                key={n.label}
                className="cr-info-node"
                style={{
                  width: n.size,
                  height: n.size,
                  left: n.left,
                  top: n.top,
                }}
              >
                {n.label}
              </div>
            ))}

            {/* ─── Labels (plain text, no containers) ─── */}
            {LABELS.map((l, i) => (
              <div
                key={i}
                className="cr-info-label"
                style={{
                  left: l.left,
                  top: l.top,
                  width: l.width,
                  textAlign: (l.align ?? 'center') as 'left' | 'center' | 'right',
                }}
                dangerouslySetInnerHTML={{ __html: l.text.replace(/\n/g, '<br />') }}
              />
            ))}

            {/* ─── Left text box (Mission) ─── */}
            <div className="cr-info-box cr-info-box--left">
              <div className="cr-icon-overlap cr-icon-overlap--target">
                <img src="/img/image.png" alt="" />
              </div>
              <p className="cr-box-body" style={{ textAlign: 'center' }}>{content.missionText}</p>
            </div>

            {/* ─── Right text box (Values) ─── */}
            <div className="cr-info-box cr-info-box--right">
              <div className="cr-icon-overlap cr-icon-overlap--hand">
                <img src="/img/image-1.png" alt="" />
              </div>
              <div className="cr-info-values-text">
                {content.values.map((v) => (
                  <div key={v} style={{ marginBottom: '4px', display: 'flex', alignItems: 'flex-start' }}>
                    <span style={{ marginRight: '6px', fontSize: '11px', lineHeight: '22px', flexShrink: 0 }}>☛</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Bottom vision ─── */}
            <div className="cr-info-eye" aria-hidden="true">
              <img src="/img/image-2.png" alt="" style={{ width: '201px', height: 'auto' }} />
            </div>
            <div className="cr-info-vision">
              <span dangerouslySetInnerHTML={{ __html: content.visionText || '' }} />
            </div>
          </div>
        </div>

        {/* ─── CTA ─── */}
        <div className="cr-about-cta-wrap">
          <Link href="/about" className="cr-about-cta">
            Read more about Caritas Rwanda
            <FiArrowRight size={14} style={{ marginLeft: '6px' }} />
          </Link>
        </div>
      </div>
    </section>
  );
}