import { faSolidIconClass } from "@/lib/fontawesome";

type ValueItem = {
  icon: string;
  name: string;
};

type Props = {
  eyebrow?: string;
  eyebrow_icon?: string;
  title?: string;
  subtitle?: string;
  anchor_id?: string;
  items?: ValueItem[];
};

export default function ValuesGridSection({
  eyebrow,
  eyebrow_icon = "fa-star",
  title,
  subtitle,
  anchor_id = "values",
  items = [],
}: Props) {
  if (!items.length) return null;
  const eyebrowIc = faSolidIconClass(eyebrow_icon);
  return (
    <section className="section-cream" id={anchor_id || undefined}>
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
        <div className="values-grid">
          {items.map((v, idx) => (
            <div className="value-pill" key={idx}>
              <div className="value-pill-icon">
                <i className={faSolidIconClass(v.icon) ?? "fa-solid fa-circle"} aria-hidden />
              </div>
              <div className="value-pill-name">{v.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
