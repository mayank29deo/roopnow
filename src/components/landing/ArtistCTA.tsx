"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Palette, TrendingUp, Shield, Calendar, ArrowUpRight } from "lucide-react";

const perks = [
  { icon: TrendingUp, text: "Grow your bookings 3x" },
  { icon: Calendar, text: "Own calendar, zero chaos" },
  { icon: Shield, text: "Verified clients only" },
  { icon: Palette, text: "A portfolio that converts" },
];

export function ArtistCTA() {
  return (
    <section className="py-24 lg:py-36">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-[2.5rem] grain"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-plum via-wine to-bg-soft" />
          <img
            src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1800&h=1000&fit=crop"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-bg via-bg/70 to-transparent" />

          <div className="absolute -top-20 -right-20 w-80 h-80 bg-rose/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gold/20 rounded-full blur-3xl" />

          <div className="relative p-10 lg:p-20 grid lg:grid-cols-5 gap-12 items-center">
            <div className="lg:col-span-3">
              <div className="chip mb-5 bg-gold/10 border-gold/30 text-gold">
                <Palette size={12} />
                For Artists
              </div>
              <h2 className="font-display text-5xl lg:text-7xl leading-[0.95] mb-6">
                Your craft
                <br />
                <span className="italic text-gradient-primary">deserves a stage.</span>
              </h2>
              <p className="text-ink-dim text-lg max-w-xl mb-10">
                Stop losing bookings to DMs and spreadsheets. Showcase your work,
                set your rates, control your calendar — and get paid on time.
                Roop is the platform built by and for India&apos;s beauty Artists.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-10">
                {perks.map((p) => (
                  <div
                    key={p.text}
                    className="flex items-center gap-3 glass rounded-2xl p-4"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold/30 to-gold/10 border border-gold/20 flex items-center justify-center">
                      <p.icon size={15} className="text-gold" />
                    </div>
                    <span className="text-sm">{p.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href="/signup?role=artist" className="btn-primary shine">
                  Join as an Artist
                  <ArrowUpRight size={16} />
                </Link>
                <Link href="/for-artists" className="btn-ghost">
                  Learn more
                </Link>
              </div>
            </div>

            <div className="lg:col-span-2 relative h-80 lg:h-[480px] hidden md:block">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="absolute right-0 top-0 w-64 h-80 rounded-3xl overflow-hidden shadow-2xl"
              >
                <img
                  src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=800&fit=crop"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
