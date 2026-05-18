"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const categories = [
  {
    name: "Bridal",
    desc: "From sangeet to the big day — crafted looks that last 12+ hours.",
    img: "/landing/service-bridal.jpg",
    accent: "from-rose/70 via-plum/60 to-bg",
    count: "180+ Artists",
  },
  {
    name: "Party & Glam",
    desc: "Birthday, cocktail, date night — show up like the main character.",
    img: "/landing/service-party.jpg",
    accent: "from-violet/70 via-plum/60 to-bg",
    count: "240+ Artists",
  },
  {
    name: "Editorial",
    desc: "Lookbooks, campaigns, magazine covers. Camera-ready artistry.",
    img: "/landing/service-editorial.jpg",
    accent: "from-gold/70 via-amber/50 to-bg",
    count: "90+ Artists",
  },
  {
    name: "His Look",
    desc: "Wedding looks, beard sculpting, grooms-to-be. Yes, you deserve this.",
    img: "/landing/service-his-look.jpg",
    accent: "from-emerald/70 via-teal/50 to-bg",
    count: "65+ Artists",
  },
  {
    name: "Just the Hair",
    desc: "Blowouts, updos, color, extensions — the full crown treatment.",
    img: "/landing/service-just-the-hair.jpg",
    accent: "from-ruby/70 via-wine/50 to-bg",
    count: "320+ Artists",
  },
  {
    name: "Family Makeup",
    desc: "Pre-wedding family glam, group shoots, parents & siblings — everyone glowing.",
    img: "/landing/service-family-makeup.jpg",
    accent: "from-violet/70 via-ruby/60 to-bg",
    count: "40+ Artists",
  },
];

export function ServiceCategories() {
  return (
    <section className="py-24 lg:py-36">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
          <div>
            <div className="chip mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              Services
            </div>
            <h2 className="font-display text-5xl lg:text-7xl leading-[0.95]">
              What are you getting{" "}
              <span className="italic text-gradient-primary">ready</span> for?
            </h2>
          </div>
          <Link href="/services" className="btn-ghost group shrink-0">
            View all services
            <ArrowUpRight size={16} className="group-hover:rotate-45 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            >
              <Link
                href={`/discover?category=${encodeURIComponent(c.name)}`}
                className="block group relative rounded-3xl overflow-hidden aspect-[4/5] border border-border"
              >
                <img
                  src={c.img}
                  alt={c.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${c.accent} opacity-80`} />
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />

                <div className="absolute top-5 right-5">
                  <div className="chip bg-bg/40 backdrop-blur-sm">{c.count}</div>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8">
                  <h3 className="font-display text-4xl lg:text-5xl mb-2 group-hover:translate-x-1 transition-transform">
                    {c.name}
                  </h3>
                  <p className="text-ink-dim text-sm max-w-xs leading-relaxed">{c.desc}</p>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore Artists <ArrowUpRight size={14} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
