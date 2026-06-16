"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, MapPin, ArrowUpRight, BadgeCheck } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type Artist = {
  id: string;
  displayName: string;
  tagline: string;
  city: string;
  area: string;
  avatarUrl: string;
  coverUrl: string;
  specialties: string;
  verified: boolean;
  portfolio: { imageUrl: string }[];
  reviews: { rating: number }[];
  services: { price: number }[];
};

export function FeaturedArtists({ artists }: { artists: Artist[] }) {
  return (
    <section className="py-24 lg:py-36 bg-gradient-to-b from-transparent via-surface/20 to-transparent">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-14">
          <div>
            <div className="chip mb-4">
              <Star size={10} className="fill-gold text-gold" />
              Handpicked
            </div>
            <h2 className="font-display text-5xl lg:text-7xl leading-[0.95]">
              Meet the <span className="italic text-gradient-rose">icons</span>
              <br />
              behind the looks.
            </h2>
            <p className="mt-4 text-ink-dim max-w-xl">
              The most talented, most requested, most loved Artists on Roop —
              this week.
            </p>
          </div>
          <Link href="/discover" className="btn-ghost group shrink-0">
            Browse all Artists
            <ArrowUpRight size={16} className="group-hover:rotate-45 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {artists.map((artist, i) => (
            <motion.div
              key={artist.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
            >
              <ArtistCard artist={artist} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ArtistCard({ artist }: { artist: Artist }) {
  const rating =
    artist.reviews.length > 0
      ? (
          artist.reviews.reduce((a, b) => a + b.rating, 0) / artist.reviews.length
        ).toFixed(1)
      : "New";
  const fromPrice = artist.services[0]?.price;
  const specialties = artist.specialties.split(",").slice(0, 2);
  // Card hero: prefer a portfolio image (portrait-ish, fits the
  // 5:6 card cleanly). Fall back to the cover banner, but bias the
  // crop toward the top so wide 16:9 banners don't lose their focal
  // point to a centered crop.
  const portfolio0 = artist.portfolio[0]?.imageUrl;
  const portfolioImg = portfolio0 ?? artist.coverUrl;
  const usingFallbackCover = !portfolio0;

  return (
    <Link
      href={`/artists/${artist.id}`}
      className="group block rounded-3xl overflow-hidden bg-surface border border-border hover:border-gold/40 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-rose/10"
    >
      <div className="relative aspect-[5/6] overflow-hidden">
        <img
          src={portfolioImg}
          alt={artist.displayName}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          style={usingFallbackCover ? { objectPosition: "center 30%" } : undefined}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/10 to-transparent" />

        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          <div className="flex flex-wrap gap-1.5">
            {specialties.map((s) => (
              <span key={s} className="chip bg-bg/50 backdrop-blur-md text-[11px]">{s.trim()}</span>
            ))}
          </div>
          {artist.verified && (
            <div className="w-8 h-8 rounded-full bg-bg/50 backdrop-blur-md flex items-center justify-center">
              <BadgeCheck size={16} className="text-gold fill-gold/20" />
            </div>
          )}
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div className="flex items-center gap-3">
            <img
              src={artist.avatarUrl}
              alt=""
              className="w-12 h-12 rounded-full object-cover border-2 border-ink"
            />
            <div>
              <div className="font-semibold leading-tight">{artist.displayName}</div>
              <div className="text-[11px] text-ink-dim flex items-center gap-1">
                <MapPin size={10} /> {artist.city}{artist.area ? `, ${artist.area}` : ""}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs">
              <Star size={11} className="fill-gold text-gold" />
              <span className="font-semibold">{rating}</span>
            </div>
            {artist.reviews.length > 0 && (
              <div className="text-[10px] text-ink-dim">{artist.reviews.length} reviews</div>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 flex items-center justify-between">
        <div>
          <div className="text-xs text-ink-dim">Starting from</div>
          <div className="text-xl font-display">
            {fromPrice ? formatPrice(fromPrice) : "—"}
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 text-sm font-medium text-gold group-hover:gap-3 transition-all">
          View profile <ArrowUpRight size={14} />
        </div>
      </div>
    </Link>
  );
}
