import Link from "next/link";
import { Sparkles, Palette, TrendingUp, Calendar, Shield, Heart, Users, ArrowRight, Check } from "lucide-react";

export const metadata = { title: "For Artists — Roop" };

const features = [
  { icon: TrendingUp, title: "3× your bookings", text: "Our top Artists triple their monthly bookings within 90 days. Clients find you, not the other way around." },
  { icon: Calendar, title: "One calendar, zero chaos", text: "No more WhatsApp scheduling. See your bookings, time slots, and payments in one beautiful dashboard." },
  { icon: Shield, title: "Verified clients", text: "Every customer is verified. No-shows are rare. Payments are guaranteed." },
  { icon: Heart, title: "Portfolio that converts", text: "Your work deserves more than an Instagram grid. Get a magazine-style profile that sells itself." },
  { icon: Users, title: "Build your tribe", text: "Reviews, repeat clients, and community. Grow your name with every booking." },
  { icon: Palette, title: "Creative freedom", text: "Set your rates. Choose your style. Accept only the work you want. You stay in charge." },
];

const steps = [
  "Create your free Artist profile",
  "Upload your portfolio & list services",
  "Get discovered and start receiving bookings",
];

export default function ForArtistsPage() {
  return (
    <>
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-gold/15 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose/15 rounded-full blur-3xl animate-float-slow" />
        </div>
        <div className="relative max-w-5xl mx-auto px-5 lg:px-8 text-center">
          <div className="chip mx-auto mb-6"><Palette size={12} className="text-gold" />For Artists</div>
          <h1 className="font-display text-6xl lg:text-8xl leading-[0.95] mb-6">
            Your craft deserves<br />
            <span className="italic text-gradient-primary">a stage.</span>
          </h1>
          <p className="text-xl text-ink-dim max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop losing bookings to DMs and spreadsheets. Roop is the platform built
            by and for India&apos;s beauty Artists. Showcase your work, set your rates,
            get paid on time.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/signup?role=artist" className="btn-primary shine">
              Join as an Artist <ArrowRight size={16} />
            </Link>
            <Link href="#how" className="btn-ghost">
              See how it works
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 border-y border-border bg-gradient-to-b from-transparent via-surface/30 to-transparent">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-5xl lg:text-6xl">
              Everything you need.<br />
              <span className="italic text-gradient-rose">Nothing you don&apos;t.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="glass rounded-3xl p-7 hover:border-gold/30 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center mb-5">
                  <f.icon size={20} className="text-gold" />
                </div>
                <h3 className="font-display text-2xl mb-2">{f.title}</h3>
                <p className="text-ink-dim text-sm leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="py-24">
        <div className="max-w-5xl mx-auto px-5 lg:px-8">
          <h2 className="font-display text-5xl lg:text-6xl text-center mb-14">
            Live in <span className="italic text-gradient-primary">10 minutes.</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <div key={s} className="relative">
                <div className="glass rounded-3xl p-8 h-full">
                  <div className="font-display text-7xl text-gradient-rose mb-4 opacity-70">0{i + 1}</div>
                  <p className="text-lg">{s}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-5 lg:px-8">
          <div className="glass-strong rounded-[2.5rem] p-10 lg:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-mesh opacity-40 pointer-events-none" />
            <div className="relative">
              <div className="chip mx-auto mb-6"><Sparkles size={12} className="text-gold" /> Ready to launch?</div>
              <h2 className="font-display text-5xl lg:text-6xl mb-8">
                Create your Artist profile<br />
                <span className="italic text-gradient-primary">in seconds.</span>
              </h2>
              {/* 7-Jul tracker item 1: "Free to join. Free to list…" subhead
                  removed per Suraksha — pricing story is told on the payments
                  section instead, no need for it on the CTA card. */}
              <Link href="/signup?role=artist" className="btn-primary shine inline-flex">
                Join Roop <ArrowRight size={16} />
              </Link>
              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-ink-dim">
                <span className="flex items-center gap-2"><Check size={14} className="text-emerald" />No setup fees</span>
                <span className="flex items-center gap-2"><Check size={14} className="text-emerald" />Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
