import { NextRequest, NextResponse } from "next/server";
import { createClient, getSessionUser } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "artist" || !user.artistId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("artists")
    .update({
      display_name: body.displayName,
      tagline: body.tagline,
      bio: body.bio,
      city: body.city,
      area: body.area,
      avatar_url: body.avatarUrl,
      cover_url: body.coverUrl,
      specialties: body.specialties,
      years_exp: body.yearsExp,
      instagram: body.instagram || null,
      experience_summary: body.experienceSummary ?? "",
      travel_radius_km: body.travelRadiusKm ?? 0,
      upi_id: body.upiId || null,
      bank_account_name: body.bankAccountName || null,
      bank_ifsc: body.bankIfsc || null,
      bank_account_no: body.bankAccountNo || null,
      cancellation_policy: body.cancellationPolicy ?? "",
      agreed_to_terms: !!body.agreedToTerms,
      skin_tone_expertise: body.skinToneExpertise ?? "",
    })
    .eq("id", user.artistId)
    .select()
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, artist: data });
}
