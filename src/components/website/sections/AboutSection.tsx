'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { FiCrosshair, FiStar, FiEye, FiArrowRight, FiChevronRight } from 'react-icons/fi';
import '@/app/home-about-section.css';

/* Website fonts (Poppins, Inter, Playfair Display) loaded globally via WebsiteLayout */

/* ─── Data ─── */

interface NetworkNode {
  value: string;
  label: string;
}

const NODE_LAYOUTS = [
  { size: 90,  left: 520, top: 120 },
  { size: 90,  left: 690, top: 120 },
  { size: 90,  left: 855, top: 355 },
  { size: 90,  left: 730, top: 571 },
  { size: 100, left: 475, top: 566 },
  { size: 110, left: 345, top: 345 },
];

type LabelPlacement = 'above' | 'below' | 'left' | 'right';

const LABEL_PLACEMENTS: LabelPlacement[] = [
  'above',
  'above',
  'right',
  'right',
  'left',
  'left',
];

function labelLayoutForNode(
  node: { left: number; top: number; size: number },
  placement: LabelPlacement,
  labelText: string,
) {
  const cx = node.left + node.size / 2;
  const cy = node.top + node.size / 2;
  const gap = 8;

  switch (placement) {
    case 'above': {
      const width = 140;
      return {
        left: cx - width / 2,
        top: node.top - 36,
        width,
        align: 'center' as const,
      };
    }
    case 'below': {
      const width = 150;
      return {
        left: cx - width / 2,
        top: node.top + node.size + gap,
        width,
        align: 'center' as const,
      };
    }
    case 'right': {
      const width = labelText.length > 16 ? 125 : 105;
      return {
        left: node.left + node.size + gap,
        top: cy - 16,
        width,
        align: 'left' as const,
      };
    }
    case 'left': {
      const width = labelText.length > 22 ? 168 : 108;
      const lineCount = labelText.length > 22 ? 3 : 2;
      return {
        left: node.left - gap - width,
        top: cy - lineCount * 8,
        width,
        align: 'right' as const,
      };
    }
    default: {
      const _exhaustive: never = placement;
      return _exhaustive;
    }
  }
}

const DEFAULT_NETWORK_NODES: NetworkNode[] = [
  { value: '1',       label: 'Caritas Rwanda' },
  { value: '10',      label: 'Diocesan Caritas' },
  { value: '229',     label: 'Parish Caritas' },
  { value: '882',     label: 'Sub-Parish Caritas' },
  { value: '29,141',  label: 'Basic Christian Community Caritas' },
  { value: '56,345+', label: 'Volunteers' },
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
  networkNodes?: NetworkNode[];
}

const DEFAULT_CONTENT: AboutContent = {
  title: 'About Us',
  subtitle: 'Caritas Rwanda Interventions Scale Through Its Network',
  missionText: MISSION_TEXT,
  values: DEFAULT_VALUES,
  visionText: 'Promoting Human<br />Dignity for All',
  networkNodes: DEFAULT_NETWORK_NODES,
};

/* ─── Component ─── */

export default function AboutSection(props: Record<string, unknown> = {}) {
  const content: AboutContent = {
    title: (props.title as string) || DEFAULT_CONTENT.title,
    subtitle: (props.subtitle as string) || DEFAULT_CONTENT.subtitle,
    missionText: (props.missionText as string) || DEFAULT_CONTENT.missionText,
    values: Array.isArray(props.values) ? (props.values as string[]) : DEFAULT_CONTENT.values,
    visionText: (props.visionText as string) || DEFAULT_CONTENT.visionText,
    networkNodes: Array.isArray(props.networkNodes)
      ? (props.networkNodes as NetworkNode[])
      : DEFAULT_CONTENT.networkNodes,
  };

  const nodes = content.networkNodes!.map((n, i) => ({
    label: n.value,
    desc: n.label,
    ...NODE_LAYOUTS[i] || NODE_LAYOUTS[NODE_LAYOUTS.length - 1],
  }));

  const labels = content.networkNodes!.map((n, i) => {
    const nodeLayout = NODE_LAYOUTS[i] ?? NODE_LAYOUTS[NODE_LAYOUTS.length - 1];
    const placement = LABEL_PLACEMENTS[i] ?? 'above';
    return {
      text: n.label,
      ...labelLayoutForNode(nodeLayout, placement, n.label),
    };
  });
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
                <linearGradient id="fadeLineVerticalBoth" x1="650" y1="640" x2="650" y2="690" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0.9)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
                <filter id="lineShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.3)" />
                </filter>
              </defs>

              {/* ── White Lines from outer text boxes to big white circle border ── */}
              <line x1="295" y1="260" x2="416" y2="304" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" filter="url(#lineShadow)" />
              <line x1="1010" y1="230" x2="879" y2="289" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" filter="url(#lineShadow)" />
              <line x1="650" y1="690" x2="650" y2="640" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" filter="url(#lineShadow)" />

              {/* ── White dots on the big circle border ── */}
              <circle cx="416" cy="304" r="5" fill="#fff" filter="url(#lineShadow)" />
              <circle cx="879" cy="289" r="5" fill="#fff" filter="url(#lineShadow)" />
              <circle cx="650" cy="640" r="5" fill="#fff" filter="url(#lineShadow)" />

              {/* ── White Lines inside the big circle to the inner circles ── */}
              <line x1="416" y1="304" x2="490" y2="304" stroke="#a5280d" strokeWidth="2.5" />
              <line x1="879" y1="289" x2="800" y2="305" stroke="#a5280d" strokeWidth="2.5" />
              <line x1="650" y1="640" x2="650" y2="550" stroke="#a5280d" strokeWidth="2.5" />

              {/* ── Perpendicular T-Junction caps at the inner circles ── */}
              <line x1="490" y1="295" x2="490" y2="313" stroke="#a5280d" strokeWidth="3" />
              <line x1="800" y1="296" x2="800" y2="314" stroke="#a5280d" strokeWidth="3" />
              <line x1="641" y1="550" x2="659" y2="550" stroke="#a5280d" strokeWidth="3" />
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
            {nodes.map((n) => (
              <div
                key={n.label}
                className="cr-info-node"
                style={{
                  width: n.size,
                  height: n.size,
                  left: n.left,
                  top: n.top,
                  fontWeight: 500,
                }}
              >
                {n.label}
              </div>
            ))}

            {/* ─── Labels (plain text, no containers) ─── */}
            {labels.map((l, i) => (
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
              <div className="cr-icon-overlap cr-icon-overlap--target" style={{ width: '45px', height: '45px', right: '-15px', top: '-15px' }}>
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