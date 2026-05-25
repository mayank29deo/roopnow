import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Upgrade an existing customer into an artist in place. Used by the
// Nav "Become an Artist" action so users who signed up as a customer
// (or who were defaulted to one by Google OAuth before the role-intent
// fix) can flip without re-registering.
//
// Side effects:
//   • profiles.role          → "artist"
//   • artists                → row inserted (if missing) with seed values
//
// Idempotent: a customer who already has an artists row gets only the
// role flip. Existing artists / admins are rejected.
export async function POST() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role === "admin") {
    return NextResponse.json({ error: "Admins cannot become artists" }, { status: 409 });
  }
  if (user.role === "artist" && user.artistId) {
    return NextResponse.json({ ok: true, role: "artist", artistId: user.artistId });
  }

  const admin = createAdminClient();

  // Promote the role first so downstream RLS recognises them as an artist.
  const { error: roleErr } = await admin
    .from("profiles")
    .update({ role: "artist" })
    .eq("id", user.id);
  if (roleErr) return NextResponse.json({ error: roleErr.message }, { status: 400 });

  // Ensure an artists row exists. If one was orphaned from a previous
  // attempt, reuse it instead of failing the unique(user_id) constraint.
  const { data: existing } = await admin
    .from("artists")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  let artistId = existing?.id ?? null;
  if (!artistId) {
    const { data: inserted, error: insErr } = await admin
      .from("artists")
      .insert({
        user_id: user.id,
        display_name: user.name || "New Artist",
        tagline: "New artist on Roop",
        bio: "Tell us about your style and experience.",
        city: "Bengaluru",
        avatar_url:
          "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&q=80",
        cover_url:
          "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1600&q=80",
        specialties: "Bridal,Party,Editorial",
      })
      .select("id")
      .single();
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 });
    artistId = inserted.id;
  }

  // Bust the root layout cache so Nav re-fetches the session user and
  // stops showing the customer-only "Become an Artist" item.
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, role: "artist", artistId });
}
