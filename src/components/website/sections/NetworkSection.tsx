import { faSolidIconClass } from "@/lib/fontawesome";

import { DioceseNetworkGrid } from "./DioceseNetworkGrid";
import type { DioceseCard, DioceseModalDetail, NetStat } from "./diocese-network-types";

export type { DioceseCard, DioceseModalDetail, NetStat };

type Props = {
  eyebrow?: string;
  eyebrow_icon?: string;
  title?: string;
  subtitle?: string;
  anchor_id?: string;
  stats?: NetStat[];
  dioceses?: DioceseCard[];
};

export default function NetworkSection({
  eyebrow,
  eyebrow_icon = "fa-network-wired",
  title,
  subtitle,
  anchor_id = "network",
  stats = [],
  dioceses = [],
}: Props) {
  if (!stats.length && !dioceses.length) return null;
  const eyebrowIc = faSolidIconClass(eyebrow_icon);

  return (
    <section className="section-light" id={anchor_id || undefined}>
      <div className="container">
        <div className="head-center">
          {eyebrow ? (
            <div className="sub-section-label">
              {eyebrowIc ? <i className={eyebrowIc} aria-hidden /> : null} {eyebrow}
            </div>
          ) : null}
          {title ? <h2 className="sub-section-title">{title}</h2> : null}
          {subtitle ? <p className="sub-section-subtitle">{subtitle}</p> : null}
        </div>

        {stats.length > 0 ? (
          <div className="network-stats-row">
            {stats.map((s, i) => (
              <div key={i} className="net-stat-card">
                <div className="net-stat-number">{s.number}</div>
                <div className="net-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        ) : null}

        {dioceses.length > 0 ? <DioceseNetworkGrid items={dioceses} /> : null}
      </div>
    </section>
  );
}
