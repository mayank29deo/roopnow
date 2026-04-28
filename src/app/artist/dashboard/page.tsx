import { redirect } from "next/navigation";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { ArtistDashboardClient } from "@/components/ArtistDashboardClient";
import { buildAvailability } from "@/lib/availability";

export const dynamic = "force-dynamic";

type BookingJoin = {
  id: string; date: string; time_slot: string; status: string;
  total_price: number; notes: string | null; address: string | null;
  event_name: string | null; budget: number | null; rejection_reason: string | null;
  profiles: { name: string; email: string; phone: string | null } | null;
  services: { name: string; category: string; duration: number } | null;
};

export default async function ArtistDashboard() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "artist" || !user.artistId) redirect("/dashboard");

  const supabase = await createClient();
  const [
    artistRes, bookingsRes, servicesRes, portfolioRes, reviewsRes,
    blocksRes, eventsRes, subsRes,
  ] = await Promise.all([
    supabase.from("artists").select("*").eq("id", user.artistId).maybeSingle(),
    supabase.from("bookings")
      .select(`
        id, date, time_slot, status, total_price, notes, address,
        event_name, budget, rejection_reason,
        profiles ( name, email, phone ),
        services ( name, category, duration )
      `)
      .eq("artist_id", user.artistId)
      .order("date", { ascending: false }),
    supabase.from("services").select("*").eq("artist_id", user.artistId).order("price", { ascending: true }),
    supabase.from("portfolio_items").select("*").eq("artist_id", user.artistId).order("sort_order", { ascending: true }),
    supabase.from("reviews").select("rating").eq("artist_id", user.artistId),
    supabase.from("artist_blocked_dates").select("id, blocked_date, reason").eq("artist_id", user.artistId).order("blocked_date"),
    supabase.from("artist_events")
      .select("id, event_date, start_time, end_time, event_period, event_name, location, customer_name, customer_phone, notes")
      .eq("artist_id", user.artistId)
      .order("event_date", { ascending: false }),
    supabase.from("artist_subscriptions").select("*").eq("artist_id", user.artistId).order("period_month", { ascending: false }),
  ]);

  const artistRow = artistRes.data;
  if (!artistRow) redirect("/");

  const bookings = (bookingsRes.data ?? []) as unknown as BookingJoin[];
  const reviews = reviewsRes.data ?? [];
  const blocks = blocksRes.data ?? [];
  const events = eventsRes.data ?? [];
  const subs = subsRes.data ?? [];

  const earnings = bookings
    .filter((b) => b.status === "accepted" || b.status === "completed")
    .reduce((s, b) => s + b.total_price, 0);
  const avgRating = reviews.length ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length : 0;

  const availability = buildAvailability(
    bookings.map((b) => ({ date: b.date, status: b.status })),
    events.map((e) => ({ event_date: e.event_date })),
    blocks.map((b) => ({ blocked_date: b.blocked_date })),
  );

  const plainArtist = {
    id: artistRow.id,
    displayName: artistRow.display_name,
    tagline: artistRow.tagline,
    bio: artistRow.bio,
    city: artistRow.city,
    area: artistRow.area,
    avatarUrl: artistRow.avatar_url,
    coverUrl: artistRow.cover_url,
    specialties: artistRow.specialties,
    yearsExp: artistRow.years_exp,
    instagram: artistRow.instagram,
    verified: artistRow.verified,
    featured: artistRow.featured,
    profileViews: artistRow.profile_views ?? 0,
    experienceSummary: artistRow.experience_summary ?? "",
    travelRadiusKm: artistRow.travel_radius_km ?? 0,
    upiId: artistRow.upi_id ?? "",
    bankAccountName: artistRow.bank_account_name ?? "",
    bankIfsc: artistRow.bank_ifsc ?? "",
    bankAccountNo: artistRow.bank_account_no ?? "",
    cancellationPolicy: artistRow.cancellation_policy ?? "",
    agreedToTerms: artistRow.agreed_to_terms ?? false,
    skinToneExpertise: artistRow.skin_tone_expertise ?? "",
  };

  return (
    <ArtistDashboardClient
      artist={plainArtist}
      bookings={bookings.map((b) => ({
        id: b.id,
        date: b.date,
        timeSlot: b.time_slot,
        status: b.status,
        totalPrice: b.total_price,
        notes: b.notes,
        address: b.address,
        eventName: b.event_name,
        budget: b.budget,
        rejectionReason: b.rejection_reason,
        customerName: b.profiles?.name ?? "—",
        customerPhone: b.profiles?.phone ?? null,
        customerEmail: b.profiles?.email ?? null,
        serviceName: b.services?.name ?? "—",
        serviceCategory: b.services?.category ?? "",
        serviceDuration: b.services?.duration ?? 0,
      }))}
      services={(servicesRes.data ?? []).map((s) => ({
        id: s.id, name: s.name, description: s.description,
        duration: s.duration, price: s.price, category: s.category,
      }))}
      portfolio={(portfolioRes.data ?? []).map((p) => ({
        id: p.id, imageUrl: p.image_url, caption: p.caption, order: p.sort_order,
      }))}
      blockedDates={blocks.map((b) => ({ id: b.id, blockedDate: b.blocked_date, reason: b.reason }))}
      events={events.map((e) => ({
        id: e.id, eventDate: e.event_date, startTime: e.start_time, endTime: e.end_time,
        eventPeriod: e.event_period, eventName: e.event_name, location: e.location,
        customerName: e.customer_name, customerPhone: e.customer_phone, notes: e.notes,
      }))}
      subscriptions={subs.map((s) => ({
        id: s.id, periodMonth: s.period_month, amount: s.amount, status: s.status,
        razorpayOrderId: s.razorpay_order_id, paidAt: s.paid_at,
      }))}
      availability={availability}
      reviewCount={reviews.length}
      avgRating={avgRating}
      earnings={earnings}
      userName={user.name}
      userId={user.id}
    />
  );
}
