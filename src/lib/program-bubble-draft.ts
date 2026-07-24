import type { ProgramBubbleDraft } from "@/app/actions/programs";
import type { ProgramRow } from "@/lib/programs";

export function mergeProgramBubbleDraft(
  program: ProgramRow,
  draft: Partial<ProgramBubbleDraft> | undefined,
): ProgramBubbleDraft {
  return {
    title: draft?.title ?? program.title,
    subtitle: draft?.subtitle ?? program.subtitle ?? "",
    excerpt: draft?.excerpt ?? program.excerpt ?? "",
    project_period: draft?.project_period ?? program.project_period ?? "",
    carried_by: draft?.carried_by ?? program.carried_by ?? "",
    cover_image_url: draft?.cover_image_url ?? program.cover_image_url ?? "",
  };
}

export function buildProgramBubbleDraft(
  program: ProgramRow | undefined,
  existing: ProgramBubbleDraft | undefined,
  patch: Partial<ProgramBubbleDraft>,
): ProgramBubbleDraft {
  return {
    title: patch.title ?? existing?.title ?? program?.title ?? "",
    subtitle: patch.subtitle ?? existing?.subtitle ?? program?.subtitle ?? "",
    excerpt: patch.excerpt ?? existing?.excerpt ?? program?.excerpt ?? "",
    project_period:
      patch.project_period ?? existing?.project_period ?? program?.project_period ?? "",
    carried_by: patch.carried_by ?? existing?.carried_by ?? program?.carried_by ?? "",
    cover_image_url:
      patch.cover_image_url ?? existing?.cover_image_url ?? program?.cover_image_url ?? "",
  };
}

export function applyProgramBubbleDrafts(
  programs: ProgramRow[],
  drafts: Record<string, ProgramBubbleDraft> | undefined,
): ProgramRow[] {
  if (!drafts || !Object.keys(drafts).length) return programs;

  return programs.map((program) => {
    const draft = drafts[program.id];
    if (!draft) return program;

    return {
      ...program,
      title: draft.title,
      subtitle: draft.subtitle,
      excerpt: draft.excerpt,
      project_period: draft.project_period,
      carried_by: draft.carried_by,
      cover_image_url: draft.cover_image_url,
    };
  });
}

export function persistProgramBubbleDraftOnRow(
  program: ProgramRow,
  draft: ProgramBubbleDraft,
): ProgramRow {
  return {
    ...program,
    title: draft.title.trim(),
    subtitle: draft.subtitle.trim(),
    excerpt: draft.excerpt.trim(),
    project_period: draft.project_period.trim(),
    carried_by: draft.carried_by.trim(),
    cover_image_url: draft.cover_image_url.trim(),
  };
}
