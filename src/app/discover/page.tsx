import { db } from "@/lib/db";
import { DiscoverClient } from "@/components/DiscoverClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Discover Artists — Roop",
  description: "Browse India's most talented makeup artists, hairstylists, and beauty professionals.",
};

export default async function DiscoverPage() {
  const artists = await db.artist.findMany({
    include: {
      portfolio: { take: 1, orderBy: { order: "asc" } },
      reviews: true,
      services: { orderBy: { price: "asc" } },
    },
    orderBy: [{ featured: "desc" }, { yearsExp: "desc" }],
  });

  const plain = artists.map((a) => ({
    id: a.id,
    displayName: a.displayName,
    tagline: a.tagline,
    city: a.city,
    area: a.area,
    avatarUrl: a.avatarUrl,
    coverUrl: a.coverUrl,
    specialties: a.specialties,
    verified: a.verified,
    yearsExp: a.yearsExp,
    portfolio: a.portfolio.map((p) => ({ imageUrl: p.imageUrl })),
    reviews: a.reviews.map((r) => ({ rating: r.rating })),
    services: a.services.map((s) => ({ price: s.price, category: s.category })),
  }));

  return <DiscoverClient artists={plain} />;
}
