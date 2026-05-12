import { faSolidIconClass } from "@/lib/fontawesome";
import { formatInlineBold } from "@/lib/text-format";

export type Pillar = {
  variant: "mission" | "vision" | "values";
  label: string;
  title: string;
  body: string;
  icon?: string;
};

type Props = {
  eyebrow?: string;
  eyebrow_icon?: string;
  title?: string;
  subtitle?: string;
  anchor_id?: string;
  pillars?: Pillar[];
};

const defaultIcons: Record<Pillar["variant"], string> = {
  mission: "fa-bullseye",
  vision: "fa-eye",
  values: "fa-star",
};

function pillarCardIcon(classes: string) {
  return faSolidIconClass(classes) ?? "fa-solid fa-circle";
}

export default function PillarCardsSection({
  eyebrow,
  eyebrow_icon = "fa-bullseye",
  title,
  subtitle,
  anchor_id = "mission",
  pillars = [],
}: Props) {
  if (!pillars.length) return null;
  const eyebrowIc = faSolidIconClass(eyebrow_icon);
  return (
    <section className="section-light" id={anchor_id || undefined}>
      <div className="container">
        <div className="head-center">
          {eyebrow ? (
            <div className="sub-section-label">
              {eyebrowIc ? <i className={eyebrowIc} aria-hidden /> : null}{" "}
              {eyebrow}
            </div>
          ) : null}
          {title ? <h2 className="sub-section-title">{title}</h2> : null}
          {subtitle ? <p className="sub-section-subtitle">{subtitle}</p> : null}
        </div>
        <div className="mvv-grid">
          {pillars.map((p, idx) => {
            const icon = p.icon || defaultIcons[p.variant];
            const cardClass =
              p.variant === "values" ? "mvv-card values-card" : `mvv-card ${p.variant}`;
            return (
              <div className={cardClass} key={idx}>
                <div className="mvv-icon">
                  <i className={pillarCardIcon(icon)} aria-hidden />
                </div>
                <div className="mvv-card-label">{p.label}</div>
                <h3>{p.title}</h3>
                <p>{formatInlineBold(p.body)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
