import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const artistData = [
  {
    email: "meher@roopnow.com", name: "Meher Kapoor",
    tagline: "Bridal storyteller · 9 years crafting wedding looks",
    bio: "I specialize in soft, luminous bridal looks that feel like you — on your best day. Trained at Mickey Contractor's studio, now based in Bandra.",
    city: "Mumbai", area: "Bandra West",
    avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    cover_url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1600&h=900&fit=crop",
    specialties: "Bridal,Editorial,HD Makeup",
    years_exp: 9, instagram: "meher.mua", featured: true, verified: true,
    portfolio: [
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=900&h=1100&fit=crop",
    ],
    services: [
      { name: "Bridal Full Look", description: "Full bridal makeup + hair styling for your wedding day. Includes trial, touch-up kit, and 12-hour wear-proof finish.", duration: 180, price: 35000, category: "Bridal" },
      { name: "Bridal Trial", description: "A pre-wedding trial to nail your look. Photos, feedback, and full styling.", duration: 120, price: 8000, category: "Bridal" },
      { name: "Sangeet / Reception", description: "Glam look for your evening events. Hair included.", duration: 120, price: 18000, category: "Party & Glam" },
      { name: "Editorial Shoot", description: "Magazine-level HD makeup for campaigns, shoots, and portfolios.", duration: 90, price: 12000, category: "Editorial" },
    ],
  },
  {
    email: "ananya@roopnow.com", name: "Ananya Kapoor",
    tagline: "Editorial & runway · Fashion Week regular",
    bio: "I paint faces like canvases. Campaign work for Sabyasachi, LFW resident artist. Looking for clients who want to break rules.",
    city: "Mumbai", area: "Juhu",
    avatar_url: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop",
    cover_url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1600&h=900&fit=crop",
    specialties: "Editorial,SFX,Runway",
    years_exp: 7, instagram: "ananya.paints", featured: true, verified: true,
    portfolio: [
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1503104834685-7205e8607eb9?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1562572159-4efc207f5aff?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1526045478516-99145907023c?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1571908599407-cdb918ed83bf?w=900&h=1100&fit=crop",
    ],
    services: [
      { name: "Editorial Shoot", description: "Print/digital campaign makeup with HD finish.", duration: 120, price: 15000, category: "Editorial" },
      { name: "Runway Look", description: "Full runway-ready face + hair, camera tested.", duration: 90, price: 12000, category: "Editorial" },
      { name: "SFX / Avant-garde", description: "Prosthetics, color blocking, creative direction.", duration: 180, price: 22000, category: "Family Makeup" },
      { name: "Party Glam", description: "Bold, unapologetic evening look.", duration: 90, price: 9000, category: "Party & Glam" },
    ],
  },
  {
    email: "zara@roopnow.com", name: "Zara Khan",
    tagline: "Party glam & dewy looks · Always on the list",
    bio: "If you want to be the most talked-about person at the party, you're in the right place. Soft glam, glossy lips, glowing skin.",
    city: "Delhi", area: "Hauz Khas",
    avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    cover_url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&h=900&fit=crop",
    specialties: "Party,Glam,HD Makeup",
    years_exp: 5, instagram: "zara.makes", featured: true, verified: true,
    portfolio: [
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1503104834685-7205e8607eb9?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=900&h=1100&fit=crop",
    ],
    services: [
      { name: "Party Glam", description: "Birthday, cocktail, date night — show up like the main character.", duration: 75, price: 6500, category: "Party & Glam" },
      { name: "Cocktail / Reception", description: "Evening look that lasts till the after-party.", duration: 90, price: 9500, category: "Party & Glam" },
      { name: "Engagement Look", description: "Romantic, dewy, photo-perfect.", duration: 120, price: 14000, category: "Bridal" },
    ],
  },
  {
    email: "vikram@roopnow.com", name: "Vikram Singh",
    tagline: "Men's grooming specialist · Beards, sculpts, & class",
    bio: "Grooms, CEOs, film industry regulars. If you want to look undeniably sharp, you've found your guy.",
    city: "Bengaluru", area: "Indiranagar",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    cover_url: "https://images.unsplash.com/photo-1581992652564-44c42f5ad3ad?w=1600&h=900&fit=crop",
    specialties: "His Look,Bridal,Editorial",
    years_exp: 6, instagram: "vikram.grooms", featured: true, verified: true,
    portfolio: [
      "https://images.unsplash.com/photo-1581992652564-44c42f5ad3ad?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=900&h=1100&fit=crop",
    ],
    services: [
      { name: "Groom's Wedding Look", description: "Full grooming for your big day — skin, beard, hair, finish.", duration: 90, price: 12000, category: "His Look" },
      { name: "Beard Sculpting & Skin", description: "Sharp beard work + HD skin prep for events.", duration: 60, price: 4500, category: "His Look" },
      { name: "Editorial Men's", description: "Print/campaign work for male models.", duration: 60, price: 8000, category: "Editorial" },
    ],
  },
  {
    email: "tara@roopnow.com", name: "Tara D'Souza",
    tagline: "Hair magic · Color, curls, couture updos",
    bio: "Trained in Paris, based in Bengaluru. The hair behind Vogue India covers and some of the city's most beautiful brides.",
    city: "Bengaluru", area: "Koramangala",
    avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop",
    cover_url: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=1600&h=900&fit=crop",
    specialties: "Hair,Bridal,Color",
    years_exp: 8, instagram: "tara.hair", featured: true, verified: true,
    portfolio: [
      "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1562572159-4efc207f5aff?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1526045478516-99145907023c?w=900&h=1100&fit=crop",
    ],
    services: [
      { name: "Bridal Hair + Trial", description: "Trial + wedding-day hair styling, lasts 12+ hours.", duration: 120, price: 18000, category: "Just the Hair" },
      { name: "Blowout & Style", description: "Fresh blowout for events. Zero frizz.", duration: 60, price: 3500, category: "Just the Hair" },
      { name: "Color & Gloss", description: "Full color, balayage, highlights. Consultation included.", duration: 180, price: 9500, category: "Just the Hair" },
    ],
  },
  {
    email: "isha@roopnow.com", name: "Isha Reddy",
    tagline: "South Indian bridal · Traditional meets modern",
    bio: "Muhurtham mornings, reception evenings. Specializing in silk sarees, temple jewellery, and that South bridal glow.",
    city: "Hyderabad", area: "Jubilee Hills",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    cover_url: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=1600&h=900&fit=crop",
    specialties: "Bridal,Traditional,HD Makeup",
    years_exp: 10, instagram: "isha.bridal", featured: true, verified: true,
    portfolio: [
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1593620659530-4e02f2d74ac6?w=900&h=1100&fit=crop",
    ],
    services: [
      { name: "South Bridal Package", description: "Muhurtham + reception full package with 2 looks.", duration: 300, price: 45000, category: "Bridal" },
      { name: "Muhurtham Look", description: "Traditional bridal for the ceremony.", duration: 180, price: 28000, category: "Bridal" },
      { name: "Pre-wedding Shoot", description: "Half-day shoot package with multiple looks.", duration: 240, price: 20000, category: "Editorial" },
    ],
  },
  {
    email: "nikhil@roopnow.com", name: "Nikhil Raj",
    tagline: "Film & TV · On-screen artistry for 12 years",
    bio: "Bollywood sets, TV serials, commercials. If it appears on screen, I've probably worked on it.",
    city: "Mumbai", area: "Andheri",
    avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop",
    cover_url: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=1600&h=900&fit=crop",
    specialties: "SFX,Editorial,Film",
    years_exp: 12, instagram: "nikhil.sfx", featured: false, verified: true,
    portfolio: [
      "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1562572159-4efc207f5aff?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=900&h=1100&fit=crop",
    ],
    services: [
      { name: "Film SFX", description: "Prosthetics, wounds, aging, fantasy. Full-day on set.", duration: 480, price: 40000, category: "Family Makeup" },
      { name: "TV / Commercial", description: "Camera-ready makeup for shoot day.", duration: 120, price: 15000, category: "Editorial" },
    ],
  },
  {
    email: "neha@roopnow.com", name: "Neha Arora",
    tagline: "Soft glam queen · Every girl's best friend",
    bio: "Your sister, your bestie, your artist. Natural, glowy looks that feel like the best version of you.",
    city: "Delhi", area: "Greater Kailash",
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    cover_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1600&h=900&fit=crop",
    specialties: "Party,Bridal,Soft Glam",
    years_exp: 4, instagram: "neha.softglam", featured: false, verified: true,
    portfolio: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=900&h=1100&fit=crop",
    ],
    services: [
      { name: "Party / Event", description: "Natural glam look for evenings.", duration: 75, price: 5500, category: "Party & Glam" },
      { name: "Engagement / Sangeet", description: "Full look with subtle drama.", duration: 90, price: 9000, category: "Bridal" },
    ],
  },
];

const reviewSamples = [
  { rating: 5, comment: "Absolutely loved the experience. My bridal look lasted 14 hours through a sweaty mehndi." },
  { rating: 5, comment: "Exceeded every expectation. Calm, professional, and so so talented." },
  { rating: 5, comment: "My wedding guests couldn't stop talking. Worth every rupee." },
  { rating: 4, comment: "Great look, felt like me but better. Slight delay arriving but made up for it." },
  { rating: 5, comment: "Soft, dewy, photogenic. Photos look unreal." },
  { rating: 5, comment: "First time using a booking platform and honestly... never going back." },
  { rating: 5, comment: "Was so nervous for my wedding. Left me calm and radiant." },
];

async function getOrCreateUser(admin: ReturnType<typeof createAdminClient>, email: string, name: string, role: "customer" | "artist", phone?: string) {
  const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const match = existing.users.find((u) => u.email === email);
  if (match) return match.id;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: "password123",
    email_confirm: true,
    user_metadata: { name, role, phone },
  });
  if (error) throw error;
  return data.user.id;
}

export async function POST(req: NextRequest) {
  const key = new URL(req.url).searchParams.get("key");
  if (!process.env.SEED_SECRET || key !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();

    // Wipe existing domain data (but keep auth users so we don't invalidate seed accounts)
    await admin.from("reviews").delete().gte("rating", 0);
    await admin.from("bookings").delete().gt("total_price", -1);
    await admin.from("services").delete().gt("duration", -1);
    await admin.from("portfolio_items").delete().gte("sort_order", 0);
    await admin.from("artists").delete().gte("years_exp", 0);

    // Demo customer
    const customerId = await getOrCreateUser(admin, "demo@roopnow.com", "Priya Sharma", "customer", "+91 98765 43210");
    await admin.from("profiles").upsert({
      id: customerId, email: "demo@roopnow.com", name: "Priya Sharma",
      phone: "+91 98765 43210", role: "customer",
    });

    const artistIds: string[] = [];

    for (const a of artistData) {
      const userId = await getOrCreateUser(admin, a.email, a.name, "artist");
      await admin.from("profiles").upsert({
        id: userId, email: a.email, name: a.name, role: "artist",
      });

      // The signup trigger may have already created a default artist row — upsert by user_id.
      const { data: artistRow, error: artistErr } = await admin.from("artists").upsert({
        user_id: userId,
        display_name: a.name, tagline: a.tagline, bio: a.bio,
        city: a.city, area: a.area,
        avatar_url: a.avatar_url, cover_url: a.cover_url,
        specialties: a.specialties, years_exp: a.years_exp,
        instagram: a.instagram, featured: a.featured, verified: a.verified,
      }, { onConflict: "user_id" }).select("id").single();

      if (artistErr || !artistRow) throw artistErr || new Error(`Failed to upsert artist for ${a.email}`);

      const artistId = artistRow.id;
      artistIds.push(artistId);

      if (a.portfolio.length) {
        await admin.from("portfolio_items").insert(
          a.portfolio.map((image_url, i) => ({ artist_id: artistId, image_url, sort_order: i }))
        );
      }
      if (a.services.length) {
        await admin.from("services").insert(
          a.services.map((s) => ({ artist_id: artistId, ...s }))
        );
      }
    }

    // Reviews
    for (const artistId of artistIds) {
      const n = 3 + Math.floor(Math.random() * 4);
      const rows = Array.from({ length: n }, (_, i) => {
        const r = reviewSamples[(i + Math.floor(Math.random() * reviewSamples.length)) % reviewSamples.length];
        return { artist_id: artistId, user_id: customerId, rating: r.rating, comment: r.comment };
      });
      await admin.from("reviews").insert(rows);
    }

    return NextResponse.json({ ok: true, artists: artistIds.length });
  } catch (err) {
    console.error("Seed error:", err);
    const message =
      err instanceof Error ? err.message :
      typeof err === "object" && err && "message" in err ? String((err as { message: unknown }).message) :
      JSON.stringify(err);
    return NextResponse.json({ error: message || "Seed failed", raw: String(err) }, { status: 500 });
  }
}
