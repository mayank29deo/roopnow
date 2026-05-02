import { AuthForm } from "@/components/AuthForm";
import { getSessionUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) {
    redirect(
      user.role === "admin" ? "/admin"
      : user.role === "artist" ? "/artist/dashboard"
      : "/dashboard"
    );
  }
  return <AuthForm mode="login" />;
}
