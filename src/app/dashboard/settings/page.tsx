import React from "react";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { mergeFooterSettings, parseFooterFromOptions } from "@/lib/footer-settings";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();

  const footer = data ? parseFooterFromOptions(data.options) : mergeFooterSettings(undefined);
  if (data?.contact_email) {
    footer.contact.email = data.contact_email;
  }

  return (
    <div className="w-full max-w-4xl">
      <Topbar title="Settings" />

      <p className="text-sm text-[var(--color-text-muted)] max-w-4xl mt-2">
        Footer content, contact row, and legal links are stored in the database and shown on the public
        site immediately after save.
      </p>

      <section className="mt-8 max-w-4xl">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Integrations (placeholders)</h2>
        <Card className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-[var(--color-border-default)] rounded-md">
            <div>
              <h4 className="font-medium text-[var(--color-text-primary)]">Stripe Payment Gateway</h4>
              <p className="text-sm text-[var(--color-text-muted)]">Process donations on the website</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="success">Connected</Badge>
              <Button variant="secondary" className="h-8" type="button">
                Configure
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 border border-[var(--color-border-default)] rounded-md">
            <div>
              <h4 className="font-medium text-[var(--color-text-primary)]">Google OAuth</h4>
              <p className="text-sm text-[var(--color-text-muted)]">Allow editors to sign in with Google</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="warning">Not Configured</Badge>
              <Button variant="secondary" className="h-8" type="button">
                Connect
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <SettingsForm
        initial={{
          site_name: data?.site_name ?? "Caritas Rwanda",
          tagline: data?.tagline ?? "",
          logo_url: data?.logo_url ?? "",
          favicon_url: data?.favicon_url ?? "",
          footer,
        }}
      />
    </div>
  );
}
