import { createClient } from "@/lib/supabase/server";
import {
  getTotalViews,
  getViewsByDay,
  getTopViewed,
  getNewsCategoryBreakdown,
  getPublicationCategoryBreakdown,
  getProgramCategoryBreakdown,
} from "@/lib/page-analytics";
import { AnalyticsDashboardClient } from "./AnalyticsDashboardClient";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const [
    totalViews,
    viewsByDay,
    topNews,
    topPublications,
    topPrograms,
    newsCatBreakdown,
    pubCatBreakdown,
    progCatBreakdown,
  ] = await Promise.all([
    getTotalViews(supabase),
    getViewsByDay(supabase, 30),
    getTopViewed(supabase, "news_article", 10),
    getTopViewed(supabase, "publication", 10),
    getTopViewed(supabase, "program", 10),
    getNewsCategoryBreakdown(supabase),
    getPublicationCategoryBreakdown(supabase),
    getProgramCategoryBreakdown(supabase),
  ]);

  return (
    <AnalyticsDashboardClient
      totalViews={totalViews}
      viewsByDay={viewsByDay}
      topNews={topNews}
      topPublications={topPublications}
      topPrograms={topPrograms}
      newsCatBreakdown={newsCatBreakdown}
      pubCatBreakdown={pubCatBreakdown}
      progCatBreakdown={progCatBreakdown}
    />
  );
}
