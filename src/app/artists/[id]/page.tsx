import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ArtistProfile } from "@/components/ArtistProfile";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [artist, user] = await Promise.all([
    db.artist.findUnique({
      where: { id },
      include: {
        portfolio: { orderBy: { order: "asc" } },
        services: { orderBy: { price: "asc" } },
        reviews: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    getSessionUser(),
  ]);

  if (!artist) notFound();

  const plain = {
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
    portfolio: artist.portfolio.map((p) => ({ id: p.id, imageUrl: p.imageUrl, caption: p.caption })),
    services: artist.services.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      duration: s.duration,
      price: s.price,
      category: s.category,
    })),
    reviews: artist.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      userName: r.user.name,
      createdAt: r.createdAt.toISOString(),
    })),
  };

  return <ArtistProfile artist={plain} user={user} />;
}
