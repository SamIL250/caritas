import React from "react";
import { Topbar } from "@/components/layout/Topbar";
import { getMergedTypographySettings } from "@/lib/site-settings";
import { TypographyForm } from "./TypographyForm";

export default async function TypographyPage() {
  const typography = await getMergedTypographySettings();

  return (
    <div className="w-full max-w-full">
      <Topbar
        title="Typography"
        subtitle="Control how large text appears across the public website"
      />

      <section className="mt-6 max-w-[860px]">
        <TypographyForm initial={typography} />
      </section>
    </div>
  );
}
