"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Star, Play } from "lucide-react";

const marqueeArtists = [
  "/landing/portfolio-1.jpg",
  "/landing/portfolio-2.jpg",
  "/landing/portfolio-4.jpg",
  "/landing/portfolio-5.jpg",
  "/landing/portfolio-6.jpg",
];

export function Hero() {
  return (
    <section className="relative pt-12 lg:pt-20 pb-24 lg:pb-36 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-40 left-[10%] w-72 h-72 bg-rose/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-20 right-[10%] w-96 h-96 bg-violet/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-20 left-[30%] w-80 h-80 bg-gold/10 rounded-full blur-3xl animate-float" />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="chip mb-6"
            >
              <Sparkles size={12} className="text-gold" />
              <span>India&apos;s most curated Artist marketplace</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-[clamp(2.5rem,7vw,5.75rem)] leading-[0.95] tracking-tight"
            >
              Book the{" "}
              <span
                className="italic text-gradient-primary animate-gradient inline-block pr-[0.12em]"
                style={{
                  backgroundImage:
                    "linear-gradient(120deg, var(--gold), var(--rose), var(--violet), var(--gold))",
                }}
              >
                Artists
              </span>
              <br />
              behind your most{" "}
              <span className="relative inline-block pr-[0.12em]">
                <span className="italic">beautiful</span>
                <svg
                  className="absolute -bottom-2 left-0 w-[calc(100%-0.12em)] text-gold"
                  viewBox="0 0 200 12"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <motion.path
                    d="M2 9C40 3 80 3 120 7C160 11 180 9 198 5"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                  />
                </svg>
              </span>{" "}
              moments.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 text-lg text-ink-dim max-w-xl leading-relaxed"
            >
              Weddings. Birthday Glam. Editorial shoots. Fashion Weeks.
              Whatever the occasion — discover verified makeup Artists,
              hairstylists and beauty pros who turn moments into memories.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 flex flex-wrap gap-4 items-center"
            >
              <Link href="/discover" className="btn-primary shine">
                Discover Artists
                <ArrowRight size={16} />
              </Link>
              <Link href="/for-artists" className="btn-ghost">
                <Play size={14} fill="currentColor" />
                For Artists
              </Link>
            </motion.div>

          </div>

          <div className="lg:col-span-5 relative h-[520px] lg:h-[640px] hidden md:block">
            <HeroCollage />
          </div>
        </div>
      </div>

      <div className="mt-20 lg:mt-32 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-6 px-5 lg:px-8 max-w-7xl mx-auto">
          <div className="h-px bg-gold/30 flex-1" />
          <span className="text-xs uppercase tracking-widest text-gold">Different Makeup Looks, on One Platform</span>
          <div className="h-px bg-gold/30 flex-1" />
        </div>
        <Marquee images={marqueeArtists} />
      </div>
    </section>
  );
}

function HeroCollage() {
  return (
    <div className="relative w-full h-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
        animate={{ opacity: 1, scale: 1, rotate: -6 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute left-0 top-8 w-[48%] h-[60%] rounded-3xl overflow-hidden glow-rose"
      >
        <img
          src="/landing/hero-1.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-plum/40 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 glass-strong rounded-xl p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose to-violet" />
            <div>
              <div className="text-xs font-semibold">Ananya Kapoor</div>
              <div className="text-[10px] text-ink-dim flex items-center gap-1">
                <Star size={8} className="fill-gold text-gold" /> 4.9 · Bridal
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.85, rotate: 10 }}
        animate={{ opacity: 1, scale: 1, rotate: 5 }}
        transition={{ duration: 0.8, delay: 0.35 }}
        className="absolute right-0 top-0 w-[52%] h-[55%] rounded-3xl overflow-hidden glow-gold"
      >
        <img
          src="/landing/hero-2.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="absolute right-8 bottom-4 w-[58%] h-[45%] rounded-3xl overflow-hidden shadow-2xl"
      >
        <img
          src="/landing/hero-3.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-bg/10 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="absolute bottom-3 left-3 right-3 glass-strong rounded-xl px-3 py-2.5"
        >
          <div className="text-[9px] uppercase tracking-widest text-gold mb-0.5">Just booked</div>
          <div className="text-xs font-semibold mb-0.5 leading-tight">Bridal Trial with Meher</div>
          <div className="text-[10px] text-ink-dim flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
            Confirmed · Sat 6pm
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function Marquee({ images }: { images: string[] }) {
  const all = [...images, ...images];
  return (
    <div className="relative">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-bg to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-bg to-transparent z-10" />
      <motion.div
        className="flex gap-4"
        animate={{ x: [0, -1600] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {all.map((src, i) => (
          <div
            key={i}
            className="shrink-0 w-56 h-72 rounded-2xl overflow-hidden border border-border-strong"
          >
            <img src={src} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
