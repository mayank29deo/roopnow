import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { ArtistDashboardClient } from "@/components/ArtistDashboardClient";

export const dynamic = "force-dynamic";

export default async function ArtistDashboard() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "artist" || !user.artistId) redirect("/dashboard");

  const [artist, bookings, services, portfolio] = await Promise.all([
    db.artist.findUnique({ where: { id: user.artistId } }),
    db.booking.findMany({
      where: { artistId: user.artistId },
      include: { user: { select: { name: true, email: true, phone: true } }, service: true },
      orderBy: { date: "desc" },
    }),
    db.service.findMany({ where: { artistId: user.artistId }, orderBy: { price: "asc" } }),
    db.portfolio.findMany({ where: { artistId: user.artistId }, orderBy: { order: "asc" } }),
  ]);

  if (!artist) redirect("/");

  const reviews = await db.review.findMany({ where: { artistId: user.artistId } });
  const earnings = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.totalPrice, 0);
  const avgRating = reviews.length
    ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length
    : 0;

  const plainArtist = {
    id: artist.id,
    displayName: artist.displayName,
    tagline: artist.tagline,
    bio: artist.bio,
    city: artist.city,
    area: artist.area,
    avatarUrl: artist.avatarUrl,
    coverUrl: artist.coverUrl,
    specialties: artist.specialties,
    yearsExp: artist.yearsExp,
    instagram: artist.instagram,
    verified: artist.verified,
    featured: artist.featured,
  };

  return (
    <ArtistDashboardClient
      artist={plainArtist}
      bookings={bookings.map((b) => ({
        id: b.id,
        date: b.date.toISOString(),
        timeSlot: b.timeSlot,
        status: b.status,
        totalPrice: b.totalPrice,
        notes: b.notes,
        address: b.address,
        customerName: b.user.name,
        customerPhone: b.user.phone,
        serviceName: b.service.name,
        serviceCategory: b.service.category,
        serviceDuration: b.service.duration,
      }))}
      services={services}
      portfolio={portfolio.map(p => ({ id: p.id, imageUrl: p.imageUrl, caption: p.caption, order: p.order }))}
      reviewCount={reviews.length}
      avgRating={avgRating}
      earnings={earnings}
      userName={user.name}
    />
  );
}
