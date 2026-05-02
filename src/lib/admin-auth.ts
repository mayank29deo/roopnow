import { redirect } from "next/navigation";
import { getSessionUser } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";

// Server-side guard for /admin routes. Redirects non-admins to home so the
// route stays invisible to regular users / artists. Returns the admin user
// + a service-role Supabase client (bypasses RLS — only call this AFTER the
// admin check).
export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/");
  return { user, admin: createAdminClient() };
}
