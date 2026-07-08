import Link from "next/link";
import { Download, Instagram, Mail, MessageCircle, Phone, Sparkles } from "lucide-react";

const SUPPORT_EMAIL = "roopsupport@gmail.com";
const SUPPORT_PHONE_HUMAN = "+91 80887 18846";
const SUPPORT_PHONE_DIAL = "+918088718846";
const WHATSAPP_URL = `https://wa.me/918088718846`;
const INSTAGRAM_URL = "https://www.instagram.com/roop.now";
const PDF_URL = "/policies/roop-platform-policies.pdf";

export const metadata = {
  title: "Contact — Roop",
  description: "Reach the Roop team for booking help, policy questions, or artist onboarding.",
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-8 py-24 lg:py-32">
      <div className="chip mb-6"><Sparkles size={12} className="text-gold" /> We&rsquo;re here for you</div>
      <h1 className="font-display text-5xl lg:text-6xl leading-[1.05] mb-4">
        Talk to <span className="italic text-gradient-primary">Roop.</span>
      </h1>
      <p className="text-ink-dim text-lg max-w-2xl">
        Booking issue, policy question, or want to list as an artist? Reach us on either channel &mdash; WhatsApp lands the fastest.
      </p>

      <div className="mt-10 grid sm:grid-cols-2 gap-4">
        <ContactCard
          href={WHATSAPP_URL}
          external
          icon={MessageCircle}
          label="WhatsApp"
          value={SUPPORT_PHONE_HUMAN}
          hint="Tap to open WhatsApp"
        />
        <ContactCard
          href={`tel:${SUPPORT_PHONE_DIAL}`}
          icon={Phone}
          label="Call"
          value={SUPPORT_PHONE_HUMAN}
          hint="Mon&ndash;Sat &middot; 10 AM to 7 PM IST"
        />
        <ContactCard
          href={`mailto:${SUPPORT_EMAIL}`}
          icon={Mail}
          label="Email support"
          value={SUPPORT_EMAIL}
          hint="Reply within one business day"
        />
        <ContactCard
          href={INSTAGRAM_URL}
          external
          icon={Instagram}
          label="Instagram"
          value="@roop.now"
          hint="DMs open for quick questions"
        />
      </div>

      <div className="mt-14 grid sm:grid-cols-2 gap-4">
        <PromptCard
          title="Have a booking issue?"
          body="Check the artist&rsquo;s cancellation policy on their profile first &mdash; that governs refunds and rescheduling."
          ctaLabel="Read the customer policies"
          ctaHref="/terms#customer"
        />
        <PromptCard
          title="Want to list as an artist?"
          body="Sign up as an artist and complete your profile. Admin reviews every new artist before it goes live on Discover."
          ctaLabel="Join Roop"
          ctaHref="/signup?role=artist"
        />
      </div>

      <div className="mt-14 rounded-3xl border border-gold/25 bg-gradient-to-br from-gold/5 to-transparent p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl mb-1">Platform policies</h3>
            <p className="text-sm text-ink-dim max-w-lg">The rules that keep Roop fair for both customers and artists. Download the PDF or read it inline.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/terms" className="btn-ghost">Read online</Link>
            <a href={PDF_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <Download size={14} /> PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactCard({
  href, external, icon: Icon, label, value, hint,
}: {
  href: string;
  external?: boolean;
  icon: typeof Sparkles;
  label: string;
  value: string;
  hint: string;
}) {
  const external_props = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <a
      href={href}
      {...external_props}
      className="rounded-3xl border border-border bg-surface/40 p-6 hover:border-gold/40 transition-colors group"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-2xl bg-gold/10 border border-gold/25 text-gold flex items-center justify-center group-hover:scale-105 transition-transform">
          <Icon size={18} />
        </div>
        <div className="text-[10px] uppercase tracking-widest text-ink-dim">{label}</div>
      </div>
      <div className="font-display text-2xl">{value}</div>
      <div className="text-xs text-ink-dim mt-1">{hint}</div>
    </a>
  );
}

function PromptCard({
  title, body, ctaLabel, ctaHref,
}: {
  title: string; body: string; ctaLabel: string; ctaHref: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-surface/40 p-6">
      <h3 className="font-display text-xl mb-2">{title}</h3>
      <p className="text-sm text-ink-dim leading-relaxed mb-4">{body}</p>
      <Link href={ctaHref} className="text-sm text-gold hover:underline">{ctaLabel} &rarr;</Link>
    </div>
  );
}
