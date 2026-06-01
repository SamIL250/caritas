# Plan: Leadership Section Timeline Redesign

Match the about.html horizontal scrolling timeline design.

## Files to Change

1. `src/components/website/sections/LeadershipGridSection.tsx` — rewrite both the static fallback and CMS-driven mode
2. `src/app/website.css` — replace `.ldr-*` timeline CSS with about.html's exact CSS (lines 999–1157)
3. `src/app/about-page-editor-preview.css` — mirror the same CSS changes

## Step 1 — DB: Update leadership content in Supabase

Run this script from project root:

```cjs
// update-leadership-content.cjs
const { createClient } = require("@supabase/supabase-js");
const SUPABASE_URL = "https://cxegiairrptsbaogkmqf.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4ZWdpYWlycnB0c2Jhb2drbXFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzEwNDc5OCwiZXhwIjoyMDkyNjgwNzk4fQ.WZFMNYZ5Cf3hxUROMlacLjpiyVTTrE6VM6KuBKSMq3M";
async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const { data: page } = await supabase.from("pages").select("id").eq("slug","about").single();
  const { data: section } = await supabase.from("sections").select("id,content").eq("page_id",page.id).eq("section_key","about_leadership").single();
  const content = section.content;
  const newContent = {
    eyebrow:"Leadership Chronicle", eyebrow_icon:"fa-scroll",
    title:"A Legacy of Faithful Service",
    subtitle:"Since 1959, faithful shepherds have guided Caritas Rwanda through decades of challenge, growth, and transformation — each era leaving a lasting mark on our mission.",
    anchor_id:"leadership", watermark_text:"SINCE 1959",
    groups:[
      { subgroup_label:"Chairpersons", subgroup_icon:"fa-crown", era_span:"1959 — Present", members:[
        { year:"1959", name:"Archbishop Perraudin", role:"Founding Chairperson", photo_url: content.groups?.[0]?.members?.[0]?.photo_url||"", period:"1959 – 1972", duration:"13 yrs", duration_years:13 },
        { year:"1972", name:"H.E. Mgr. Jean Baptiste Gahamanyi", role:"Chairperson", photo_url: content.groups?.[0]?.members?.[1]?.photo_url||"", period:"1972 – 1997", duration:"25 yrs", duration_years:25 },
        { year:"1997", name:"H.E. Mgr. Thaddée Ntihinyurwa", role:"Chairperson", photo_url: content.groups?.[0]?.members?.[2]?.photo_url||"", period:"1997 – 2022", duration:"25 yrs", duration_years:25 },
        { year:"2022", name:"H.E. Mgr. Anaclet Mwumvaneza", role:"Chairperson — Nyundo Diocese", photo_url: content.groups?.[0]?.members?.[3]?.photo_url||"", featured:true, period:"2022 – Present", duration:"", duration_years:4 },
      ]},
      { subgroup_label:"Secretary Generals", subgroup_icon:"fa-person-chalkboard", era_span:"1961 — Present", members:[
        { year:"1961", name:"Father Arthur Dejemeppe", role:"Secretary General", photo_url:content.groups?.[1]?.members?.[0]?.photo_url||"", period:"1961 – 1972", duration:"11 yrs", duration_years:11 },
        { year:"1972", name:"Father Roger Pien", role:"Secretary General", photo_url:content.groups?.[1]?.members?.[2]?.photo_url||"", period:"1972 – 1973", duration:"1 yr", duration_years:1 },
        { year:"1973", name:"Father Cyriaque Munyansanga", role:"Secretary General", photo_url:content.groups?.[1]?.members?.[3]?.photo_url||"", period:"1973 – 1977", duration:"4 yrs", duration_years:4 },
        { year:"1977", name:"Father Carles Maria Giol", role:"Secretary General", photo_url:content.groups?.[1]?.members?.[4]?.photo_url||"", period:"1977 – 1978", duration:"1 yr", duration_years:1 },
        { year:"1978", name:"Father Michel Descombes", role:"Secretary General", photo_url:content.groups?.[1]?.members?.[5]?.photo_url||"", period:"1978 – 1995", duration:"17 yrs", duration_years:17 },
        { year:"1995", name:"Father Callixte Twagirayezu", role:"Secretary General", photo_url:content.groups?.[1]?.members?.[7]?.photo_url||"", period:"1995 – 1996", duration:"1 yr", duration_years:1 },
        { year:"1996", name:"Msgr. Oreste Incimatata", role:"Secretary General", photo_url:content.groups?.[1]?.members?.[8]?.photo_url||"", period:"1996 – 2013", duration:"17 yrs", duration_years:17 },
        { year:"2013", name:"H.E. Mgr. Anaclet Mwumvaneza", role:"Secretary General", photo_url:content.groups?.[1]?.members?.[9]?.photo_url||"", period:"2013 – 2016", duration:"3 yrs", duration_years:3 },
        { year:"2016", name:"H.E. Mgr. JMV Twagirayezu", role:"Secretary General", photo_url:content.groups?.[1]?.members?.[10]?.photo_url||"", period:"2016 – 2023", duration:"7 yrs", duration_years:7 },
        { year:"2023", name:"Father Oscar Kagimbura", role:"Secretary General", photo_url:content.groups?.[1]?.members?.[11]?.photo_url||"", featured:true, period:"2023 – Present", duration:"", duration_years:3 },
      ]},
    ],
  };
  await supabase.from("sections").update({content:newContent, updated_at:new Date().toISOString()}).eq("id",section.id);
  console.log("✓ Updated");
}
main().catch(err=>{console.error(err);process.exit(1)});
```

## Step 2 — Rewrite LeadershipGridSection.tsx

Replace the entire file. Key changes:

- Remove `LeaderEraGap` component entirely
- Rewrite `LeaderNode` to render:
  - `ldr-node ldr-node--above` or `ldr-node--below` (alternating)
  - `style={{ "--dur": m.duration_years }}`
  - Card with photo, name, role, period
  - Stem (`div.ldr-stem`)
  - Dot (`div.ldr-dot`)
  - Year tag (`div.ldr-year-tag`)
  - If `featured`: add `ldr-node--current` class + `span.ldr-current-badge`
- Rewrite `LeaderScrollTimeline` to use arrow buttons with onClick handlers
- Static fallback: replace all hardcoded entries with about.html's exact DOM structure

## Step 3 — Update website.css

Replace lines ~6692–6955 with about.html's exact CSS from lines 999–1157:

- `.ldr-section` watermark
- `.ldr-era-block` and `.ldr-era-header` (keep as-is)
- `.ldr-scroll-wrap`, `.ldr-scroll`, `.ldr-arrow` (keep as-is, add proper styling)
- `.ldr-timeline` with `::before` center line
- `.ldr-node` with fixed height (480px)
- `.ldr-node--above .ldr-card` (top: 12px) and `.ldr-node--below .ldr-card` (top: 264px)
- `.ldr-photo` (86×86 circle), `img` with sepia filter
- `.ldr-stem` (vertical connector, alternating gradient)
- `.ldr-dot` (14px circle on center line)
- `.ldr-year-tag` (position near line)
- `.ldr-card-text`, `.ldr-name`, `.ldr-role`, `.ldr-period`
- `.ldr-node--current` highlight (pulse animation)
- `.ldr-current-badge` pill
- Mobile: vertical list at ≤768px
- Remove `.ldr-era-gap` block entirely

## Step 4 — Update about-page-editor-preview.css

Mirror same changes at lines ~1133–1316.

## Step 5 — Clean up

```bash
rm update-leadership-content.cjs
```

Restart dev server.
