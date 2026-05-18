export type ProgressBar = { label: string; percent: number };
export type ProgramStat = { value: string; label: string };

export type ProgramTabContent = {
  name: string;
  description: string;
  icon: string;
  icon_color: string;
  icon_bg: string;
  accent_color: string;
  stats: ProgramStat[];
  progress_bars: ProgressBar[];
  callout?: string;
};

export default function MetricsProgramCard({ content }: { content: ProgramTabContent }) {
  const {
    name,
    description,
    icon,
    icon_color,
    icon_bg,
    accent_color,
    stats,
    progress_bars,
    callout,
  } = content;

  return (
    <div className="metrics-program-card" style={{ '--accent': accent_color } as React.CSSProperties}>
      {/* Header */}
      <div className="metrics-program-header">
        <div className="metrics-program-icon" style={{ background: icon_bg, color: icon_color }}>
          <i className={`fa-solid ${icon}`} aria-hidden />
        </div>
        <div>
          <div className="metrics-program-name">{name}</div>
          <div className="metrics-program-desc">{description}</div>
        </div>
      </div>

      {/* Stats row */}
      <div className="metrics-program-stats">
        {stats.map((s, i) => (
          <div className="metrics-program-stat" key={i}>
            <div className="metrics-program-stat-val" style={{ color: accent_color }}>
              {s.value}
            </div>
            <div className="metrics-program-stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bars */}
      <div className="metrics-program-bars">
        {progress_bars.map((bar, i) => (
          <div className="metrics-prog-bar-wrap" key={i}>
            <div className="metrics-prog-bar-label">
              <span>{bar.label}</span>
              <span>{bar.percent}%</span>
            </div>
            <div className="metrics-prog-bar-track">
              <div
                className="metrics-prog-bar-fill"
                style={{ width: `${bar.percent}%`, background: accent_color }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Callout */}
      {callout ? (
        <div className="metrics-program-callout" style={{ borderColor: accent_color }}>
          <i className="fa-solid fa-circle-info" style={{ color: accent_color }} aria-hidden />
          <p>{callout}</p>
        </div>
      ) : null}
    </div>
  );
}
