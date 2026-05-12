import { DashboardShell } from "@/components/layout/DashboardShell";
import { createClient } from "@/lib/supabase/server";
import "../globals.css";
import "../resources-impact-section.css";
import "./dashboard.css";

import { DonationProvider } from "@/context/DonationContext";
import DonationModalWrapper from "@/components/website/DonationModalWrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let profile = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    profile = data;
  }

  const { count: pagesCount } = await supabase.from("pages").select("*", { count: "exact", head: true });

  return (
    <DonationProvider>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      {/* Brand Fonts for Preview */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap" 
        rel="stylesheet" 
      />
      <DashboardShell profile={profile} initialPagesCount={pagesCount ?? 0}>
        {children}
      </DashboardShell>
      <DonationModalWrapper />
    </DonationProvider>
  );
}
