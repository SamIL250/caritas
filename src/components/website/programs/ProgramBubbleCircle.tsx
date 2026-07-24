"use client";

import React from "react";
import {
  bubbleLayoutFromProgram,
  type BubbleContentZone,
  type ProgramBubbleLayout,
} from "@/lib/program-bubble-layout";
import { encodeProgramAssetUrl, type ProgramRow } from "@/lib/programs";

type Props = {
  program: ProgramRow;
  colorClass: string;
  onClick: (program: ProgramRow) => void;
};

type BubbleBlock = {
  key: string;
  zone: BubbleContentZone;
  node: React.ReactNode;
};

function zoneNodes(blocks: BubbleBlock[]) {
  const zones: Record<BubbleContentZone, React.ReactNode[]> = {
    top: [],
    center: [],
    bottom: [],
  };
  for (const block of blocks) {
    zones[block.zone].push(<React.Fragment key={block.key}>{block.node}</React.Fragment>);
  }
  return zones;
}

export function ProgramBubbleCircle({ program, colorClass, onClick }: Props) {
  const layout = bubbleLayoutFromProgram(program);
  const imageUrl = program.cover_image_url?.trim()
    ? encodeProgramAssetUrl(program.cover_image_url)
    : "";

  const blocks: BubbleBlock[] = [
    {
      key: "title",
      zone: layout.title,
      node: <h4 className="bubble-title">{program.title}</h4>,
    },
  ];

  if (program.subtitle?.trim()) {
    blocks.push({
      key: "subtitle",
      zone: layout.subtitle,
      node: <p className="bubble-tagline">{program.subtitle}</p>,
    });
    blocks.push({
      key: "sep",
      zone: layout.subtitle,
      node: <div className="bubble-sep" aria-hidden />,
    });
  }

  if (program.excerpt?.trim()) {
    blocks.push({
      key: "excerpt",
      zone: layout.excerpt,
      node: <p className="bubble-desc">{program.excerpt}</p>,
    });
  }

  blocks.push({
    key: "location",
    zone: layout.location,
    node: (
      <div className="bubble-loc">
        <i className="fa-solid fa-location-dot" aria-hidden />
        {program.location?.trim() || "Rwanda"}
      </div>
    ),
  });

  const grouped = zoneNodes(blocks);

  return (
    <div
      className={`bubble-circle ${colorClass}`}
      style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : undefined }}
      onClick={() => onClick(program)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick(program)}
    >
      <div className="bubble-circle-inner">
        <div className="bubble-zone bubble-zone-top">{grouped.top}</div>
        <div className="bubble-zone bubble-zone-center">{grouped.center}</div>
        <div className="bubble-zone bubble-zone-bottom">{grouped.bottom}</div>
      </div>
    </div>
  );
}

export function layoutFieldsFromProgram(program: Pick<ProgramRow, "bubble_layout">): ProgramBubbleLayout {
  return bubbleLayoutFromProgram(program);
}
