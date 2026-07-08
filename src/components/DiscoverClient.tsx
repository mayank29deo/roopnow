"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArtistCard } from "./landing/FeaturedArtists";
import { Search, SlidersHorizontal, X, Sparkles } from "lucide-react";

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
  yearsExp: number;
  portfolio: { imageUrl: string }[];
  reviews: { rating: number }[];
  services: { price: number; category: string }[];
};

const categories = ["All", "Bridal", "Party & Glam", "Editorial & HD", "Men's Grooming", "Hair & Style", "SFX & Artistic"];
const cities = ["All Cities", "Mumbai", "Delhi", "Bengaluru", "Hyderabad"];
const priceRanges = [
  { label: "Any budget", min: 0, max: 999999 },
  { label: "Under ₹5K", min: 0, max: 5000 },
  { label: "₹5K–₹15K", min: 5000, max: 15000 },
  { label: "₹15K–₹30K", min: 15000, max: 30000 },
  { label: "Premium ₹30K+", min: 30000, max: 999999 },
];

export function DiscoverClient({ artists }: { artists: Artist[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [city, setCity] = useState("All Cities");
  const [priceIdx, setPriceIdx] = useState(0);
  // 8-Jul: /discover server query now filters by verified=true, so
  // every artist reaching this component is already verified. The
  // old "Verified only" client-side chip is gone — leaving it would
  // read as a no-op filter.

  const filtered = useMemo(() => {
    return artists.filter((a) => {
      if (q && !(a.displayName.toLowerCase().includes(q.toLowerCase()) || a.specialties.toLowerCase().includes(q.toLowerCase()) || a.tagline.toLowerCase().includes(q.toLowerCase()))) return false;
      if (cat !== "All" && !a.specialties.toLowerCase().includes(cat.split(" ")[0].toLowerCase()) && !a.services.some(s => s.category === cat)) return false;
      if (city !== "All Cities" && a.city !== city) return false;
      const pr = priceRanges[priceIdx];
      if (pr.min > 0 || pr.max < 999999) {
        const minPrice = a.services.length > 0 ? Math.min(...a.services.map((s) => s.price)) : 0;
        if (minPrice < pr.min || minPrice > pr.max) return false;
      }
      return true;
    });
  }, [artists, q, cat, city, priceIdx]);

  function reset() {
    setQ("");
    setCat("All");
    setCity("All Cities");
    setPriceIdx(0);
  }

  const hasFilters = q || cat !== "All" || city !== "All Cities" || priceIdx !== 0;

  return (
    <>
      <section className="relative pt-12 lg:pt-20 pb-10 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet/15 rounded-full blur-3xl" />
          <div className="absolute top-10 right-1/4 w-96 h-96 bg-rose/15 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="chip mb-5">
              <Sparkles size={12} className="text-gold" />
              {artists.length} verified Artists
            </div>
            <h1 className="font-display text-5xl lg:text-7xl leading-[0.95]">
              Find your
              <br />
              <span className="italic text-gradient-primary">signature look.</span>
            </h1>
            <p className="mt-5 text-ink-dim max-w-xl">
              Filter by style, city, or budget. Every Artist is hand-reviewed. Every portfolio is real.
            </p>
          </motion.div>

          <div className="mt-10 grid lg:grid-cols-[1fr_auto] gap-3 items-end">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-dim" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, style, or specialty..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface border border-border focus:border-gold/50 outline-none text-ink placeholder-muted transition-colors"
              />
            </div>
            {hasFilters && (
              <button
                onClick={reset}
                className="btn-ghost self-start"
              >
                <X size={14} /> Clear filters
              </button>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-4 py-2 rounded-full text-sm border transition-all ${
                  cat === c
                    ? "bg-gradient-to-r from-rose to-violet border-transparent text-white"
                    : "bg-surface border-border text-ink-dim hover:border-gold/40 hover:text-ink"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <div className="chip">
              <SlidersHorizontal size={11} /> Filters
            </div>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="px-4 py-2 rounded-full text-sm bg-surface border border-border focus:border-gold/50 outline-none cursor-pointer"
            >
              {cities.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select
              value={priceIdx}
              onChange={(e) => setPriceIdx(Number(e.target.value))}
              className="px-4 py-2 rounded-full text-sm bg-surface border border-border focus:border-gold/50 outline-none cursor-pointer"
            >
              {priceRanges.map((p, i) => <option key={p.label} value={i}>{p.label}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="mb-6 text-sm text-ink-dim">
            Showing <span className="text-ink font-semibold">{filtered.length}</span> of {artists.length} Artists
          </div>
          {filtered.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-border rounded-3xl">
              <div className="text-4xl mb-3">✨</div>
              <p className="font-display text-2xl mb-2">No Artists match your filters.</p>
              <p className="text-ink-dim mb-6">Try loosening the criteria — there&apos;s magic somewhere.</p>
              <button onClick={reset} className="btn-primary">Reset filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3) }}
                >
                  <ArtistCard artist={a as never} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
