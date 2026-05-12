"use client";

import React, { useState, useEffect } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { UserPlus, Trash2, Pencil, Mail, Key, UserCheck, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createDashboardUser, deleteDashboardUser } from "@/app/actions/users";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function UsersPage() {
  const supabase = createClient();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirmation Modal states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<"invite" | "create">("invite");
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Form states
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState<"editor" | "admin">("editor");
  
  const [editingProfile, setEditingProfile] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<"editor" | "admin">("editor");
  
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Get current user
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', authData.user.id).single();
        setCurrentUser(profile);
        setIsAdmin(profile?.role === 'admin');
      }

      // Load all profiles
      const { data: allProfiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: true });
      setProfiles(allProfiles || []);

      // Load pending invites
      const { data: invites } = await supabase.from('allowed_emails').select('*').order('created_at', { ascending: false });
      setPendingInvites(invites || []);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddUser() {
    setActionError("");
    setIsSubmitting(true);

    if (!formEmail.trim()) {
      setActionError("Please enter an email address.");
      setIsSubmitting(false);
      return;
    }

    if (addMode === "create" && (!formPassword || !formName)) {
      setActionError("Name and password are required for direct creation.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (addMode === "invite") {
        // Mode 1: Whitelist email for Google login
        const exists = profiles.find((p) => p.email === formEmail.trim().toLowerCase());
        if (exists) {
          setActionError("This email already has access.");
          setIsSubmitting(false);
          return;
        }

        const { error } = await supabase.from('allowed_emails').insert({
          email: formEmail.trim().toLowerCase(),
          role: formRole,
          invited_by: currentUser?.id,
        });

        if (error) throw error;
        setActionSuccess(`Email ${formEmail} whitelisted successfully.`);
      } else {
        // Mode 2: Create account directly
        const formData = new FormData();
        formData.append("email", formEmail.trim().toLowerCase());
        formData.append("password", formPassword);
        formData.append("fullName", formName);
        formData.append("role", formRole);

        const result = await createDashboardUser(formData);
        if (result.error) throw new Error(result.error);
        
        setActionSuccess(`User ${formName} created successfully.`);
      }

      // Reset and close
      setFormEmail("");
      setFormPassword("");
      setFormName("");
      setFormRole("editor");
      setShowAddModal(false);
      setTimeout(() => setActionSuccess(""), 3000);
      loadData();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRevokeInvite(id: string) {
    setConfirmConfig({
      title: "Revoke Whitelist",
      description: "Are you sure you want to remove this email from the whitelist? They will no longer be able to sign in via Google.",
      onConfirm: async () => {
        await supabase.from('allowed_emails').delete().eq('id', id);
        setConfirmOpen(false);
        loadData();
      }
    });
    setConfirmOpen(true);
  }

  async function handleEditProfile(profile: any) {
    setEditingProfile(profile);
    setEditName(profile.full_name || "");
    setEditRole(profile.role);
    setActionError("");
    setShowEditModal(true);
  }

  async function handleSaveProfile() {
    setActionError("");
    setIsSubmitting(true);
    if (!editingProfile) return;

    try {
      const updates: any = { full_name: editName };
      if (isAdmin && editingProfile.id !== currentUser?.id) {
        updates.role = editRole;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', editingProfile.id);

      if (error) throw error;

      setShowEditModal(false);
      setActionSuccess("Profile updated successfully.");
      setTimeout(() => setActionSuccess(""), 3000);
      loadData();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemoveUser(id: string) {
    if (id === currentUser?.id) return;

    setConfirmConfig({
      title: "Delete User Account",
      description: "This action is permanent. All associated profile data will be lost and the user will lose all access immediately.",
      onConfirm: async () => {
        setConfirmOpen(false);
        setLoading(true);
        try {
          const result = await deleteDashboardUser(id);
          if (result.error) throw new Error(result.error);
          loadData();
        } catch (err: any) {
          alert("Error deleting user: " + err.message);
          setLoading(false);
        }
      }
    });
    setConfirmOpen(true);
  }

  function getInitials(name: string) {
    return name?.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "??";
  }

  if (loading && profiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--color-page-bg)]">
        <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
      </div>
    );
  }

  return (
    <>
    <div className="w-full space-y-8 sm:space-y-9">
      <Topbar
        title="Users Management"
        actions={
          isAdmin && (
            <Button variant="primary" className="h-9" onClick={() => { setActionError(""); setShowAddModal(true); }}>
              <UserPlus size={16} className="mr-2" />
              Add User
            </Button>
          )
        }
      />

      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">

        {actionSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-md px-4 py-3 flex items-center gap-3">
            <UserCheck size={18} />
            {actionSuccess}
          </div>
        )}

        {/* Active Users */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Dashboard Access ({profiles.length})
            </h2>
          </div>
          <Card className="overflow-hidden border-stone-200/90 p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 text-[var(--color-text-muted)] uppercase text-[10px] tracking-widest border-b border-stone-200">
                  <tr>
                    <th className="px-6 py-4 font-bold">User Information</th>
                    <th className="px-6 py-4 font-bold">Role</th>
                    <th className="px-6 py-4 font-bold">Joined</th>
                    {isAdmin && <th className="px-6 py-4 font-bold text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                  {profiles.map((user) => (
                    <tr key={user.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold text-xs border border-[var(--color-primary)]/10">
                            {getInitials(user.full_name)}
                          </div>
                          <div>
                            <div className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                              {user.full_name || "Anonymous User"}
                              {user.id === currentUser?.id && (
                                <Badge variant="default" className="text-[9px] h-4 py-0">Me</Badge>
                              )}
                            </div>
                            <p className="text-xs text-[var(--color-text-muted)]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={user.role === "admin" ? "warning" : "default"}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text-muted)] text-xs">
                        {new Date(user.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEditProfile(user)}
                              className="p-2 text-stone-400 hover:text-[var(--color-primary)] rounded-md hover:bg-stone-100 transition-all"
                              title="Edit Profile"
                            >
                              <Pencil size={15} />
                            </button>
                            {user.id !== currentUser?.id && (
                              <button
                                onClick={() => handleRemoveUser(user.id)}
                                className="p-2 text-stone-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-all"
                                title="Delete User"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* Pending Invites */}
        {isAdmin && pendingInvites.length > 0 && (
          <section className="animate-in fade-in slide-in-from-top-2 duration-500">
            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
              Whitelist / Pending Google Sign-ins ({pendingInvites.length})
            </h2>
            <Card className="overflow-hidden border-stone-200/90 p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-stone-50 text-[var(--color-text-muted)] uppercase text-[10px] tracking-widest border-b border-stone-200">
                    <tr>
                      <th className="px-6 py-4 font-bold">Whitelisted Email</th>
                      <th className="px-6 py-4 font-bold">Assigned Role</th>
                      <th className="px-6 py-4 font-bold">Added</th>
                      <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white text-xs">
                    {pendingInvites.map((invite) => (
                      <tr key={invite.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-400">
                              <Mail size={14} />
                            </div>
                            <span className="font-medium text-stone-700">{invite.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="default" className="scale-90 origin-left">{invite.role}</Badge>
                        </td>
                        <td className="px-6 py-4 text-stone-400">
                          {new Date(invite.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleRevokeInvite(invite.id)}
                            className="p-2 text-stone-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-all"
                            title="Remove from whitelist"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>
        )}
      </div>
    </div>

      {/* Add User Modal */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => !isSubmitting && setShowAddModal(false)} 
        title="Add Dashboard User"
      >
        <div className="space-y-6">
          <div className="flex p-1 bg-stone-100 rounded-lg">
            <button 
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${addMode === 'invite' ? 'bg-white shadow-sm text-[var(--color-primary)]' : 'text-stone-500'}`}
              onClick={() => setAddMode('invite')}
            >
              <Mail size={14} /> Whitelist (Google)
            </button>
            <button 
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${addMode === 'create' ? 'bg-white shadow-sm text-[var(--color-primary)]' : 'text-stone-500'}`}
              onClick={() => setAddMode('create')}
            >
              <Key size={14} /> Direct Account
            </button>
          </div>

          <div className="space-y-4">
            {addMode === 'create' && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Full Name</label>
                <Input
                  placeholder="John Doe"
                  value={formName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Email Address</label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={formEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {addMode === 'create' && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Temporary Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Dashboard Role</label>
              <select
                className="w-full h-10 rounded-md border border-stone-200 bg-white px-3 py-1 text-sm focus:ring-1 focus:ring-[var(--color-primary)]"
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as "editor" | "admin")}
                disabled={isSubmitting}
              >
                <option value="editor">Editor (Content Management)</option>
                <option value="admin">Admin (Full Control)</option>
              </select>
            </div>
          </div>

          {actionError && (
            <p className="text-xs text-red-600 font-bold bg-red-50 p-3 rounded-md">{actionError}</p>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
            <Button variant="secondary" onClick={() => setShowAddModal(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddUser} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : (addMode === 'invite' ? 'Whitelist Email' : 'Create Account')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal 
        isOpen={showEditModal} 
        onClose={() => !isSubmitting && setShowEditModal(false)} 
        title="Edit User Profile"
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Full Name</label>
            <Input
              value={editName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Email Address</label>
            <Input value={editingProfile?.email || ""} disabled className="bg-stone-50 text-stone-400 cursor-not-allowed" />
          </div>

          {isAdmin && editingProfile?.id !== currentUser?.id && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Role</label>
              <select
                className="w-full h-10 rounded-md border border-stone-200 bg-white px-3 py-1 text-sm focus:ring-1 focus:ring-[var(--color-primary)]"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as "editor" | "admin")}
                disabled={isSubmitting}
              >
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          {actionError && (
            <p className="text-xs text-red-600 font-bold bg-red-50 p-3 rounded-md">{actionError}</p>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
            <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveProfile} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Update Profile'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        description={confirmConfig.description}
      />
    </>
  );
}
