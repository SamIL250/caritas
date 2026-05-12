import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "./ProfileForm";

export const metadata = {
  title: "Profile - Caritas Rwanda CMS",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (error && error.code !== "PGRST116") {
    console.error("profile load", error);
  }

  return <ProfileForm user={user} profile={profile} />;
}
