import { createClient } from "@/lib/supabase/server";
import { DiscoverClient } from "@/components/DiscoverClient";
import { toCardArtist } from "@/lib/supabase/shape";

export const metadata = {
  title: "Discover Artists — Roop",
  description: "Browse India's most talented makeup Artists, hairstylists, and beauty professionals.",
};

export const dynamic = "force-dynamic";

async function getArtists() {
  try {
    const supabase = await createClient();
    // 8-Jul: artist profiles are hidden from Discover until admin
    // flips verified=true. Client-side listing therefore filters by
    // verified strictly — self-view / admin-view exceptions live on
    // the /artists/[id] page.
    const { data } = await supabase
      .from("artists")
      .select("*, portfolio_items(image_url, sort_order), reviews(rating), services(price, category)")
      .eq("verified", true)
      .order("featured", { ascending: false })
      .order("years_exp", { ascending: false });
    return (data ?? []).map(toCardArtist);
  } catch (err) {
    console.error("DB unavailable on /discover:", err);
    return [];
  }
}

export default async function DiscoverPage() {
  const artists = await getArtists();
  return <DiscoverClient artists={artists} />;
}
