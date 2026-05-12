import { categoryLabel, type NewsArticleCategory } from "@/lib/news";
import type { DepartmentRelatedRow } from "@/lib/department-related";

export type ProgramRelatedSection = {
  id: string;
  title: string;
  description?: string;
  items: DepartmentRelatedRow[];
};

/** Human-readable publication pillar labels (meta_label = publication_categories.slug). */
const PUBLICATION_GROUP_LABEL: Record<string, { title: string; description?: string }> = {
  success_story: {
    title: "Success stories",
    description: "Impact narratives and beneficiary voices linked to this program area.",
  },
  recent_update: {
    title: "Updates & briefs",
    description: "Short updates and external coverage.",
  },
  newsletter: {
    title: "Newsletters",
    description: "Organizational bulletins and PDF newsletters.",
  },
  annual_report: {
    title: "Reports",
    description: "Annual and accountability publications.",
  },
  strategic_plan: {
    title: "Strategic documents",
    description: "Plans and frameworks.",
  },
};

function publicationSectionMeta(slug: string): { title: string; description?: string } {
  return (
    PUBLICATION_GROUP_LABEL[slug] ?? {
      title: slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    }
  );
}

function newsTopicLabel(meta: string | null): string {
  if (!meta) return "News";
  return categoryLabel(meta as NewsArticleCategory);
}

/**
 * Turns a flat RPC feed into clean UI sections for the program detail “related hub”.
 */
export function groupDepartmentRowsForProgramPage(rows: DepartmentRelatedRow[]): ProgramRelatedSection[] {
  const news = rows.filter((r) => r.source_kind === "news");
  const morePrograms = rows.filter((r) => r.source_kind === "program");
  const publications = rows.filter((r) => r.source_kind === "publication");

  const byPubSlug = new Map<string, DepartmentRelatedRow[]>();
  for (const p of publications) {
    const key = (p.meta_label || "publication").trim() || "publication";
    const bucket = byPubSlug.get(key) ?? [];
    bucket.push(p);
    byPubSlug.set(key, bucket);
  }

  const sections: ProgramRelatedSection[] = [];

  if (news.length) {
    const topicKeys = [...new Set(news.map((n) => n.meta_label).filter(Boolean))] as string[];
    if (topicKeys.length <= 1) {
      sections.push({
        id: "news",
        title: "News",
        description: topicKeys[0]
          ? `Stories from the newsroom (${newsTopicLabel(topicKeys[0])}) tied to this pillar.`
          : "Stories from the newsroom tied to this pillar.",
        items: news,
      });
    } else {
      for (const topic of topicKeys) {
        const items = news.filter((n) => n.meta_label === topic);
        if (items.length) {
          sections.push({
            id: `news-${topic}`,
            title: `News — ${newsTopicLabel(topic)}`,
            items,
          });
        }
      }
    }
  }

  if (morePrograms.length) {
    sections.push({
      id: "programs",
      title: "More programs",
      description: "Other activities and project pages under this pillar.",
      items: morePrograms,
    });
  }

  const pubOrder = ["success_story", "recent_update", "newsletter", "annual_report", "strategic_plan"];
  const remaining = [...byPubSlug.keys()].sort((a, b) => {
    const ia = pubOrder.indexOf(a);
    const ib = pubOrder.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  for (const slug of remaining) {
    const items = byPubSlug.get(slug);
    if (!items?.length) continue;
    const meta = publicationSectionMeta(slug);
    sections.push({
      id: `pub-${slug}`,
      title: meta.title,
      description: meta.description,
      items,
    });
  }

  return sections;
}
