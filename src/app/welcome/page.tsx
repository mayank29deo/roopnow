"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ShieldCheck, Sparkles, Clock } from "lucide-react";
import { BriefcaseOpen } from "@/components/BriefcaseOpen";

// Customer welcome landing — reached from the "Step inside" CTA in the
// signup email. The briefcase opens, then the page dissolves into a
// short personalized "Welcome, Mayank." moment with three glass cards
// and one gold "Begin" button that pushes them into /discover.
//
// Public route: anyone with the URL can see it. Personalization comes
// from the ?name= query param the email signs.

const CARDS = [
  {
    Icon: ShieldCheck,
    title: "Verified Artists",
    sub: "Every portfolio is real.",
  },
  {
    Icon: Sparkles,
    title: "Real reviews",
    sub: "From real Roop customers.",
  },
  {
    Icon: Clock,
    title: "Book in 2 minutes",
    sub: "No DMs. No ghosting.",
  },
];

function WelcomeInner() {
  const params = useSearchParams();
  const rawName = params.get("name")?.trim() || "";
  const firstName = rawName.split(" ")[0] || "";
  const [phase, setPhase] = useState<"briefcase" | "welcome">("briefcase");

  useEffect(() => {
    // Skip the animation for reduced-motion users — drop straight to the panel.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("welcome");
    }
  }, []);

  return (
    <main className="min-h-screen bg-bg text-ink flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient gold radial behind everything */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(201,169,126,0.18), transparent 70%)",
        }}
      />

      {/* Welcome panel — sits behind the briefcase, fades in after it lifts */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{
          opacity: phase === "welcome" ? 1 : 0,
          y: phase === "welcome" ? 0 : 16,
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-2xl w-full text-center"
      >
        <h1 className="font-display text-5xl md:text-6xl text-ink mb-3 leading-[1.1]">
          Welcome
          {firstName ? (
            <>
              ,&nbsp;<span className="italic text-amber">{firstName}</span>
            </>
          ) : null}
          .
        </h1>
        <p className="text-[11px] md:text-xs tracking-[0.32em] uppercase text-gold/70 mb-12">
          Where creation meets the moment
        </p>

        <motion.div
          initial="hidden"
          animate={phase === "welcome" ? "show" : "hidden"}
          variants={{
            show: { transition: { staggerChildren: 0.12, delayChildren: 0.5 } },
          }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12"
        >
          {CARDS.map(({ Icon, title, sub }) => (
            <motion.div
              key={title}
              variants={{
                hidden: { opacity: 0, y: 18 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              className="rounded-2xl border border-border-strong bg-wine-deep/50 backdrop-blur-sm p-5 text-left"
            >
              <Icon className="w-6 h-6 text-amber mb-3" strokeWidth={1.5} />
              <div className="font-display text-lg text-ink mb-1">{title}</div>
              <div className="text-ink-dim text-sm leading-relaxed">{sub}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "welcome" ? 1 : 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <Link
            href="/discover"
            className="inline-block px-12 py-4 rounded-full text-bg font-semibold text-base hover:scale-[1.02] transition-transform"
            style={{
              background:
                "linear-gradient(135deg, #E8B86D 0%, #D4B586 55%, #A8875E 100%)",
              boxShadow: "0 10px 32px rgba(201,169,126,0.4)",
            }}
          >
            Begin
          </Link>
        </motion.div>
      </motion.div>

      {/* Briefcase overlay — plays on mount, fades to reveal the panel */}
      {phase === "briefcase" && (
        <BriefcaseOpen onDone={() => setPhase("welcome")} />
      )}
    </main>
  );
}

export default function WelcomePage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-bg" />}>
      <WelcomeInner />
    </Suspense>
  );
}
