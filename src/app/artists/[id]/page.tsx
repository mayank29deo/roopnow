import { notFound } from "next/navigation";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { ArtistProfile } from "@/components/ArtistProfile";
import { toProfileArtist } from "@/lib/supabase/shape";
import { buildAvailability } from "@/lib/availability";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();

  let rawArtist: unknown = null;
  let rawReviews: Array<{
    id: string; rating: number; comment: string; created_at: string;
    profiles: { name: string } | null;
  }> = [];
  // 28-Jun: bookings + events now carry start/end times so the
  // BookingDrawer can render "already scheduled" entries and
  // compute "available windows" against business hours.
  let bookings: {
    date: string; status: string;
    time_slot: string | null;
    duration_minutes: number | null;
    services: { duration: number | null } | null;
  }[] = [];
  let events: {
    event_date: string;
    start_time: string | null;
    end_time: string | null;
  }[] = [];
  let blocks: { blocked_date: string }[] = [];
  let additionalCharges: { id: string; name: string; description: string; sort_order: number }[] = [];

  try {
    const supabase = await createClient();
    const [artistRes, reviewsRes, bookingsRes, eventsRes, blocksRes, chargesRes] = await Promise.all([
      supabase
        .from("artists")
        .select("*, portfolio_items(id, image_url, caption, sort_order), services(id, name, description, inclusions, exclusions, trial_makeup_available, duration, price, category)")
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("reviews")
        .select("id, rating, comment, created_at, profiles(name)")
        .eq("artist_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("bookings")
        .select("date, status, time_slot, duration_minutes, services(duration)")
        .eq("artist_id", id),
      supabase
        .from("artist_events")
        .select("event_date, start_time, end_time")
        .eq("artist_id", id),
      supabase
        .from("artist_blocked_dates")
        .select("blocked_date")
        .eq("artist_id", id),
      supabase
        .from("additional_charges")
        .select("id, name, description, sort_order")
        .eq("artist_id", id)
        .order("sort_order", { ascending: true }),
    ]);
    rawArtist = artistRes.data;
    rawReviews = (reviewsRes.data ?? []) as unknown as typeof rawReviews;
    bookings = (bookingsRes.data ?? []) as unknown as typeof bookings;
    events = eventsRes.data ?? [];
    blocks = blocksRes.data ?? [];
    additionalCharges = chargesRes.data ?? [];
  } catch (err) {
    console.error("DB unavailable on artist profile:", err);
  }

  if (!rawArtist) notFound();

  // Increment profile view counter using service-role (RLS ignores it).
  // Kept best-effort so a failure doesn't break the page.
  try {
    const admin = createAdminClient();
    await admin.rpc("increment_profile_view", { aid: id });
  } catch {}

  const availability = buildAvailability(
    bookings,
    events,
    blocks,
    (rawArtist as { max_bookings_per_day?: number }).max_bookings_per_day ?? undefined,
  );

  const artist = {
    ...toProfileArtist(rawArtist as Parameters<typeof toProfileArtist>[0]),
    reviews: rawReviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      userName: r.profiles?.name ?? "Anonymous",
      createdAt: r.created_at,
    })),
    additionalCharges: additionalCharges.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      sortOrder: c.sort_order,
    })),
  };

  return <ArtistProfile artist={artist} user={user} availability={availability} />;
}
