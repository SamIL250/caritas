"use client";

import { encodeProgramAssetUrl, type ProgramRow } from "@/lib/programs";

type Props = {
  program: ProgramRow;
  colorClass: string;
  onClick: (program: ProgramRow) => void;
};

export function ProgramBubbleCircle({ program, colorClass, onClick }: Props) {
  const imageUrl = program.cover_image_url?.trim()
    ? encodeProgramAssetUrl(program.cover_image_url)
    : "";

  const period = program.project_period?.trim() ?? "";
  const carriedBy = program.carried_by?.trim() ?? "";
  const excerpt = program.excerpt?.trim() ?? "";

  return (
    <div
      className={`bubble-circle ${colorClass}`}
      style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : undefined }}
      onClick={() => onClick(program)}
      role="button"
      tabIndex={0}
      aria-label={`${program.title}. Click for full program details.`}
      onKeyDown={(e) => e.key === "Enter" && onClick(program)}
    >
      <div className="bubble-circle-inner">
        <div className="bubble-zone bubble-zone-top">
          {period ? <p className="bubble-period">{period}</p> : null}
          {carriedBy ? <p className="bubble-carried-by">{carriedBy}</p> : null}
        </div>

        <div className="bubble-zone bubble-zone-center">
          <h4 className="bubble-title">{program.title}</h4>
          {program.subtitle?.trim() ? (
            <p className="bubble-tagline">{program.subtitle}</p>
          ) : null}
        </div>

        <div className="bubble-zone bubble-zone-bottom">
          {excerpt ? (
            <p className="bubble-desc bubble-desc-preview">{excerpt}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
