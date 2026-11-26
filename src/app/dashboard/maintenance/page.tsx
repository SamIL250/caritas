import React from "react";
import { Topbar } from "@/components/layout/Topbar";
import { getMaintenanceSettings } from "@/lib/maintenance";
import { MaintenanceForm } from "./MaintenanceForm";

export default async function MaintenancePage() {
  const settings = await getMaintenanceSettings();

  return (
    <div className="w-full max-w-full">
      <Topbar
        title="Maintenance"
        subtitle="Replace the public website with a holding screen while you prepare a launch"
      />

      <section className="mt-6 max-w-[860px]">
        <MaintenanceForm initial={settings} />
      </section>
    </div>
  );
}
