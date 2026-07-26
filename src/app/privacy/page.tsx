import Link from "next/link";
import { Download, Lock, Mail, Phone, Shield, Sparkles } from "lucide-react";

// Privacy note derived from the ROOP Platform Policies document
// (data / conduct sections in A2, A9, B8, B9). Kept short and
// customer-first — full policies live on /terms.

const SUPPORT_EMAIL = "roopsupport@gmail.com";
const SUPPORT_PHONE_HUMAN = "+91 80887 18845";
const SUPPORT_PHONE_DIAL = "+918088718845";
const EFFECTIVE_DATE = "20 March 2026";
const LAST_UPDATED = "29 June 2026";
const PDF_URL = "/policies/roop-platform-policies.pdf";

export const metadata = {
  title: "Privacy — Roop",
  description: "How Roop collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-8 py-24 lg:py-32">
      <div className="chip mb-6"><Sparkles size={12} className="text-gold" /> Privacy at Roop</div>
      <h1 className="font-display text-5xl lg:text-6xl leading-[1.05] mb-4">
        Your data, <span className="italic text-gradient-primary">handled with care.</span>
      </h1>
      <p className="text-ink-dim text-lg max-w-2xl">
        A plain-English summary of what Roop collects, why we need it, and who ever sees it. The full binding text is in our platform policies.
      </p>

      <div className="mt-8 grid sm:grid-cols-2 gap-3">
        <a href={PDF_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
          <Download size={14} /> Download the full PDF
        </a>
        <Link href="/terms" className="btn-ghost">
          <Shield size={14} /> Read the full policies
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-surface/40 p-5 text-sm text-ink-dim">
        <div className="grid sm:grid-cols-2 gap-4">
          <MetaRow label="Effective date" value={EFFECTIVE_DATE} />
          <MetaRow label="Last updated" value={LAST_UPDATED} />
        </div>
      </div>

      <Sub title="What we collect">
        <ul className="policy-list">
          <li><strong>Account info</strong> &mdash; your name, phone number, email, and (for artists) the profile details you fill in to appear on the platform.</li>
          <li><strong>Booking info</strong> &mdash; event date, venue, timing, party size, notes, and messages exchanged around a booking.</li>
          <li><strong>Reviews</strong> &mdash; the rating and comment you leave after a completed booking.</li>
          <li><strong>Technical basics</strong> &mdash; standard device / browser signals we need to keep the site running and secure.</li>
        </ul>
      </Sub>

      <Sub title="Why we collect it">
        <ul className="policy-list">
          <li>To let customers discover artists and send Slot Requests, and to let artists receive and respond to them.</li>
          <li>To confirm bookings and pass the details each side needs (e.g. venue, phone number) so the service actually happens.</li>
          <li>To keep the platform safe and fair &mdash; fraud prevention, dispute mediation, review integrity.</li>
          <li>To email you receipts, confirmations and (only when relevant) product updates.</li>
        </ul>
      </Sub>

      <Sub title="Who sees it">
        <ul className="policy-list">
          <li><strong>The artist you book</strong> receives your name, contact number, event / venue details, and any notes you send &mdash; only for the booking itself. Artists agree not to spam customers or share their details with third parties. See <Link href="/terms#b8" className="text-gold hover:underline">B8</Link>.</li>
          <li><strong>Roop support</strong> can view booking records if you ask us to help resolve an issue.</li>
          <li>We do <strong>not</strong> sell or rent your data. We do not share it with third-party marketers.</li>
        </ul>
      </Sub>

      <Sub title="Payments">
        <p>Unless a booking explicitly runs through in-app payments, money moves directly between customer and artist &mdash; Roop does <strong>not</strong> hold, process, or refund those payments. Pay only to the artist&rsquo;s verified details shared during confirmed booking communication. See <Link href="/terms#a5" className="text-gold hover:underline">A5</Link>.</p>
      </Sub>

      <Sub title="Reviews & user content">
        <p>Reviews should be honest, relevant, and based on your real experience. Anything abusive, hateful, or defamatory may be removed. Artists may not pressure customers for positive reviews or threaten anyone over one &mdash; see <Link href="/terms#a9" className="text-gold hover:underline">A9</Link> and <Link href="/terms#b9" className="text-gold hover:underline">B9</Link>.</p>
      </Sub>

      <Sub title="Your account, your control">
        <ul className="policy-list">
          <li>Sign in and update your name, phone number, and other profile fields at any time.</li>
          <li>Reach out at <a href={`mailto:${SUPPORT_EMAIL}`} className="text-gold hover:underline">{SUPPORT_EMAIL}</a> to correct anything you can&rsquo;t change from the app, or to request account deactivation (subject to resolution of any ongoing dispute).</li>
          <li>You&rsquo;re responsible for keeping your login details secure &mdash; see <Link href="/terms#a2" className="text-gold hover:underline">A2</Link>.</li>
        </ul>
      </Sub>

      <Sub title="Data we&rsquo;re asked to remove">
        <p>Booking records may be retained for a reasonable period after account deactivation to comply with tax / dispute / legal obligations. Beyond that, we&rsquo;ll remove what we&rsquo;re asked to remove.</p>
      </Sub>

      <Sub title="Contact us about privacy">
        <p>Questions, concerns, or a specific request? Reach out on either channel &mdash; the fastest is WhatsApp.</p>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <a href={`tel:${SUPPORT_PHONE_DIAL}`} className="rounded-3xl border border-border bg-surface/40 p-5 hover:border-gold/40 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-gold/10 border border-gold/25 text-gold flex items-center justify-center"><Phone size={17} /></div>
              <div className="text-[10px] uppercase tracking-widest text-ink-dim">Message or call</div>
            </div>
            <div className="font-display text-xl">{SUPPORT_PHONE_HUMAN}</div>
          </a>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="rounded-3xl border border-border bg-surface/40 p-5 hover:border-gold/40 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-gold/10 border border-gold/25 text-gold flex items-center justify-center"><Mail size={17} /></div>
              <div className="text-[10px] uppercase tracking-widest text-ink-dim">Email support</div>
            </div>
            <div className="font-display text-xl">{SUPPORT_EMAIL}</div>
          </a>
        </div>
      </Sub>

      <div className="mt-16 rounded-3xl border border-gold/25 bg-gradient-to-br from-gold/5 to-transparent p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-3">
          <Lock size={16} className="text-gold" />
          <div className="text-[11px] uppercase tracking-widest text-gold font-semibold">One-liner</div>
        </div>
        <p className="font-display text-2xl leading-snug">
          We collect only what a booking needs, share it only with the artist working on that booking, and hold ourselves to the same policies we publish.
        </p>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-ink-dim mb-1">{label}</div>
      <div className="text-ink font-medium">{value}</div>
    </div>
  );
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h3 className="font-display text-2xl text-gold mb-3">{title}</h3>
      <div className="text-ink-dim leading-relaxed">{children}</div>
    </section>
  );
}
