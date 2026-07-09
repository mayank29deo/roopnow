import { NextResponse, after, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyWelcome } from "@/lib/notify";

// OAuth providers (Google etc.) redirect here with ?code=... after the
// user authenticates. We exchange the code for a session, then route
// the signed-in user to the right dashboard for their role.
//
// Role intent for fresh signups is carried via a short-lived cookie
// (set on the signup page right before signInWithOAuth) instead of a
// URL query param — Supabase's redirect allowlist rejects redirectTo
// URLs with extra query params and silently falls back to the Site
// URL. When the cookie says role=artist on a fresh OAuth signup, we
// upgrade the auto-created profile from customer → artist and seed
// the artists row that the Postgres trigger skipped (the trigger
// skipped because Google's raw_user_meta_data has no role field).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  const cookieStore = await cookies();
  const roleIntent = cookieStore.get("roop_signup_role")?.value;
  if (roleIntent) {
    // Single-use — drop it now so a later login doesn't accidentally re-upgrade.
    cookieStore.delete("roop_signup_role");
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, name, created_at")
          .eq("id", user.id)
          .maybeSingle();

        const isFreshSignup =
          profile?.created_at &&
          Date.now() - new Date(profile.created_at).getTime() < 60_000;

        // Fresh OAuth signup that wanted to be an artist? Upgrade the
        // profile and seed the artists row. Existing users signing back
        // in keep their current role regardless of the toggle.
        let effectiveRole = profile?.role ?? "customer";
        if (
          isFreshSignup &&
          roleIntent === "artist" &&
          effectiveRole === "customer"
        ) {
          const admin = createAdminClient();
          await admin
            .from("profiles")
            .update({ role: "artist" })
            .eq("id", user.id);
          await admin
            .from("artists")
            .insert({
              user_id: user.id,
              display_name: profile?.name ?? "New Artist",
              tagline: "New artist on Roop",
              bio: "Tell us about your style and experience.",
              city: "Bengaluru",
              avatar_url:
                "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&q=80",
              cover_url:
                "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1600&q=80",
              specialties: "Bridal,Party,Editorial",
            })
            .select()
            .maybeSingle();
          effectiveRole = "artist";
        }

        // Welcome email — fires once per user on the first OAuth callback.
        // Uses the post-upgrade role so artists get the artist email.
        // 9-Jul: wrapped in after() so the serverless runtime keeps
        // the promise alive past the redirect response.
        if (isFreshSignup && user.email) {
          const emailAddr = user.email;
          const nameSnapshot = profile?.name ?? "";
          const roleSnapshot = effectiveRole as "customer" | "artist" | "admin";
          after(async () => {
            try { await notifyWelcome({ email: emailAddr, name: nameSnapshot, role: roleSnapshot }); }
            catch (e) { console.error("welcome notify failed:", e); }
          });
        }

        const dest =
          effectiveRole === "admin" ? "/admin"
          : effectiveRole === "artist" ? "/artist/dashboard"
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
