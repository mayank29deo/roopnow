export type Role = "customer" | "artist" | "admin";

export type Profile = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: Role;
  created_at: string;
};

export type ServiceMode = "studio" | "client" | "both";
export type ArtistType = "solo" | "team";

export type Artist = {
  id: string;
  user_id: string;
  display_name: string;
  studio_name: string;
  tagline: string;
  bio: string;
  city: string;
  area: string;
  avatar_url: string;
  cover_url: string;
  specialties: string;
  years_exp: number;
  instagram: string | null;
  featured: boolean;
  verified: boolean;
  experience_summary: string;
  travel_radius_km: number;
  service_mode: ServiceMode;
  artist_type: ArtistType;
  max_bookings_per_day: number;
  cosmetic_brands: string;
  outstation_available: boolean;
  outstation_conditions: string;
  acne_experience: boolean;
  acne_experience_details: string;
  payment_structure: string;
  payment_modes: string;
  invoice_available: boolean;
  payment_notes: string;
  cancellation_policy: string;
  agreed_to_terms: boolean;
  skin_tone_expertise: string;
  profile_views: number;
  created_at: string;
};

export type PortfolioItem = {
  id: string;
  artist_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
};

export type Service = {
  id: string;
  artist_id: string;
  name: string;
  description: string;   // legacy — UI now uses inclusions/exclusions
  inclusions: string;
  exclusions: string;
  trial_makeup_available: boolean;
  duration: number;
  price: number;
  category: string;
  created_at: string;
};

export type AdditionalCharge = {
  id: string;
  artist_id: string;
  name: string;
  description: string;
  sort_order: number;
  created_at: string;
};

export type Booking = {
  id: string;
  user_id: string;
  artist_id: string;
  service_id: string;
  date: string;
  time_slot: string;
  status: "confirmed" | "cancelled" | "completed";
  total_price: number;
  notes: string | null;
  address: string | null;
  created_at: string;
};

export type Review = {
  id: string;
  user_id: string;
  artist_id: string;
  rating: number;
  comment: string;
  created_at: string;
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: Role;
  artistId: string | null;
};
