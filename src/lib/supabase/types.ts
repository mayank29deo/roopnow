export type Role = "customer" | "artist" | "admin";

export type Profile = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: Role;
  created_at: string;
};

export type Artist = {
  id: string;
  user_id: string;
  display_name: string;
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
  description: string;
  duration: number;
  price: number;
  category: string;
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
