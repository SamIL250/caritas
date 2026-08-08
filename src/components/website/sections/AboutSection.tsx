'use client';

import { useState, useEffect, type ComponentType } from 'react';
import Link from 'next/link';
import { ArrowRight, Target, Heart, Eye } from 'lucide-react';
import '@/app/home-about-section.css';

interface NetworkNode {
  value: string;
  label: string;
}

type FocusKey = 'mission' | 'values' | 'vision';
type LabelPlacement = 'above' | 'below' | 'left' | 'right';

const DIAGRAM = {
  width: 960,
  height: 680,
  center: { x: 480, y: 350 },
  mainRadius: 158,
  satelliteRadius: 38,
  orbitRadius: 252,
  innerOrbitRadius: 58,
  innerCircleSize: 88,
  /** Extra space so satellite labels stay inside the SVG viewBox */
  viewBoxPad: { x: 88, y: 48, right: 88, bottom: 52 },
  viewBoxPadMobile: { x: 34, y: 30, right: 34, bottom: 34 },
} as const;

function useMobileDiagramLayout(maxWidth = 640) {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [maxWidth]);

  return mobile;
}

/** Equilateral triangle — mission & values top, vision bottom, all inside main ring */
const INNER_FOCUS_ANGLES: Array<{ key: FocusKey; angle: number }> = [
  { key: 'mission', angle: -130 },
  { key: 'values', angle: -50 },
  { key: 'vision', angle: 90 },
];

const SATELLITE_START_ANGLE = -90;

function evenSatelliteAngles(count: number): number[] {
  const step = 360 / count;
  return Array.from({ length: count }, (_, index) => SATELLITE_START_ANGLE + index * step);
}

/** Place label on the outward-facing side of each satellite node */
function labelPlacementForAngle(angleDeg: number): LabelPlacement {
  const rad = (angleDeg * Math.PI) / 180;
  const nx = Math.cos(rad);
  const ny = Math.sin(rad);
  if (ny <= -0.45) return 'above';
  if (ny >= 0.45) return 'below';
  if (nx >= 0.35) return 'right';
  return 'left';
}

const DEFAULT_NETWORK_NODES: NetworkNode[] = [
  { value: '1', label: 'Caritas Rwanda' },
  { value: '10', label: 'Diocesan Caritas' },
  { value: '229', label: 'Parish Caritas' },
  { value: '882', label: 'Sub-Parish Caritas' },
  { value: '29,141', label: 'Basic Christian Community Caritas' },
  { value: '56,345+', label: 'Volunteers' },
];

const MISSION_TEXT =
  'To assist people in needs and promote their integral human development, drawing on the Charity as per the Word of God.';

const DEFAULT_VALUES: string[] = [
  'Advocacy',
  'Compassion',
  'Environment Protection',
  'Equity',
  'Hope',
  'Human Dignity',
  'Justice',
  'Service',
  'Solidarity',
  'Stewardship and Accountability',
  'Subsidiarity and Partnership',
];

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
  visionText: 'Promoting Human Dignity for All',
  networkNodes: DEFAULT_NETWORK_NODES,
};

const FOCUS_ITEMS: Array<{
  key: FocusKey;
  title: string;
  Icon: ComponentType<{ size?: number; strokeWidth?: number; 'aria-hidden'?: boolean }>;
}> = [
  { key: 'mission', title: 'Our Mission', Icon: Target },
  { key: 'values', title: 'Our Values', Icon: Heart },
  { key: 'vision', title: 'Our Vision', Icon: Eye },
];

function stripHtml(text: string) {
  return text.replace(/<br\s*\/?>/gi, ' ').replace(/<\/?[^>]+(>|$)/g, '').trim();
}

function polarPoint(cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

function valueFontSize(value: string, mobile = false) {
  const bump = mobile ? 2 : 0;
  if (value.length > 5) return 13 + bump;
  if (value.length > 3) return 16 + bump;
  return 21 + bump;
}

function splitLabel(label: string): string[] {
  if (label.length <= 26) return [label];
  const words = label.split(' ');
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}

function labelFontSize(label: string, mobile = false) {
  const bump = mobile ? 1.5 : 0;
  if (label.length > 32) return 10 + bump;
  if (label.length > 22) return 11 + bump;
  return 12 + bump;
}

function getLabelPosition(
  satellite: { x: number; y: number },
  placement: LabelPlacement,
  lineCount: number,
) {
  const { satelliteRadius } = DIAGRAM;
  const gap = 10;
  const blockHeight = lineCount * 13;

  switch (placement) {
    case 'above':
      return {
        x: satellite.x,
        y: satellite.y - satelliteRadius - gap - blockHeight / 2 + 6,
        anchor: 'middle' as const,
      };
    case 'below':
      return {
        x: satellite.x,
        y: satellite.y + satelliteRadius + gap + blockHeight / 2,
        anchor: 'middle' as const,
      };
    case 'left':
      return {
        x: satellite.x - satelliteRadius - gap,
        y: satellite.y + (lineCount > 1 ? -6 : 0),
        anchor: 'end' as const,
      };
    case 'right':
      return {
        x: satellite.x + satelliteRadius + gap,
        y: satellite.y + (lineCount > 1 ? -6 : 0),
        anchor: 'start' as const,
      };
    default: {
      const _exhaustive: never = placement;
      return _exhaustive;
    }
  }
}

function AboutDiagram({
  nodes,
  activeFocus,
  onFocusChange,
}: {
  nodes: NetworkNode[];
  activeFocus: FocusKey;
  onFocusChange: (key: FocusKey) => void;
}) {
  const isMobile = useMobileDiagramLayout();
  const { center, mainRadius, satelliteRadius, orbitRadius, innerOrbitRadius } = DIAGRAM;
  const viewBoxPad = isMobile ? DIAGRAM.viewBoxPadMobile : DIAGRAM.viewBoxPad;
  const viewW = DIAGRAM.width + viewBoxPad.x + viewBoxPad.right;
  const viewH = DIAGRAM.height + viewBoxPad.y + viewBoxPad.bottom;
  const viewBox = `${-viewBoxPad.x} ${-viewBoxPad.y} ${viewW} ${viewH}`;

  const innerFocusPoints = INNER_FOCUS_ANGLES.map(({ key, angle }) => ({
    key,
    ...polarPoint(center.x, center.y, innerOrbitRadius, angle),
  }));

  const satelliteAngles = evenSatelliteAngles(nodes.length);

  return (
    <div
      className={`cr-about-diagram${isMobile ? ' cr-about-diagram--mobile' : ''}`}
      style={isMobile ? { aspectRatio: `${viewW} / ${viewH}` } : undefined}
    >
      <svg
        viewBox={viewBox}
        className="cr-about-diagram__svg"
        role="img"
        aria-label="Caritas Rwanda network infographic"
        preserveAspectRatio="xMidYMid meet"
      >
        <circle
          cx={center.x}
          cy={center.y}
          r={mainRadius}
          className="cr-about-diagram__main-ring"
        />

        {satelliteAngles.map((angle, index) => {
          const node = nodes[index];
          if (!node) return null;

          const satellite = polarPoint(center.x, center.y, orbitRadius, angle);
          const edge = polarPoint(center.x, center.y, mainRadius, angle);
          const labelLines = splitLabel(node.label);
          const labelPos = getLabelPosition(
            satellite,
            labelPlacementForAngle(angle),
            labelLines.length,
          );

          return (
            <g key={node.label} className="cr-about-diagram__satellite">
              <line
                x1={edge.x}
                y1={edge.y}
                x2={satellite.x}
                y2={satellite.y}
                className="cr-about-diagram__connector"
              />
              <circle
                cx={satellite.x}
                cy={satellite.y}
                r={satelliteRadius}
                className="cr-about-diagram__satellite-ring"
              />
              <text
                x={satellite.x}
                y={satellite.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="cr-about-diagram__satellite-value"
                style={{ fontSize: valueFontSize(node.value, isMobile) }}
              >
                {node.value}
              </text>
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor={labelPos.anchor}
                dominantBaseline="central"
                className="cr-about-diagram__satellite-label"
                style={{ fontSize: labelFontSize(node.label, isMobile) }}
              >
                {labelLines.map((line, lineIndex) => (
                  <tspan
                    key={line}
                    x={labelPos.x}
                    dy={lineIndex === 0 ? 0 : '1.2em'}
                  >
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}
      </svg>

      {[...innerFocusPoints]
        .sort((a, b) => {
          if (a.key === activeFocus) return 1;
          if (b.key === activeFocus) return -1;
          return 0;
        })
        .map((focus) => {
        const leftPct = ((focus.x + viewBoxPad.x) / viewW) * 100;
        const topPct = ((focus.y + viewBoxPad.y) / viewH) * 100;
        const isActive = activeFocus === focus.key;
        const label = focus.key.toUpperCase();

        return (
          <button
            key={focus.key}
            type="button"
            className={`cr-about-focus${isActive ? ' is-active' : ''}`}
            style={{ left: `${leftPct}%`, top: `${topPct}%` }}
            aria-pressed={isActive}
            aria-controls="cr-about-panel"
            onClick={() => onFocusChange(focus.key)}
          >
            <span className="cr-about-focus__eyebrow">Our</span>
            <span className="cr-about-focus__label">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function AboutFocusPanel({
  activeFocus,
  missionText,
  values,
  visionText,
}: {
  activeFocus: FocusKey;
  missionText: string;
  values: string[];
  visionText: string;
}) {
  const meta = FOCUS_ITEMS.find((item) => item.key === activeFocus)!;
  const Icon = meta.Icon;

  return (
    <div id="cr-about-panel" className="cr-about-panel" role="tabpanel" aria-labelledby={`cr-about-tab-${activeFocus}`}>
      <span className="cr-about-panel__accent" aria-hidden />
      <div className="cr-about-panel__content">
        <div className="cr-about-panel__head">
          <span className="cr-about-panel__icon" aria-hidden>
            <Icon size={18} strokeWidth={2} />
          </span>
          <h3 className="cr-about-panel__title">{meta.title}</h3>
        </div>

        {activeFocus === 'mission' && (
          <p className="cr-about-panel__copy">{missionText}</p>
        )}

        {activeFocus === 'values' && (
          <ul className="cr-about-panel__values">
            {values.map((value) => (
              <li key={value}>{value}</li>
            ))}
          </ul>
        )}

        {activeFocus === 'vision' && (
          <p className="cr-about-panel__copy cr-about-panel__copy--lead">
            {stripHtml(visionText)}
          </p>
        )}
      </div>
    </div>
  );
}

export default function AboutSection(props: Record<string, unknown> = {}) {
  const content: AboutContent = {
    title: (props.title as string) || DEFAULT_CONTENT.title,
    subtitle: (props.subtitle as string) || DEFAULT_CONTENT.subtitle,
    missionText: (props.missionText as string) || DEFAULT_CONTENT.missionText,
    values: Array.isArray(props.values) ? (props.values as string[]) : DEFAULT_CONTENT.values!,
    visionText: (props.visionText as string) || DEFAULT_CONTENT.visionText,
    networkNodes: Array.isArray(props.networkNodes)
      ? (props.networkNodes as NetworkNode[])
      : DEFAULT_CONTENT.networkNodes,
  };

  const [activeFocus, setActiveFocus] = useState<FocusKey>('mission');

  return (
    <section className="cr-home-about">
      <div className="cr-about-inner">
        <header className="cr-about-header">
          <p className="cr-about-eyebrow">Who we are</p>
          <h2 className="cr-about-title">{content.title}</h2>
          <p className="cr-about-subtitle">{content.subtitle}</p>
        </header>

        <div className="cr-about-body">
          <div className="cr-about-visual">
            <div className="cr-about-visual__frame">
              <AboutDiagram
                nodes={content.networkNodes!}
                activeFocus={activeFocus}
                onFocusChange={setActiveFocus}
              />
            </div>
          </div>

          <div className="cr-about-detail">
            <div className="cr-about-tabs" role="tablist" aria-label="About Caritas Rwanda">
              {FOCUS_ITEMS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  id={`cr-about-tab-${item.key}`}
                  role="tab"
                  aria-selected={activeFocus === item.key}
                  aria-controls="cr-about-panel"
                  className={`cr-about-tab${activeFocus === item.key ? ' is-active' : ''}`}
                  onClick={() => setActiveFocus(item.key)}
                >
                  {item.title}
                </button>
              ))}
            </div>

            <AboutFocusPanel
              activeFocus={activeFocus}
              missionText={content.missionText!}
              values={content.values!}
              visionText={content.visionText!}
            />

            <div className="cr-about-cta-wrap">
              <Link href="/about" className="cr-about-cta">
                Read more about Caritas Rwanda
                <ArrowRight size={16} strokeWidth={2} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
