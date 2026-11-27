"use client";

import { usePathname } from "next/navigation";
import type { ComplianceNoticeSettings } from "@/lib/compliance-notice";
import { ComplianceNotice } from "@/components/website/ComplianceNotice";

export function HomepageComplianceNotice({ settings }: { settings: ComplianceNoticeSettings }) {
  const pathname = usePathname();
  if (pathname !== "/" || !settings.enabled) return null;
  return <ComplianceNotice settings={settings} />;
}
