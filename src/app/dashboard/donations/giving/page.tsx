import React from "react";
import { Topbar } from "@/components/layout/Topbar";
import { createClient } from "@/lib/supabase/server";
import { DONATION_GIVING_DEFAULTS, parseDonationGivingSettings } from "@/lib/donation-giving";
import { GivingSettingsForm } from "./GivingSettingsForm";

export default async function DonationGivingPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("donation_giving_settings").select("*").limit(1).maybeSingle();
  const settings = data ? parseDonationGivingSettings(data) : { ...DONATION_GIVING_DEFAULTS };

  return (
    <div className="w-full max-w-full">
      <Topbar
        title="How to give"
        subtitle="Contact details shown in the donate window while online payment is off"
      />
      <section className="mt-6 max-w-[860px]">
        <GivingSettingsForm initial={settings} />
      </section>
    </div>
  );
}
