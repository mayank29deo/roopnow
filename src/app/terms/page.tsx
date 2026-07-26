import Link from "next/link";
import { Download, FileText, Mail, Phone, ScrollText, Sparkles } from "lucide-react";

// ROOP Platform Policies — sourced from the internal policy document
// Suraksha finalised on 29-Jun-2026. Publishes both the Customer and
// Artist policy sets on a single /terms page with an anchor TOC.
// Effective date, support email, and support phone come straight from
// the document header — if any of those change, update SUPPORT_* and
// the effective/updated dates in one place below.

const SUPPORT_EMAIL = "roopsupport@gmail.com";
const SUPPORT_PHONE_HUMAN = "+91 80887 18845";
const SUPPORT_PHONE_DIAL = "+918088718845";
const EFFECTIVE_DATE = "20 March 2026";
const LAST_UPDATED = "29 June 2026";
const PDF_URL = "/policies/roop-platform-policies.pdf";

export const metadata = {
  title: "Terms & Platform Policies — Roop",
  description: "Customer and Artist policies for using the Roop platform.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-8 py-24 lg:py-32">
      <div className="chip mb-6"><Sparkles size={12} className="text-gold" /> Platform policies</div>
      <h1 className="font-display text-5xl lg:text-6xl leading-[1.05] mb-4">
        Terms & <span className="italic text-gradient-primary">policies</span>
      </h1>
      <p className="text-ink-dim text-lg max-w-2xl">
        The rules that keep Roop fair for customers and artists. These policies apply the moment you use the platform.
      </p>

      <div className="mt-8 grid sm:grid-cols-2 gap-3">
        <a
          href={PDF_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          <Download size={14} /> Download the full PDF
        </a>
        <Link href="/contact" className="btn-ghost">
          <FileText size={14} /> Contact support
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-surface/40 p-5 text-sm text-ink-dim">
        <div className="grid sm:grid-cols-2 gap-4">
          <MetaRow label="Effective date" value={EFFECTIVE_DATE} />
          <MetaRow label="Last updated" value={LAST_UPDATED} />
          <MetaRow label="Support email" value={SUPPORT_EMAIL} href={`mailto:${SUPPORT_EMAIL}`} />
          <MetaRow label="Support phone" value={SUPPORT_PHONE_HUMAN} href={`tel:${SUPPORT_PHONE_DIAL}`} />
        </div>
      </div>

      {/* Quick summary */}
      <SectionCard title="Quick summary" icon={ScrollText}>
        <ul className="policy-list">
          <li><strong>Purpose:</strong> Publishable policies for Customers and Artists on ROOP.</li>
          <li><strong>ROOP&rsquo;s role:</strong> ROOP helps Customers discover and request bookings from independent Artists. For Artists, ROOP acts as a booking management platform.</li>
          <li><strong>Payments:</strong> Unless explicitly enabled on ROOP, service payments are handled directly between Customer and Artist (ROOP is not the payment handler).</li>
          <li><strong>Cancellation / Refund:</strong> the Artist&rsquo;s policy shown on their profile applies to that booking (unless ROOP explicitly states otherwise).</li>
        </ul>
      </SectionCard>

      {/* Table of contents */}
      <nav className="mt-12 rounded-3xl border border-border bg-surface/40 p-6 lg:p-8">
        <h2 className="font-display text-2xl mb-4">Contents</h2>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <a href="#customer" className="text-ink-dim hover:text-ink">1. Customer Policies</a>
          <a href="#artist" className="text-ink-dim hover:text-ink">2. Artist Policies</a>
          <a href="#appendix" className="text-ink-dim hover:text-ink">3. Appendix &mdash; Checklists</a>
          <a href="#contact" className="text-ink-dim hover:text-ink">4. Contact us</a>
        </div>
      </nav>

      {/* 1. CUSTOMER POLICIES */}
      <h2 id="customer" className="mt-20 mb-6 font-display text-4xl lg:text-5xl">1. Customer Policies</h2>
      <SectionCard title="What customers should know" icon={ScrollText}>
        <ul className="policy-list">
          <li>A Slot Request is not confirmed until the Artist accepts it on ROOP.</li>
          <li>Once confirmed, the Customer and Artist coordinate details (timings, looks, customizations, etc).</li>
          <li>Unless ROOP explicitly enables in-app payments for a specific booking, payments are made directly to the Artist.</li>
          <li>Each Artist&rsquo;s Cancellation / Refund Policy shown on their profile applies to that booking.</li>
        </ul>
      </SectionCard>

      <Sub id="a1" title="A1. Definitions">
        <p>In these Customer Policies, the following words have the meanings below:</p>
        <ul className="policy-list mt-3">
          <li><strong>Customer:</strong> the person requesting / booking a service on ROOP.</li>
          <li><strong>Artist:</strong> an independent professional listed on ROOP.</li>
          <li><strong>Slot Request:</strong> a booking request sent by a Customer that is not confirmed until accepted by the Artist.</li>
          <li><strong>Confirmed Booking:</strong> a booking accepted by the Artist on ROOP.</li>
          <li><strong>Advance / Deposit:</strong> any amount requested by the Artist to block the date / time (if applicable).</li>
          <li><strong>Additional Charges:</strong> travel, trial, early-morning fee, extra people, add-ons, or items not included in the base package.</li>
        </ul>
      </Sub>

      <Sub id="a2" title="A2. Eligibility & Account">
        <ul className="policy-list">
          <li>You must provide accurate details (name, phone, email) to use ROOP.</li>
          <li>You are responsible for activity on your account and for keeping your login / OTP (if any) secure.</li>
          <li>ROOP may suspend access for fraud, abuse, harassment, or repeated misuse of the platform.</li>
        </ul>
      </Sub>

      <Sub id="a3" title="A3. How Booking Works (Slot Request → Confirmation)">
        <p>ROOP enables you to discover Artists and send Slot Requests. A Slot Request becomes a Confirmed Booking only when the Artist accepts it.</p>
        <ul className="policy-list mt-3">
          <li>You must provide complete booking details: date, venue, event type, preferred timing, number of people (if applicable), and special requirements.</li>
          <li>Artists may accept or reject Slot Requests based on availability, location, and fit.</li>
          <li>If an Artist does not respond, you may send requests to other Artists to secure your date.</li>
        </ul>
      </Sub>

      <Sub id="a4" title="A4. Artist Response Timeline">
        <ul className="policy-list">
          <li>ROOP may display an expected response window (example: within 1&ndash;3 hours). This is a best-effort guideline, not a guarantee.</li>
          <li>If a request is not accepted within the expected window, we recommend requesting other Artists to secure your date.</li>
        </ul>
      </Sub>

      <Sub id="a5" title="A5. Payments (Customer to Artist)">
        <p>Unless ROOP explicitly enables in-app payments for a specific booking, payment is handled directly between Customer and Artist. The Artist sets the payment schedule (advance / final), payment modes, and receipt / invoice process.</p>
        <ul className="policy-list mt-3">
          <li>Confirm the Artist&rsquo;s advance amount, due date, and payment modes before paying.</li>
          <li>If the Artist requires advance payment to block the slot, pay within the timeline communicated by the Artist (commonly within 24 hours).</li>
          <li>ROOP does not hold customer funds and cannot directly refund payments made to Artists. Refunds (if any) are processed by Artists as per their policy.</li>
          <li><strong>Fraud prevention:</strong> pay only to the Artist&rsquo;s verified payment details shared during confirmed booking communication.</li>
        </ul>
      </Sub>

      <Sub id="a6" title="A6. Pricing Transparency & Additional Charges">
        <ul className="policy-list">
          <li>Prices shown on ROOP are base service prices set by Artists. Additional Charges may apply (travel, trial, early-morning, extra people, add-ons). ROOP does not interfere in the prices charged by Artists.</li>
          <li>Each Artist&rsquo;s service includes inclusions / exclusions. Review these before confirming.</li>
          <li>If you request changes after confirmation (extra looks, extra people, location changes), additional charges may apply.</li>
        </ul>
      </Sub>

      <Sub id="a7" title="A7. Cancellation, Reschedule & No-Show">
        <p>Cancellation and refund terms are primarily set by the Artist and shown on the Artist&rsquo;s profile or communicated at the time of booking.</p>
        <ul className="policy-list mt-3">
          <li><strong>Before acceptance:</strong> You may cancel a Slot Request at any time.</li>
          <li><strong>After acceptance:</strong> Your cancellation / reschedule is governed by the Artist&rsquo;s policy (including advance retention / refund rules).</li>
          <li><strong>No-show:</strong> If you are unavailable at the scheduled time / location beyond a reasonable grace period, the Artist may treat it as a no-show and charge as per their policy.</li>
          <li className="italic">If ROOP ever introduces a platform-level cancellation fee, it will be disclosed clearly and applied fairly as per applicable law.</li>
        </ul>
      </Sub>

      <Sub id="a8" title="A8. Customer Conduct, Safety & Venue Readiness">
        <ul className="policy-list">
          <li>Provide a safe working environment and respectful conduct for the Artist and their team.</li>
          <li>Keep venue access, parking, and entry permissions ready (if applicable).</li>
          <li>Be available at the agreed start time. Delays may reduce service time or add waiting charges (as per Artist&rsquo;s policy).</li>
          <li>Harassment, abuse, discrimination, or unsafe behavior may lead to immediate suspension from ROOP.</li>
        </ul>
      </Sub>

      <Sub id="a9" title="A9. Reviews, Ratings & User Content">
        <ul className="policy-list">
          <li>Reviews should be honest, relevant, and based on your real experience.</li>
          <li>No abusive, hateful, or defamatory content. ROOP may remove content that violates these policies.</li>
        </ul>
      </Sub>

      <Sub id="a10" title="A10. Disputes, Support & Grievance">
        <ul className="policy-list">
          <li>For booking issues, contact ROOP Support using the details provided on the platform.</li>
          <li className="italic">ROOP may assist with mediation, but the service agreement is between Customer and Artist.</li>
        </ul>
      </Sub>

      <Sub id="a11" title="A11. Platform Role & Limitation of Liability">
        <ul className="policy-list">
          <li>ROOP facilitates discovery and booking only. ROOP does not deliver the makeup / hair service.</li>
          <li>ROOP is not responsible for service outcome, product suitability, allergic reactions, or on-site disputes. Customers should communicate needs / allergies in advance.</li>
          <li>ROOP is not responsible for payments made directly to Artists or for refunds unless ROOP explicitly handled the payment for that booking.</li>
          <li>To the maximum extent permitted by law, ROOP&rsquo;s liability is limited to the amount (if any) paid to ROOP for platform use for the relevant booking.</li>
        </ul>
      </Sub>

      {/* 2. ARTIST POLICIES */}
      <h2 id="artist" className="mt-20 mb-6 font-display text-4xl lg:text-5xl">2. Artist Policies</h2>
      <SectionCard title="What artists agree to on ROOP" icon={ScrollText}>
        <ul className="policy-list">
          <li>Keep profile, pricing, and availability accurate.</li>
          <li>Respond to Slot Requests within the expected timeline shown on ROOP.</li>
          <li>Follow your displayed Cancellation / Refund Policy consistently.</li>
          <li>Handle payments transparently if payments are collected directly from customers.</li>
          <li>Maintain hygiene, professionalism, and respectful conduct.</li>
        </ul>
      </SectionCard>

      <Sub id="b1" title="B1. Eligibility, Verification & Compliance">
        <ul className="policy-list">
          <li>You must be legally eligible to provide services and comply with local laws and regulations.</li>
          <li>You may be required to provide your Makeup Certificate, city coverage, and portfolio proof.</li>
          <li>ROOP may pause or remove listings if verification fails or if repeated serious complaints arise.</li>
        </ul>
      </Sub>

      <Sub id="b2" title="B2. Profile Listing, Pricing & Accuracy">
        <ul className="policy-list">
          <li>Pricing must be accurate and match what you will charge customers for the listed service.</li>
          <li>Clearly specify inclusions and exclusions for each service (products, number of looks, duration, team size).</li>
          <li>Disclose Additional Charges (travel, trial, early-morning, accommodation, waiting, etc).</li>
          <li>Publish your Cancellation / Refund Policy on your ROOP profile and apply it consistently.</li>
        </ul>
      </Sub>

      <Sub id="b3" title="B3. Availability & Response Time">
        <ul className="policy-list">
          <li>Keep your availability updated and block dates you cannot serve.</li>
          <li>Accept or reject Slot Requests promptly. Not responding harms customer trust and may reduce your visibility / ranking on ROOP.</li>
          <li>If you accept a booking, confirm critical details (timing, venue, required services) as soon as possible.</li>
        </ul>
      </Sub>

      <Sub id="b4" title="B4. Communication After Acceptance">
        <ul className="policy-list">
          <li>After accepting a booking, contact the customer to confirm details (start time, location, service specifics).</li>
          <li>Communicate clearly on what you need from the customer (reference photos, skin concerns, allergies, schedule).</li>
          <li>Use respectful language and maintain professional boundaries.</li>
        </ul>
      </Sub>

      <Sub id="b5" title="B5. Payment Handling (Artist-led)">
        <p>As of now, ROOP does not process payments for your booking. So, you may collect payments directly from customers. You must handle payment terms transparently and fairly.</p>
        <ul className="policy-list mt-3">
          <li>Disclose advance amount, due date, payment modes (UPI / cash / bank transfer), and final settlement timeline upfront.</li>
          <li>Confirm receipt of payment in writing (message / receipt).</li>
          <li>Refunds (if any) must follow your published policy. Do not change the policy after receiving advance.</li>
          <li>You are responsible for any tax / GST obligations and invoicing / receipts as applicable.</li>
        </ul>
      </Sub>

      <Sub id="b6" title="B6. Cancellations, Reschedules & No-Show">
        <ul className="policy-list">
          <li>Your cancellation / refund policy must be clear and visible on ROOP.</li>
          <li>Avoid cancelling confirmed bookings. Multiple last-minute cancellations may lead to reduced ranking, or suspension.</li>
          <li>If you must cancel due to emergencies, inform the customer immediately and (where possible) suggest alternatives / referrals.</li>
          <li>Define no-show and waiting-time charges clearly (grace period, charges per hour, etc.).</li>
        </ul>
      </Sub>

      <Sub id="b7" title="B7. Service Standards, Hygiene & Safety">
        <ul className="policy-list">
          <li>Maintain hygiene: sanitized brushes, clean sponges, disposable applicators where appropriate.</li>
          <li>Use safe products (not expired) and disclose products on request.</li>
          <li>Arrive on time with buffer for venue access / traffic. Communicate delays proactively.</li>
          <li>Maintain respectful conduct at venues; no harassment, discrimination, or unsafe behavior.</li>
        </ul>
      </Sub>

      <Sub id="b8" title="B8. Customer Data & Marketing">
        <ul className="policy-list">
          <li>Customer contact details obtained via ROOP are for fulfilling the booking only.</li>
          <li>Do not spam customers or share their data with third parties without explicit consent.</li>
          <li>Any marketing messages must be opt-in and comply with applicable law.</li>
        </ul>
      </Sub>

      <Sub id="b9" title="B9. Reviews & Ratings (No Manipulation)">
        <ul className="policy-list">
          <li>Do not request, bribe, or pressure customers for positive reviews.</li>
          <li>Do not threaten or harass customers regarding reviews.</li>
          <li>ROOP may remove fake reviews and suspend accounts for review manipulation.</li>
        </ul>
      </Sub>

      <Sub id="b10" title="B10. Disputes & Cooperation">
        <ul className="policy-list">
          <li>Cooperate with ROOP Support during disputes by providing relevant information (messages, receipts, booking details).</li>
          <li>Respond to ROOP queries within a reasonable time. Non-cooperation may affect listing status.</li>
          <li>ROOP may mediate but does not guarantee any particular outcome.</li>
        </ul>
      </Sub>

      <Sub id="b11" title="B11. Platform Actions, Suspension & Termination">
        <ul className="policy-list">
          <li>ROOP may adjust ranking / visibility based on responsiveness, cancellations, reviews, and platform trust signals.</li>
          <li>ROOP may suspend or remove listings for fraud, repeated last-minute cancellations, serious misconduct, or safety concerns.</li>
          <li>You may request account deactivation, subject to resolution of ongoing disputes and policy compliance.</li>
        </ul>
      </Sub>

      <Sub id="b12" title="B12. Liability & Insurance (Recommended)">
        <ul className="policy-list">
          <li>You are responsible for the services you provide and any claims arising from your service delivery.</li>
          <li>ROOP is not liable for on-site incidents, product reactions, or property damage caused during service.</li>
          <li>We recommend maintaining professional liability coverage / insurance where feasible.</li>
        </ul>
      </Sub>

      {/* 3. APPENDIX */}
      <h2 id="appendix" className="mt-20 mb-6 font-display text-4xl lg:text-5xl">3. Appendix — Checklists</h2>
      <Sub id="c1" title="C1. Customer Booking Checklist (Recommended)">
        <ul className="policy-list">
          <li>Confirm venue address, entry time, and parking instructions.</li>
          <li>Share reference looks and any allergies / skin sensitivities.</li>
          <li>Confirm advance amount, payment mode, and due date (if paying directly to the Artist).</li>
          <li>Confirm add-ons: hair styling, saree draping, extra people, early-morning.</li>
          <li>Save ROOP booking confirmation and Artist contact details.</li>
        </ul>
      </Sub>

      {/* CONTACT */}
      <h2 id="contact" className="mt-20 mb-6 font-display text-4xl lg:text-5xl">4. Contact us</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <a
          href={`tel:${SUPPORT_PHONE_DIAL}`}
          className="rounded-3xl border border-border bg-surface/40 p-6 hover:border-gold/40 transition-colors"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gold/10 border border-gold/25 text-gold flex items-center justify-center"><Phone size={17} /></div>
            <div className="text-[10px] uppercase tracking-widest text-ink-dim">Message or call</div>
          </div>
          <div className="font-display text-2xl">{SUPPORT_PHONE_HUMAN}</div>
        </a>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="rounded-3xl border border-border bg-surface/40 p-6 hover:border-gold/40 transition-colors"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gold/10 border border-gold/25 text-gold flex items-center justify-center"><Mail size={17} /></div>
            <div className="text-[10px] uppercase tracking-widest text-ink-dim">Email support</div>
          </div>
          <div className="font-display text-2xl">{SUPPORT_EMAIL}</div>
        </a>
      </div>
    </div>
  );
}

function MetaRow({ label, value, href }: { label: string; value: string; href?: string }) {
  const inner = <span className="text-ink font-medium">{value}</span>;
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-ink-dim mb-1">{label}</div>
      {href ? <a href={href} className="hover:text-gold">{inner}</a> : inner}
    </div>
  );
}

function SectionCard({
  title, icon: Icon, children,
}: { title: string; icon: typeof Sparkles; children: React.ReactNode }) {
  return (
    <section className="mt-10 rounded-3xl border border-gold/25 bg-gradient-to-br from-gold/5 to-transparent p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-gold/10 border border-gold/25 text-gold flex items-center justify-center"><Icon size={17} /></div>
        <h3 className="font-display text-2xl">{title}</h3>
      </div>
      <div className="text-ink-dim leading-relaxed">{children}</div>
    </section>
  );
}

function Sub({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-10 scroll-mt-24">
      <h3 className="font-display text-2xl text-gold mb-3">{title}</h3>
      <div className="text-ink-dim leading-relaxed">{children}</div>
    </section>
  );
}
