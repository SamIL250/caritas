-- Homepage about section enum label only (must commit before inserts using this value — Postgres enum rule).

alter type public.section_type add value if not exists 'home_about';
