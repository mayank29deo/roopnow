import { NextRequest, NextResponse } from "next/server";
import { createClient, getSessionUser } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "artist" || !user.artistId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();

  // Whitelist enum-style fields so the artist can't write arbitrary values.
  const allowedServiceMode = new Set(["studio", "client", "both"]);
  const allowedArtistType = new Set(["solo", "team"]);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("artists")
    .update({
      display_name: body.displayName,
      studio_name: body.studioName ?? "",
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
      service_mode: allowedServiceMode.has(body.serviceMode) ? body.serviceMode : "studio",
      artist_type: allowedArtistType.has(body.artistType) ? body.artistType : "solo",
      max_bookings_per_day: Math.max(1, Number(body.maxBookingsPerDay) || 3),
      cosmetic_brands: body.cosmeticBrands ?? "",
      outstation_available: !!body.outstationAvailable,
      outstation_conditions: body.outstationConditions ?? "",
      acne_experience: !!body.acneExperience,
      acne_experience_details: body.acneExperienceDetails ?? "",
      payment_structure: body.paymentStructure ?? "",
      payment_modes: body.paymentModes ?? "",
      invoice_available: !!body.invoiceAvailable,
      payment_notes: body.paymentNotes ?? "",
      // Legacy bank/UPI columns left untouched — UI no longer surfaces them
      // but we don't want a save to wipe out values an artist already entered.
      cancellation_policy: body.cancellationPolicy ?? "",
      agreed_to_terms: !!body.agreedToTerms,
      skin_tone_expertise: body.skinToneExpertise ?? "",
      // 7-Jul tracker item 3: artist-level trial service policy.
      trial_service_offered: !!body.trialServiceOffered,
      trial_service_description: body.trialServiceDescription ?? "",
    })
    .eq("id", user.artistId)
    .select()
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, artist: data });
}
