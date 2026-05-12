-- Postgres requires new enum labels to be committed before use in later statements.
-- Seeds that reference these values live in 20260430130601_news_as_cms_page.sql.

alter type public.section_type add value if not exists 'news_article_feed';
alter type public.section_type add value if not exists 'news_footer';
