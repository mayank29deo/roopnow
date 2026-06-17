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
  studioName: string;
  tagline: string;
  bio: string;
  city: string;
  area: string;
  avatarUrl: string;
  coverUrl: string;
  specialties: string;
  skinToneExpertise: string;
  cosmeticBrands: string;
  outstationAvailable: boolean;
  outstationConditions: string;
  acneExperience: boolean;
  acneExperienceDetails: string;
  serviceMode: "studio" | "client" | "both";
  artistType: "solo" | "team";
  paymentStructure: string;
  paymentModes: string;
  invoiceAvailable: boolean;
  paymentNotes: string;
  yearsExp: number;
  instagram: string | null;
  verified: boolean;
  portfolio: { id: string; imageUrl: string; caption: string | null }[];
  services: {
    id: string; name: string;
    description: string;
    inclusions: string;
    exclusions: string;
    duration: number; price: number; category: string;
  }[];
  reviews: { id: string; rating: number; comment: string; userName: string; createdAt: string }[];
  additionalCharges: { id: string; name: string; description: string; sortOrder: number }[];
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
  // When a customer clicks a date on the Availability tab, we open the
  // booking drawer with that date pre-picked so step 2 only needs a
  // time-slot tap. Cleared on drawer close.
  const [bookingInitialDate, setBookingInitialDate] = useState<Date | null>(null);

  function startBookingForDate(d: Date) {
    if (artist.services.length === 0) return;
    setBookingInitialDate(d);
    setBooking(artist.services[0]);
  }

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

          {/* Avatar — sits half-overlapping the bottom-left of the banner.
              Name + studio + meta now live BELOW the banner instead of
              overlaying it (per client iteration #14). */}
          <div className="relative -mt-16 lg:-mt-20 px-2 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-28 h-28 lg:w-36 lg:h-36 rounded-3xl overflow-hidden border-4 border-bg shadow-2xl inline-block"
            >
              <img src={artist.avatarUrl} alt={artist.displayName} className="w-full h-full object-cover" />
            </motion.div>
          </div>

          <div className="mt-6 lg:mt-8 px-2 lg:px-8 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="font-display text-4xl lg:text-6xl leading-tight">{artist.displayName}</h1>
                {artist.verified && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs">
                    <BadgeCheck size={12} className="fill-gold/20" /> Verified
                  </div>
                )}
              </div>
              {artist.studioName && (
                <div className="text-[11px] uppercase tracking-[0.32em] text-gold mb-3">
                  {artist.studioName}
                </div>
              )}
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

              {/* Skills heading — matches the Skin Tone Expertise pattern
                  per client item #13. */}
              {specialties.length > 0 && (
                <div className="mt-5">
                  <div className="text-[10px] uppercase tracking-widest text-ink-dim mb-2 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-gold" />
                    Skills
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {specialties.map((s) => (
                      <span key={s} className="chip">{s}</span>
                    ))}
                  </div>
                </div>
              )}

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

            <div className="shrink-0">
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
              >
                <div className="grid md:grid-cols-2 gap-4">
                  {artist.services.map((s) => {
                    const inclusions = s.inclusions.split("\n").map((x) => x.trim()).filter(Boolean);
                    const exclusions = s.exclusions.split("\n").map((x) => x.trim()).filter(Boolean);
                    const hasStructured = inclusions.length > 0 || exclusions.length > 0;
                    return (
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
                        {hasStructured ? (
                          <div className="space-y-1.5 mb-5">
                            {inclusions.map((it, i) => (
                              <div key={`+${i}`} className="flex items-start gap-2 text-sm">
                                <span className="text-emerald shrink-0 font-semibold leading-5">+</span>
                                <span className="text-ink-dim">{it}</span>
                              </div>
                            ))}
                            {exclusions.map((it, i) => (
                              <div key={`-${i}`} className="flex items-start gap-2 text-sm">
                                <span className="text-rose shrink-0 font-semibold leading-5">−</span>
                                <span className="text-ink-dim">{it}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          s.description && (
                            <p className="text-ink-dim text-sm leading-relaxed mb-5">{s.description}</p>
                          )
                        )}
                        <button
                          onClick={() => setBooking(s)}
                          className="btn-ghost w-full hover:bg-gold/5 hover:border-gold/50"
                        >
                          Book this service
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Additional Charges — extras priced separately from the service menu */}
                {artist.additionalCharges.length > 0 && (
                  <div className="mt-12">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-[10px] uppercase tracking-[0.32em] text-gold flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-gold" />
                        Additional charges
                      </div>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <p className="text-ink-dim text-sm mb-6">
                      These are priced separately from the menu above. The Artist will confirm what applies before your booking.
                    </p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {artist.additionalCharges.map((c) => (
                        <div key={c.id} className="rounded-2xl border border-border bg-surface/30 p-4">
                          <div className="font-semibold text-sm mb-1">{c.name}</div>
                          {c.description && (
                            <div className="text-xs text-ink-dim leading-relaxed">{c.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                  Tap any green or yellow date to start a booking request. Red days are blocked or fully booked.
                </p>
                <div className="glass rounded-3xl p-6">
                  <AvailabilityCalendar
                    availability={availability}
                    onPick={artist.services.length > 0 ? startBookingForDate : undefined}
                  />
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

                {/* Professional details surfaced from the dashboard
                    so the customer can scan how the artist actually
                    works before they book (item #3 of the 12-Jun
                    tracker). Conditional blocks only render when the
                    artist has filled in the relevant field. */}
                <div className="border-t border-border my-12" />
                <ProfessionalDetailsBlock artist={artist} />
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
        initialDate={bookingInitialDate}
        onClose={() => { setBooking(null); setBookingInitialDate(null); }}
        onChangeService={(s) => setBooking(s)}
      />
    </>
  );
}

// Renders all the Phase 3 professional-detail fields on the public
// profile. Each block only appears if the artist has filled it in,
// so the section stays clean for new artists who haven't completed
// the form yet.
function ProfessionalDetailsBlock({ artist }: { artist: Artist }) {
  const brands = artist.cosmeticBrands.split(",").map((b) => b.trim()).filter(Boolean);
  const outstationPoints = artist.outstationConditions
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const artistTypeLabel = artist.artistType === "team" ? "Artist with a team" : "Solo Artist";
  const serviceModeLabel =
    artist.serviceMode === "client"
      ? "At client's location"
      : artist.serviceMode === "both"
        ? "At studio or client's location"
        : "At studio";

  // Hide the whole block if nothing meaningful is set (no enums beyond
  // defaults, no payment info, no outstation, no brands, no acne).
  const hasAnythingMeaningful =
    brands.length > 0 ||
    artist.outstationAvailable ||
    artist.acneExperience ||
    !!artist.paymentStructure ||
    !!artist.paymentModes ||
    !!artist.paymentNotes ||
    artist.invoiceAvailable;
  // We still want to show artistType + serviceMode even if everything
  // else is blank — those are useful defaults.

  return (
    <>
      <h3 className="font-display text-3xl mb-6">Professional details</h3>

      <div className="grid sm:grid-cols-2 gap-x-10 gap-y-6">
        <DetailRow label="Artist type" value={artistTypeLabel} />
        <DetailRow label="Service mode" value={serviceModeLabel} />
      </div>

      {brands.length > 0 && (
        <div className="mt-10">
          <DetailLabel>Cosmetic brands used</DetailLabel>
          <div className="flex flex-wrap gap-2">
            {brands.map((b) => (
              <span key={b} className="chip">{b}</span>
            ))}
          </div>
        </div>
      )}

      {artist.outstationAvailable && (
        <div className="mt-10">
          <DetailLabel>Outstation booking</DetailLabel>
          <p className="text-ink-dim text-sm mb-3">Available for travel beyond home city.</p>
          {outstationPoints.length > 0 && (
            <ul className="space-y-1.5 text-sm text-ink-dim">
              {outstationPoints.map((p, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-gold leading-5">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {artist.acneExperience && (
        <div className="mt-10">
          <DetailLabel>Skin sensitivities</DetailLabel>
          <p className="text-ink-dim text-sm">
            Experience working with acne and other skin conditions.
          </p>
          {artist.acneExperienceDetails && (
            <p className="text-ink-dim text-sm mt-2 whitespace-pre-wrap">
              {artist.acneExperienceDetails}
            </p>
          )}
        </div>
      )}

      {hasAnythingMeaningful && (artist.paymentStructure || artist.paymentModes || artist.invoiceAvailable || artist.paymentNotes) && (
        <div className="mt-12">
          <h4 className="font-display text-2xl mb-4">Payments &amp; settlement</h4>
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-6">
            {artist.paymentStructure && (
              <DetailRow label="Payment structure" value={artist.paymentStructure} />
            )}
            {artist.paymentModes && (
              <DetailRow label="Accepted modes" value={artist.paymentModes} />
            )}
            <DetailRow
              label="Invoice"
              value={artist.invoiceAvailable ? "Provided on request" : "Not provided"}
            />
          </div>
          {artist.paymentNotes && (
            <div className="mt-6">
              <DetailLabel>Additional notes</DetailLabel>
              <p className="text-ink-dim text-sm whitespace-pre-wrap">{artist.paymentNotes}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <DetailLabel>{label}</DetailLabel>
      <div className="text-ink">{value}</div>
    </div>
  );
}

function DetailLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-widest text-ink-dim mb-2 flex items-center gap-1.5">
      <span className="w-1 h-1 rounded-full bg-gold" />
      {children}
    </div>
  );
}
