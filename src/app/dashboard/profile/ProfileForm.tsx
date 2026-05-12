"use client";

import React, { useState } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Topbar } from "@/components/layout/Topbar";
import { changePassword, updateProfile, type ProfilePreferences } from "@/app/actions/profile";
import type { Json } from "@/types/database.types";
import { Loader2, Lock, User, Bell, LayoutTemplate } from "lucide-react";

type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  avatar_url: string | null;
  preferences: Json;
};

export function ProfileForm({ user, profile }: { user: SupabaseUser; profile: ProfileRow | null }) {
  const rawPrefs = profile?.preferences;
  const prefs: ProfilePreferences =
    rawPrefs && typeof rawPrefs === "object" && !Array.isArray(rawPrefs) ? (rawPrefs as ProfilePreferences) : {};
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSaveAccount(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const r = await updateProfile(fd);
    setSaving(false);
    if ("error" in r && r.error) setMsg({ ok: false, text: r.error });
    else setMsg({ ok: true, text: "Profile updated." });
  }

  async function onSavePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwSaving(true);
    setPwMsg(null);
    const fd = new FormData(e.currentTarget);
    const r = await changePassword(fd);
    setPwSaving(false);
    if ("error" in r && r.error) setPwMsg({ ok: false, text: r.error });
    else {
      setPwMsg({ ok: true, text: "Password changed." });
      (e.currentTarget as HTMLFormElement).reset();
    }
  }

  return (
    <div className="w-full max-w-3xl">
      <Topbar
        title="Profile"
        subtitle="Account email is managed by your sign-in provider. You can update your display name, avatar, and preferences below."
      />

      {msg && (
        <p className={`mt-3 text-sm ${msg.ok ? "text-emerald-700" : "text-red-600"}`} role="status">
          {msg.text}
        </p>
      )}

      <form onSubmit={onSaveAccount} className="mt-6 space-y-6">
        <Card className="space-y-4 border-stone-200/90 p-4 sm:p-6">
          <div className="flex items-center gap-2 text-stone-800">
            <User className="h-4 w-4 text-[var(--color-primary)]" />
            <h2 className="text-base font-bold">Account</h2>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">Email</label>
            <Input value={user.email || ""} readOnly className="bg-stone-50 text-stone-600" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="full_name">
              Display name
            </label>
            <Input
              id="full_name"
              name="full_name"
              defaultValue={profile?.full_name || ""}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="avatar_url">
              Avatar image URL
            </label>
            <Input
              id="avatar_url"
              name="avatar_url"
              type="url"
              defaultValue={profile?.avatar_url || ""}
              placeholder="https://…"
            />
            <p className="text-[11px] text-stone-400">Paste a public image URL, or add one from Media after upload.</p>
          </div>
          <div className="rounded-lg border border-stone-200/80 bg-stone-50/50 p-3">
            <p className="text-xs text-stone-500">
              Role: <span className="font-semibold capitalize text-stone-700">{profile?.role || "—"}</span>
            </p>
          </div>
        </Card>

        <Card className="space-y-4 border-stone-200/90 p-4 sm:p-6">
          <div className="flex items-center gap-2 text-stone-800">
            <Bell className="h-4 w-4 text-[var(--color-primary)]" />
            <h2 className="text-base font-bold">Preferences</h2>
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-stone-200/80 p-3 hover:bg-stone-50/80">
            <input
              type="checkbox"
              name="email_notifications"
              defaultChecked={prefs.emailNotifications === true}
              className="mt-0.5 h-4 w-4 rounded border-stone-300"
            />
            <span>
              <span className="text-sm font-medium text-stone-800">Product email notifications</span>
              <span className="mt-0.5 block text-xs text-stone-500">
                Receive important updates about the CMS and your site (when we enable messaging).
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-stone-200/80 p-3 hover:bg-stone-50/80">
            <input
              type="checkbox"
              name="compact_cms"
              defaultChecked={prefs.compactCmsLayout === true}
              className="mt-0.5 h-4 w-4 rounded border-stone-300"
            />
            <span>
              <span className="text-sm font-medium text-stone-800">Compact dashboard layout</span>
              <span className="mt-0.5 block text-xs text-stone-500">
                Denser tables and less vertical spacing in list views (where supported).
              </span>
            </span>
          </label>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" className="h-10 min-w-[8rem] px-5" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </form>

      <h3 className="mb-2 mt-10 flex items-center gap-2 text-stone-800">
        <Lock className="h-4 w-4 text-[var(--color-primary)]" />
        <span className="text-base font-bold">Security</span>
      </h3>
      {pwMsg && (
        <p className={`mb-3 text-sm ${pwMsg.ok ? "text-emerald-700" : "text-red-600"}`} role="status">
          {pwMsg.text}
        </p>
      )}
      <form onSubmit={onSavePassword} className="space-y-4">
        <Card className="space-y-4 border-stone-200/90 p-4 sm:p-6">
          <p className="text-sm text-stone-500">Change the password for email sign-in. Google-only accounts can still use this after setting a password from Supabase or support.</p>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="current_password">
              Current password
            </label>
            <Input id="current_password" name="current_password" type="password" autoComplete="current-password" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="new_password">
              New password
            </label>
            <Input id="new_password" name="new_password" type="password" autoComplete="new-password" minLength={8} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500" htmlFor="confirm_password">
              Confirm new password
            </label>
            <Input id="confirm_password" name="confirm_password" type="password" autoComplete="new-password" minLength={8} />
          </div>
          <div className="flex justify-end pt-1">
            <Button type="submit" variant="secondary" className="h-10" disabled={pwSaving}>
              {pwSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
            </Button>
          </div>
        </Card>
      </form>

      <p className="mt-6 flex items-center gap-1.5 text-xs text-stone-400">
        <LayoutTemplate className="h-3.5 w-3.5" />
        To sign out of this device, use the control in the sidebar. Session limits are coming soon.
      </p>
    </div>
  );
}
