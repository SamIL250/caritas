export type StatCard = {
  id: string;
  icon: string;
  icon_color: string;
  icon_bg: string;
  value: string;
  label: string;
  sub_label?: string | null;
  sort_order: number;
};

export default function MetricsStatCards({ cards }: { cards: StatCard[] }) {
  return (
    <div className="metrics-stat-grid">
      {cards.map((c) => (
        <div className="metrics-stat-card" key={c.id}>
          <div
            className="metrics-stat-card-icon"
            style={{ background: c.icon_bg, color: c.icon_color }}
          >
            <i className={`fa-solid ${c.icon}`} aria-hidden />
          </div>
          <div className="metrics-stat-card-body">
            <div className="metrics-stat-card-val">{c.value}</div>
            <div className="metrics-stat-card-label">{c.label}</div>
            {c.sub_label ? (
              <div className="metrics-stat-card-sub">{c.sub_label}</div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
