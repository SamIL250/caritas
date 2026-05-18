export type ProvinceReach = {
  name: string;
  color: string;
  dioceses: number;
  beneficiaries: string;
  districts: number;
};

export type ReachTabContent = {
  heading: string;
  subheading: string;
  provinces: ProvinceReach[];
};

export default function MetricsReachGrid({ content }: { content: ReachTabContent }) {
  const { heading, subheading, provinces } = content;

  return (
    <div className="metrics-reach-section">
      <div className="metrics-reach-header">
        <h3 className="metrics-reach-title">{heading}</h3>
        <p className="metrics-reach-sub">{subheading}</p>
      </div>

      <div className="metrics-reach-grid">
        {provinces.map((p, i) => (
          <div className="metrics-reach-card" key={i}>
            <div className="metrics-reach-card-icon" style={{ background: p.color }}>
              <i className="fa-solid fa-map-location-dot" aria-hidden />
            </div>
            <div className="metrics-reach-card-name">{p.name} Province</div>
            <div className="metrics-reach-card-stat">
              <span className="val">{p.beneficiaries}</span>
              <span className="lbl">Beneficiaries</span>
            </div>
            <div className="metrics-reach-card-details">
              <div>
                <strong>{p.dioceses}</strong> Dioceses
              </div>
              <span className="divider">•</span>
              <div>
                <strong>{p.districts}</strong> Districts
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
