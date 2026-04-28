"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, MapPin, Instagram, BadgeCheck, Award, ArrowLeft,
  Clock, Sparkles, X, ChevronLeft, ChevronRight, Share2, Heart,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { BookingDrawer } from "./BookingDrawer";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import type { AvailabilityInput } from "@/lib/availability";

type Artist = {
  id: string;
  displayName: string;
  tagline: string;
  bio: string;
  city: string;
  area: string;
  avatarUrl: string;
  coverUrl: string;
  specialties: string;
  skinToneExpertise: string;
  yearsExp: number;
  instagram: string | null;
  verified: boolean;
  portfolio: { id: string; imageUrl: string; caption: string | null }[];
  services: {
    id: string; name: string; description: string;
    duration: number; price: number; category: string;
  }[];
  reviews: { id: string; rating: number; comment: string; userName: string; createdAt: string }[];
};

export function ArtistProfile({
  artist,
  user,
  availability,
}: {
  artist: Artist;
  user: { id: string; role: string; name: string } | null;
  availability: AvailabilityInput;
}) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [tab, setTab] = useState<"services" | "portfolio" | "availability" | "reviews" | "about">("services");
  const [booking, setBooking] = useState<Artist["services"][0] | null>(null);

  const rating =
    artist.reviews.length > 0
      ? (artist.reviews.reduce((a, b) => a + b.rating, 0) / artist.reviews.length).toFixed(1)
      : null;
  const specialties = artist.specialties.split(",").map((s) => s.trim()).filter(Boolean);
  const skinTones = artist.skinToneExpertise.split(",").map((s) => s.trim()).filter(Boolean);

  function openLightbox(i: number) { setLightbox(i); }
  function next() {
    setLightbox((v) => v === null ? 0 : (v + 1) % artist.portfolio.length);
  }
  function prev() {
    setLightbox((v) => v === null ? 0 : (v - 1 + artist.portfolio.length) % artist.portfolio.length);
  }

  return (
    <>
      <section className="relative pt-6">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Link href="/discover" className="inline-flex items-center gap-2 text-sm text-ink-dim hover:text-ink mb-6">
            <ArrowLeft size={14} /> Back to discover
          </Link>

          <div className="relative h-72 lg:h-96 rounded-3xl overflow-hidden border border-border">
            <img src={artist.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-bg/70 via-transparent to-transparent" />

            <div className="absolute top-5 right-5 flex gap-2">
              <button className="w-10 h-10 rounded-full bg-bg/60 backdrop-blur-md border border-border flex items-center justify-center hover:bg-bg/90">
                <Heart size={16} />
              </button>
              <button className="w-10 h-10 rounded-full bg-bg/60 backdrop-blur-md border border-border flex items-center justify-center hover:bg-bg/90">
                <Share2 size={16} />
              </button>
            </div>
          </div>

          <div className="relative -mt-20 lg:-mt-24 px-2 lg:px-8 grid lg:grid-cols-[auto_1fr_auto] gap-6 lg:gap-10 items-end">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-32 h-32 lg:w-44 lg:h-44 rounded-3xl overflow-hidden border-4 border-bg shadow-2xl"
            >
              <img src={artist.avatarUrl} alt={artist.displayName} className="w-full h-full object-cover" />
            </motion.div>

            <div className="lg:pb-4">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h1 className="font-display text-4xl lg:text-6xl leading-tight">{artist.displayName}</h1>
                {artist.verified && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs">
                    <BadgeCheck size={12} className="fill-gold/20" /> Verified
                  </div>
                )}
              </div>
              <p className="text-ink-dim text-lg italic mb-4 max-w-2xl">{artist.tagline}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-ink-dim">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-gold" /> {artist.city}{artist.area ? `, ${artist.area}` : ""}
                </span>
                <span className="flex items-center gap-1.5">
                  <Award size={14} className="text-gold" /> {artist.yearsExp} years experience
                </span>
                {rating && (
                  <span className="flex items-center gap-1.5">
                    <Star size={14} className="fill-gold text-gold" />
                    <span className="text-ink font-semibold">{rating}</span>
                    ({artist.reviews.length} reviews)
                  </span>
                )}
                {artist.instagram && (
                  <a href={`https://instagram.com/${artist.instagram}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-ink">
                    <Instagram size={14} className="text-gold" /> @{artist.instagram}
                  </a>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {specialties.map((s) => (
                  <span key={s} className="chip">{s}</span>
                ))}
              </div>
              {skinTones.length > 0 && (
                <div className="mt-4">
                  <div className="text-[10px] uppercase tracking-widest text-ink-dim mb-2 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-gold" />
                    Skin tone expertise
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skinTones.map((s) => (
                      <span key={s} className="chip text-gold border-gold/30">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:pb-4">
              <button
                onClick={() => setBooking(artist.services[0] ?? null)}
                disabled={artist.services.length === 0}
                className="btn-primary shine w-full lg:w-auto"
              >
                <Sparkles size={16} /> Request booking
              </button>
              {artist.services[0] && (
                <div className="text-xs text-ink-dim mt-2 text-center lg:text-right">
                  starting from {formatPrice(artist.services[0].price)}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="border-b border-border flex gap-6 overflow-x-auto">
            {(["services", "portfolio", "availability", "reviews", "about"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`py-4 px-1 text-sm font-medium capitalize border-b-2 transition-colors whitespace-nowrap ${
                  tab === t ? "border-gold text-ink" : "border-transparent text-ink-dim hover:text-ink"
                }`}
              >
                {t === "services" && `Services (${artist.services.length})`}
                {t === "portfolio" && `Portfolio (${artist.portfolio.length})`}
                {t === "availability" && "Availability"}
                {t === "reviews" && `Reviews (${artist.reviews.length})`}
                {t === "about" && "About"}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 min-h-[40vh]">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <AnimatePresence mode="wait">
            {tab === "services" && (
              <motion.div
                key="services"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid md:grid-cols-2 gap-4"
              >
                {artist.services.map((s) => (
                  <div key={s.id} className="glass rounded-2xl p-6 hover:border-gold/40 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-xs text-gold uppercase tracking-wider mb-1">{s.category}</div>
                        <h3 className="font-display text-2xl">{s.name}</h3>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <div className="font-display text-2xl text-gradient-rose">{formatPrice(s.price)}</div>
                        <div className="text-xs text-ink-dim flex items-center gap-1 justify-end">
                          <Clock size={10} /> {s.duration} min
                        </div>
                      </div>
                    </div>
                    <p className="text-ink-dim text-sm leading-relaxed mb-5">{s.description}</p>
                    <button
                      onClick={() => setBooking(s)}
                      className="btn-ghost w-full hover:bg-gold/5 hover:border-gold/50"
                    >
                      Book this service
                    </button>
                  </div>
                ))}
              </motion.div>
            )}

            {tab === "portfolio" && (
              <motion.div
                key="portfolio"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
              >
                {artist.portfolio.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => openLightbox(i)}
                    className="group relative aspect-[4/5] rounded-2xl overflow-hidden border border-border"
                  >
                    <img src={p.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </motion.div>
            )}

            {tab === "availability" && (
              <motion.div
                key="availability"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-2xl"
              >
                <h3 className="font-display text-3xl mb-2">When {artist.displayName.split(" ")[0]} is available</h3>
                <p className="text-ink-dim text-sm mb-6">
                  Green days are wide open. Yellow means a slot is already taken. Red is off-limits — blocked or fully booked.
                </p>
                <div className="glass rounded-3xl p-6">
                  <AvailabilityCalendar availability={availability} />
                </div>
                <button
                  onClick={() => setBooking(artist.services[0] ?? null)}
                  disabled={artist.services.length === 0}
                  className="btn-primary shine mt-6"
                >
                  <Sparkles size={14} /> Request a booking
                </button>
              </motion.div>
            )}

            {tab === "reviews" && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid md:grid-cols-2 gap-4 max-w-4xl"
              >
                {artist.reviews.length === 0 ? (
                  <div className="md:col-span-2 py-16 text-center text-ink-dim border border-dashed border-border rounded-3xl">
                    No reviews yet — be the first to book & review.
                  </div>
                ) : (
                  artist.reviews.map((r) => (
                    <div key={r.id} className="glass rounded-2xl p-6">
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={13} className={i < r.rating ? "fill-gold text-gold" : "text-muted"} />
                        ))}
                      </div>
                      <p className="text-ink leading-relaxed mb-4 font-display italic">&ldquo;{r.comment}&rdquo;</p>
                      <div className="text-sm">
                        <div className="font-medium">{r.userName}</div>
                        <div className="text-xs text-ink-dim">{new Date(r.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {tab === "about" && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-3xl"
              >
                <h3 className="font-display text-3xl mb-4">About {artist.displayName.split(" ")[0]}</h3>
                <p className="text-ink-dim leading-loose text-lg whitespace-pre-wrap">{artist.bio}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 bg-bg/95 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 w-11 h-11 rounded-full bg-surface border border-border flex items-center justify-center z-10"><X size={18} /></button>
            <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 w-11 h-11 rounded-full bg-surface border border-border flex items-center justify-center z-10"><ChevronLeft size={18} /></button>
            <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 w-11 h-11 rounded-full bg-surface border border-border flex items-center justify-center z-10"><ChevronRight size={18} /></button>
            <motion.img
              key={lightbox}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              src={artist.portfolio[lightbox].imageUrl}
              alt=""
              className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <BookingDrawer
        artist={artist}
        user={user}
        service={booking}
        availability={availability}
        onClose={() => setBooking(null)}
        onChangeService={(s) => setBooking(s)}
      />
    </>
  );
}
