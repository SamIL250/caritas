import {
  categoryLabel,
  type NewsArticleRow,
} from "@/lib/news";
import {
  ArticleDetailLayout,
  type ArticleDetailPeer,
} from "@/components/website/ArticleDetailLayout";

export type NewsDetailPeer = Pick<
  NewsArticleRow,
  "id" | "title" | "slug" | "category" | "published_at" | "created_at"
>;

type Props = {
  article: NewsArticleRow;
  bodyHtml: string;
  categoryArticles: NewsDetailPeer[];
  departmentLabel: string | null;
};

function newsDetailHref(slug: string): string {
  return `/news/${encodeURIComponent(slug)}`;
}

export function NewsDetailLayout({
  article,
  bodyHtml,
  categoryArticles,
  departmentLabel,
}: Props) {
  const categoryName = categoryLabel(article.category);
  const eyebrow = departmentLabel || categoryName;
  const peers: ArticleDetailPeer[] = categoryArticles.map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    published_at: item.published_at,
    created_at: item.created_at,
  }));

  return (
    <ArticleDetailLayout
      title={article.title}
      excerpt={article.excerpt}
      bodyHtml={bodyHtml}
      coverUrl={article.image_url?.trim() || undefined}
      coverAlt={article.image_alt || article.title}
      eyebrow={eyebrow}
      publishedAt={article.published_at}
      breadcrumb={[
        { href: "/", label: "Home" },
        { href: "/news", label: "Stories and Updates" },
      ]}
      breadcrumbCurrent={categoryName}
      sidebarHeading={`More ${categoryName}`}
      sidebarAriaLabel={`More ${categoryName} articles`}
      peers={peers}
      currentId={article.id}
      detailHref={newsDetailHref}
      externalUrl={article.external_url}
    />
  );
}
