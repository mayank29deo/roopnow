import { requireAdmin } from "@/lib/admin-auth";
import { AdminDashboardClient } from "@/components/AdminDashboardClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Roop", robots: { index: false, follow: false } };

type ArtistAdminRow = {
  id: string;
  user_id: string;
  display_name: string;
  city: string;
  area: string;
  specialties: string;
  years_exp: number;
  instagram: string | null;
  avatar_url: string;
  verified: boolean;
  featured: boolean;
  created_at: string;
  agreed_to_terms: boolean;
  upi_id: string | null;
  bank_account_no: string | null;
  profiles: { email: string; name: string; phone: string | null } | null;
};

type BookingAdminRow = {
  id: string;
  date: string;
  time_slot: string;
  status: string;
  total_price: number;
  event_name: string | null;
  customer_phone: string | null;
  rejection_reason: string | null;
  created_at: string;
  artists: { display_name: string; avatar_url: string } | null;
  profiles: { name: string; email: string; phone: string | null } | null;
  services: { name: string; category: string } | null;
};

type ReviewAdminRow = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  artists: { display_name: string; avatar_url: string } | null;
  profiles: { name: string } | null;
};

export default async function AdminPage() {
  const { user, admin } = await requireAdmin();

  // Date buckets
  const now = new Date();
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(now); monthAgo.setMonth(monthAgo.getMonth() - 1);

  // Counts (head: true = no row payload, just count)
  const [
    artistCountRes,
    customerCountRes,
    totalBookingsRes,
    todayBookingsRes,
    weekBookingsRes,
    monthBookingsRes,
    pendingArtistsCountRes,
    artistsListRes,
    bookingsListRes,
    reviewsListRes,
    earningsRes,
    statusBreakdownRes,
    ratingsRes,
  ] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }).eq("role", "artist"),
    admin.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
    admin.from("bookings").select("*", { count: "exact", head: true }),
    admin.from("bookings").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
    admin.from("bookings").select("*", { count: "exact", head: true }).gte("created_at", weekAgo.toISOString()),
    admin.from("bookings").select("*", { count: "exact", head: true }).gte("created_at", monthAgo.toISOString()),
    admin.from("artists").select("*", { count: "exact", head: true }).eq("verified", false),
    admin.from("artists")
      .select(`
        id, user_id, display_name, city, area, specialties, years_exp, instagram,
        avatar_url, verified, featured, created_at, agreed_to_terms, upi_id, bank_account_no,
        profiles!artists_user_id_fkey ( email, name, phone )
      `)
      .order("created_at", { ascending: false }),
    admin.from("bookings")
      .select(`
        id, date, time_slot, status, total_price, event_name, customer_phone,
        rejection_reason, created_at,
        artists ( display_name, avatar_url ),
        profiles!bookings_user_id_fkey ( name, email, phone ),
        services ( name, category )
      `)
      .order("created_at", { ascending: false })
      .limit(100),
    admin.from("reviews")
      .select(`
        id, rating, comment, created_at,
        artists ( display_name, avatar_url ),
        profiles ( name )
      `)
      .order("created_at", { ascending: false })
      .limit(100),
    admin.from("bookings").select("total_price").in("status", ["accepted", "completed"]),
    admin.from("bookings").select("status"),
    admin.from("reviews").select("rating"),
  ]);

  const earnings = (earningsRes.data ?? []).reduce((s, b) => s + (b.total_price ?? 0), 0);
  const ratings = ratingsRes.data ?? [];
  const avgRating = ratings.length ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 0;

  const statusCounts: Record<string, number> = {
    pending: 0, accepted: 0, completed: 0, cancelled: 0, rejected: 0,
  };
  for (const row of statusBreakdownRes.data ?? []) {
    if (row.status in statusCounts) statusCounts[row.status]++;
  }

  const artistsRaw = (artistsListRes.data ?? []) as unknown as ArtistAdminRow[];
  const bookingsRaw = (bookingsListRes.data ?? []) as unknown as BookingAdminRow[];
  const reviewsRaw = (reviewsListRes.data ?? []) as unknown as ReviewAdminRow[];

  return (
    <AdminDashboardClient
      adminName={user.name}
      stats={{
        artists: artistCountRes.count ?? 0,
        customers: customerCountRes.count ?? 0,
        totalBookings: totalBookingsRes.count ?? 0,
        todayBookings: todayBookingsRes.count ?? 0,
        weekBookings: weekBookingsRes.count ?? 0,
        monthBookings: monthBookingsRes.count ?? 0,
        pendingArtists: pendingArtistsCountRes.count ?? 0,
        earnings,
        avgRating,
        reviewCount: ratings.length,
        statusCounts,
      }}
      artists={artistsRaw.map((a) => ({
        id: a.id,
        userId: a.user_id,
        displayName: a.display_name,
        city: a.city,
        area: a.area,
        specialties: a.specialties,
        yearsExp: a.years_exp,
        instagram: a.instagram,
        avatarUrl: a.avatar_url,
        verified: a.verified,
        featured: a.featured,
        createdAt: a.created_at,
        agreedToTerms: a.agreed_to_terms,
        hasPaymentDetails: !!(a.upi_id || a.bank_account_no),
        email: a.profiles?.email ?? "—",
        name: a.profiles?.name ?? a.display_name,
        phone: a.profiles?.phone ?? null,
      }))}
      bookings={bookingsRaw.map((b) => ({
        id: b.id,
        date: b.date,
        timeSlot: b.time_slot,
        status: b.status,
        totalPrice: b.total_price,
        eventName: b.event_name,
        customerPhone: b.customer_phone ?? b.profiles?.phone ?? null,
        rejectionReason: b.rejection_reason,
        createdAt: b.created_at,
        artistName: b.artists?.display_name ?? "—",
        artistAvatar: b.artists?.avatar_url ?? "",
        customerName: b.profiles?.name ?? "—",
        customerEmail: b.profiles?.email ?? null,
        serviceName: b.services?.name ?? "—",
        serviceCategory: b.services?.category ?? "",
      }))}
      reviews={reviewsRaw.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.created_at,
        artistName: r.artists?.display_name ?? "—",
        artistAvatar: r.artists?.avatar_url ?? "",
        customerName: r.profiles?.name ?? "Anonymous",
      }))}
    />
  );
}
