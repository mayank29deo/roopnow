import { createClient } from "@/lib/supabase/server";
import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";
import { ServiceCategories } from "@/components/landing/ServiceCategories";
import { FeaturedArtists } from "@/components/landing/FeaturedArtists";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ArtistCTA } from "@/components/landing/ArtistCTA";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { toCardArtist } from "@/lib/supabase/shape";

export const dynamic = "force-dynamic";

async function getFeatured() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("artists")
      .select("*, portfolio_items(image_url, sort_order), reviews(rating), services(price)")
      .eq("featured", true)
      .order("years_exp", { ascending: false })
      .limit(6);
    return (data ?? []).map(toCardArtist);
  } catch (err) {
    console.error("DB unavailable, rendering with empty featured:", err);
    return [];
  }
}

export default async function Home() {
  const featured = await getFeatured();
  return (
    <>
      <Hero />
      <Stats />
      <ArtistCTA />
      {featured.length > 0 && <FeaturedArtists artists={featured} />}
      <HowItWorks />
      <ServiceCategories />
      <FinalCTA />
    </>
  );
}
