"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function createDashboardUser(formData: FormData) {
  const adminClient = createAdminClient();
  
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const role = formData.get("role") as string;

  if (!email || !password || !fullName || !role) {
    return { error: "All fields are required." };
  }

  // 1. Create the auth user
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email
    user_metadata: { full_name: fullName }
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "Failed to create user." };
  }

  // 2. Create the profile
  const { error: profileError } = await adminClient.from('profiles').insert({
    id: authData.user.id,
    email,
    full_name: fullName,
    role: role,
  });

  if (profileError) {
    // If profile fails, we should probably clean up the auth user, 
    // but for now just report the error
    return { error: profileError.message };
  }

  revalidatePath("/users");
  return { success: true };
}

export async function deleteDashboardUser(userId: string) {
  const adminClient = createAdminClient();

  // 1. Delete from profiles (RLS might handle this but admin definitely can)
  const { error: profileError } = await adminClient.from('profiles').delete().eq('id', userId);
  
  if (profileError) return { error: profileError.message };

  // 2. Delete from auth.users
  const { error: authError } = await adminClient.auth.admin.deleteUser(userId);

  if (authError) return { error: authError.message };

  revalidatePath("/users");
  return { success: true };
}
