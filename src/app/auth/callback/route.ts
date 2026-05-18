import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyWelcome } from "@/lib/notify";

// OAuth providers (Google etc.) redirect here with ?code=... after the user authenticates.
// We exchange the code for a session, then bounce the user to their dashboard.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Send the signed-in user to the right dashboard for their role.
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, name, created_at")
          .eq("id", user.id)
          .maybeSingle();

        // First-time OAuth sign-in? profile.created_at is fresh (within 60s) —
        // fire the welcome email. Existing users signing in won't trigger it.
        if (profile?.created_at && user.email) {
          const ageMs = Date.now() - new Date(profile.created_at).getTime();
          if (ageMs < 60_000) {
            notifyWelcome({
              email: user.email,
              name: profile.name ?? "",
              role: (profile.role ?? "customer") as "customer" | "artist" | "admin",
            }).catch((e) => console.error("welcome notify failed:", e));
          }
        }

        const dest =
          profile?.role === "admin" ? "/admin"
          : profile?.role === "artist" ? "/artist/dashboard"
          : next;
        return NextResponse.redirect(`${origin}${dest}`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("OAuth exchange error:", error);
  }

  // Something went wrong — bounce back to login with an error flag.
  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
