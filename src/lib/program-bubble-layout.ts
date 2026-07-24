import type { ProgramRow } from "@/lib/programs";

export type BubbleContentZone = "top" | "center" | "bottom";

export type ProgramBubbleLayout = {
  title: BubbleContentZone;
  subtitle: BubbleContentZone;
  excerpt: BubbleContentZone;
  location: BubbleContentZone;
};

export type ProgramBubbleLayoutPreset =
  | "stacked-center"
  | "title-middle"
  | "title-top"
  | "custom";

export const DEFAULT_PROGRAM_BUBBLE_LAYOUT: ProgramBubbleLayout = {
  title: "center",
  subtitle: "center",
  excerpt: "center",
  location: "center",
};

export const BUBBLE_LAYOUT_PRESET_LABELS: Record<
  Exclude<ProgramBubbleLayoutPreset, "custom">,
  string
> = {
  "stacked-center": "Stacked in the middle",
  "title-middle": "Title in the middle",
  "title-top": "Title at the top",
};

const PRESET_LAYOUTS: Record<
  Exclude<ProgramBubbleLayoutPreset, "custom">,
  ProgramBubbleLayout
> = {
  "stacked-center": DEFAULT_PROGRAM_BUBBLE_LAYOUT,
  "title-middle": {
    title: "center",
    subtitle: "top",
    excerpt: "bottom",
    location: "bottom",
  },
  "title-top": {
    title: "top",
    subtitle: "top",
    excerpt: "bottom",
    location: "bottom",
  },
};

function isBubbleZone(value: unknown): value is BubbleContentZone {
  return value === "top" || value === "center" || value === "bottom";
}

export function parseProgramBubbleLayout(raw: unknown): ProgramBubbleLayout {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...DEFAULT_PROGRAM_BUBBLE_LAYOUT };
  }
  const o = raw as Record<string, unknown>;
  return {
    title: isBubbleZone(o.title) ? o.title : DEFAULT_PROGRAM_BUBBLE_LAYOUT.title,
    subtitle: isBubbleZone(o.subtitle) ? o.subtitle : DEFAULT_PROGRAM_BUBBLE_LAYOUT.subtitle,
    excerpt: isBubbleZone(o.excerpt) ? o.excerpt : DEFAULT_PROGRAM_BUBBLE_LAYOUT.excerpt,
    location: isBubbleZone(o.location) ? o.location : DEFAULT_PROGRAM_BUBBLE_LAYOUT.location,
  };
}

export function bubbleLayoutFromProgram(
  program: Pick<ProgramRow, "bubble_layout">,
): ProgramBubbleLayout {
  return parseProgramBubbleLayout(program.bubble_layout);
}

export function detectBubbleLayoutPreset(
  layout: ProgramBubbleLayout,
): ProgramBubbleLayoutPreset {
  for (const [preset, candidate] of Object.entries(PRESET_LAYOUTS) as Array<
    [Exclude<ProgramBubbleLayoutPreset, "custom">, ProgramBubbleLayout]
  >) {
    if (
      candidate.title === layout.title &&
      candidate.subtitle === layout.subtitle &&
      candidate.excerpt === layout.excerpt &&
      candidate.location === layout.location
    ) {
      return preset;
    }
  }
  return "custom";
}

export function bubbleLayoutFromPreset(
  preset: Exclude<ProgramBubbleLayoutPreset, "custom">,
): ProgramBubbleLayout {
  return { ...PRESET_LAYOUTS[preset] };
}

export function serializeBubbleLayout(layout: ProgramBubbleLayout): ProgramBubbleLayout {
  return parseProgramBubbleLayout(layout);
}
