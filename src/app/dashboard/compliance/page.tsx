import React from "react";
import { Topbar } from "@/components/layout/Topbar";
import { getComplianceNoticeSettings } from "@/lib/compliance-notice";
import { ComplianceNoticeForm } from "./ComplianceNoticeForm";

export default async function ComplianceNoticePage() {
  const settings = await getComplianceNoticeSettings();

  return (
    <div className="w-full max-w-full">
      <Topbar
        title="Compliance notice"
        subtitle="The zero-tolerance poster visitors see when they open the homepage"
      />

      <section className="mt-6">
        <ComplianceNoticeForm initial={settings} />
      </section>
    </div>
  );
}
