import { db } from "@/lib/db";
import { Hero } from "@/components/landing/Hero";

export const dynamic = "force-dynamic";
import { Stats } from "@/components/landing/Stats";
import { ServiceCategories } from "@/components/landing/ServiceCategories";
import { FeaturedArtists } from "@/components/landing/FeaturedArtists";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { ArtistCTA } from "@/components/landing/ArtistCTA";
import { FinalCTA } from "@/components/landing/FinalCTA";

export default async function Home() {
  const featured = await db.artist.findMany({
    where: { featured: true },
    take: 6,
    include: {
      portfolio: { take: 1, orderBy: { order: "asc" } },
      reviews: true,
      services: { take: 1, orderBy: { price: "asc" } },
    },
  });

  return (
    <>
      <Hero />
      <Stats />
      <ServiceCategories />
      <FeaturedArtists artists={featured} />
      <HowItWorks />
      <Testimonials />
      <ArtistCTA />
      <FinalCTA />
    </>
  );
}
