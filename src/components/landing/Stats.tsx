"use client";
import { motion } from "framer-motion";
import { BadgeCheck, Zap, ImageIcon, CalendarCheck } from "lucide-react";

const stats = [
  {
    icon: BadgeCheck,
    title: "Every artist reviewed",
    sub: "We onboard Certified Artists only",
  },
  {
    icon: Zap,
    title: "Book in under 2 min",
    sub: "No DMs, no waiting to be seen",
  },
  {
    icon: ImageIcon,
    title: "Real portfolios only",
    sub: "Actual work, not stock photos",
  },
  {
    icon: CalendarCheck,
    title: "Your slot, confirmed",
    sub: "No ghosting, no last-minute drops",
  },
];

export function Stats() {
  return (
    <section className="py-16 lg:py-20 border-y border-border bg-gradient-to-b from-transparent via-surface/30 to-transparent">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center lg:text-left p-4"
            >
              <div className="flex items-center justify-center lg:justify-start mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-plum to-surface-2 border border-border-strong flex items-center justify-center">
                  <s.icon size={18} className="text-gold" />
                </div>
              </div>
              <div className="font-display text-2xl lg:text-3xl leading-tight">
                {s.title}
              </div>
              <div className="text-sm text-ink-dim mt-2 max-w-xs lg:max-w-none mx-auto lg:mx-0">
                {s.sub}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
