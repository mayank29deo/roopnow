// Helpers that map snake_case Supabase rows to the camelCase shapes the UI components expect.

type RawArtistWithRelations = {
  id: string;
  user_id?: string;
  display_name: string;
  studio_name?: string;
  tagline: string;
  bio?: string;
  city: string;
  area: string;
  avatar_url: string;
  cover_url: string;
  specialties: string;
  skin_tone_expertise?: string;
  cosmetic_brands?: string;
  outstation_available?: boolean;
  outstation_conditions?: string;
  acne_experience?: boolean;
  acne_experience_details?: string;
  service_mode?: string;
  artist_type?: string;
  payment_structure?: string;
  payment_modes?: string;
  invoice_available?: boolean;
  payment_notes?: string;
  years_exp?: number;
  instagram?: string | null;
  verified: boolean;
  featured?: boolean;
  portfolio_items?: { image_url: string; sort_order?: number; id?: string; caption?: string | null }[];
  reviews?: { rating: number; comment?: string; created_at?: string; id?: string; user_id?: string }[];
  services?: {
    price: number;
    category?: string;
    id?: string;
    name?: string;
    description?: string;
    inclusions?: string;
    exclusions?: string;
    duration?: number;
  }[];
};

export function toCardArtist(a: RawArtistWithRelations) {
  const sortedPortfolio = (a.portfolio_items ?? [])
    .slice()
    .sort((x, y) => (x.sort_order ?? 0) - (y.sort_order ?? 0));
  const sortedServices = (a.services ?? []).slice().sort((x, y) => x.price - y.price);
  return {
    id: a.id,
    displayName: a.display_name,
    tagline: a.tagline,
    city: a.city,
    area: a.area,
    avatarUrl: a.avatar_url,
    coverUrl: a.cover_url,
    specialties: a.specialties,
    verified: a.verified,
    yearsExp: a.years_exp ?? 0,
    portfolio: sortedPortfolio.map((p) => ({ imageUrl: p.image_url })),
    reviews: (a.reviews ?? []).map((r) => ({ rating: r.rating })),
    services: sortedServices.map((s) => ({ price: s.price, category: s.category ?? "" })),
  };
}

export function toProfileArtist(a: RawArtistWithRelations) {
  const sortedPortfolio = (a.portfolio_items ?? [])
    .slice()
    .sort((x, y) => (x.sort_order ?? 0) - (y.sort_order ?? 0));
  const sortedServices = (a.services ?? []).slice().sort((x, y) => x.price - y.price);
  return {
    id: a.id,
    displayName: a.display_name,
    studioName: a.studio_name ?? "",
    tagline: a.tagline,
    bio: a.bio ?? "",
    city: a.city,
    area: a.area,
    avatarUrl: a.avatar_url,
    coverUrl: a.cover_url,
    specialties: a.specialties,
    skinToneExpertise: a.skin_tone_expertise ?? "",
    cosmeticBrands: a.cosmetic_brands ?? "",
    outstationAvailable: a.outstation_available ?? false,
    outstationConditions: a.outstation_conditions ?? "",
    acneExperience: a.acne_experience ?? false,
    acneExperienceDetails: a.acne_experience_details ?? "",
    serviceMode: (a.service_mode ?? "studio") as "studio" | "client" | "both",
    artistType: (a.artist_type ?? "solo") as "solo" | "team",
    paymentStructure: a.payment_structure ?? "",
    paymentModes: a.payment_modes ?? "",
    invoiceAvailable: a.invoice_available ?? false,
    paymentNotes: a.payment_notes ?? "",
    yearsExp: a.years_exp ?? 0,
    instagram: a.instagram ?? null,
    verified: a.verified,
    portfolio: sortedPortfolio.map((p) => ({
      id: p.id ?? p.image_url,
      imageUrl: p.image_url,
      caption: p.caption ?? null,
    })),
    services: sortedServices.map((s) => ({
      id: s.id ?? "",
      name: s.name ?? "",
      description: s.description ?? "",
      inclusions: s.inclusions ?? "",
      exclusions: s.exclusions ?? "",
      duration: s.duration ?? 0,
      price: s.price,
      category: s.category ?? "",
    })),
  };
}
