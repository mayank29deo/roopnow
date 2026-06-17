"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Calendar, Clock, MapPin, DollarSign, Star, Users,
  Plus, Trash2, Edit3, X, Loader2, BadgeCheck, ArrowUpRight,
  LayoutDashboard, Image as ImageIcon, Settings, Check,
  CalendarX, CalendarPlus, ClipboardList, Eye, IndianRupee,
  CreditCard, FileSignature, Instagram, Award, Compass, Wallet,
  Building2, MessageSquare, Palette,
} from "lucide-react";
import { formatPrice, formatDateLong } from "@/lib/utils";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { ImagePicker } from "./ImagePicker";
import type { AvailabilityInput } from "@/lib/availability";
import { isoDay } from "@/lib/availability";
import { format } from "date-fns";

type Artist = {
  id: string; displayName: string; studioName: string;
  tagline: string; bio: string;
  city: string; area: string; avatarUrl: string; coverUrl: string;
  specialties: string; yearsExp: number; instagram: string | null;
  verified: boolean; featured: boolean; profileViews: number;
  experienceSummary: string; travelRadiusKm: number;
  // Phase 1 additions
  serviceMode: "studio" | "client" | "both";
  artistType: "solo" | "team";
  maxBookingsPerDay: number;
  cosmeticBrands: string;          // comma-sep, up to 5 in UI
  outstationAvailable: boolean;
  outstationConditions: string;
  acneExperience: boolean;
  acneExperienceDetails: string;
  paymentStructure: string;
  paymentModes: string;
  invoiceAvailable: boolean;
  paymentNotes: string;
  // legacy bank/UPI columns (still on DB row, dropped from form)
  upiId: string; bankAccountName: string; bankIfsc: string; bankAccountNo: string;
  cancellationPolicy: string; agreedToTerms: boolean;
  skinToneExpertise: string;
};

const SKIN_TONE_OPTIONS = [
  { value: "Brown", description: "Deep brown skin tones" },
  { value: "Dusky", description: "Olive / dusky tones" },
  { value: "Wheatish", description: "Warm wheatish tones" },
  { value: "Light", description: "Fair / light tones" },
] as const;
type Booking = {
  id: string; date: string; timeSlot: string; status: string;
  totalPrice: number; notes: string | null; address: string | null;
  eventName: string | null; budget: number | null; rejectionReason: string | null;
  customerName: string; customerPhone: string | null; customerEmail: string | null;
  serviceName: string; serviceCategory: string; serviceDuration: number;
};
type Service = {
  id: string; name: string;
  description: string;            // legacy — UI now uses inclusions/exclusions
  inclusions: string;
  exclusions: string;
  duration: number; price: number; category: string;
};
type AdditionalCharge = {
  id: string; name: string; description: string; sortOrder: number;
};
type PortfolioItem = { id: string; imageUrl: string; caption: string | null; order: number };
type BlockedDate = { id: string; blockedDate: string; reason: string | null };
type ArtistEvent = {
  id: string; eventDate: string; startTime: string; endTime: string;
  eventPeriod: string | null; eventName: string; location: string | null;
  customerName: string | null; customerPhone: string | null; notes: string | null;
};
type Subscription = {
  id: string; periodMonth: string; amount: number; status: string;
  razorpayOrderId: string | null; paidAt: string | null;
};

type Tab = "overview" | "requests" | "bookings" | "calendar" | "services" | "portfolio" | "profile" | "payments";

export function ArtistDashboardClient({
  artist, bookings, services, additionalCharges, portfolio, blockedDates, events, subscriptions,
  availability, earnings, avgRating, reviewCount, userName, userId,
}: {
  artist: Artist; bookings: Booking[]; services: Service[];
  additionalCharges: AdditionalCharge[]; portfolio: PortfolioItem[];
  blockedDates: BlockedDate[]; events: ArtistEvent[]; subscriptions: Subscription[];
  availability: AvailabilityInput;
  earnings: number; avgRating: number; reviewCount: number;
  userName: string; userId: string;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const pendingRequests = bookings.filter((b) => b.status === "pending");
  const upcoming = bookings.filter((b) => {
    if (b.status !== "accepted") return false;
    return new Date(b.date) >= new Date();
  });

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "requests", label: "Requests", icon: ClipboardList, badge: pendingRequests.length },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "calendar", label: "Calendar", icon: CalendarPlus },
    { id: "services", label: "Services", icon: Sparkles },
    { id: "portfolio", label: "Portfolio", icon: ImageIcon },
    { id: "profile", label: "Profile", icon: Settings },
    { id: "payments", label: "Payments", icon: CreditCard },
  ];

  return (
    <section className="luxe luxe-halo py-10 lg:py-16">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex items-start justify-between gap-6 mb-10 flex-wrap">
          <div className="flex items-center gap-5">
            <img src={artist.avatarUrl} alt="" className="w-20 h-20 rounded-3xl object-cover border-2 border-gold/30" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display text-4xl lg:text-5xl">Hello, {userName.split(" ")[0]}.</h1>
                {artist.verified && <BadgeCheck className="text-gold fill-gold/20" size={24} />}
              </div>
              <p className="text-ink-dim">Your studio — manage everything in one place.</p>
            </div>
          </div>
          <Link href={`/artists/${artist.id}`} className="btn-ghost">
            <ArrowUpRight size={14} /> View public profile
          </Link>
        </div>

        <div className="border-b border-border flex gap-2 overflow-x-auto mb-10 -mx-5 px-5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`py-3 px-4 text-sm font-medium rounded-t-xl border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                tab === t.id ? "border-gold text-ink bg-gradient-to-b from-transparent to-gold/5" : "border-transparent text-ink-dim hover:text-ink"
              }`}
            >
              <t.icon size={15} /> {t.label}
              {t.badge && t.badge > 0 ? (
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] bg-gradient-to-r from-gold-bright to-gold-deep text-wine-deep font-bold">{t.badge}</span>
              ) : null}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "overview" && (
            <OverviewTab
              key="overview" artist={artist} bookings={bookings} upcoming={upcoming}
              earnings={earnings} avgRating={avgRating} reviewCount={reviewCount}
              portfolio={portfolio} services={services} onJump={setTab}
            />
          )}
          {tab === "requests" && <RequestsTab key="requests" requests={pendingRequests} />}
          {tab === "bookings" && <BookingsTab key="bookings" bookings={bookings.filter((b) => b.status !== "pending")} />}
          {tab === "calendar" && (
            <CalendarTab
              key="calendar" availability={availability} blockedDates={blockedDates} events={events}
            />
          )}
          {tab === "services" && <ServicesTab key="services" services={services} additionalCharges={additionalCharges} artistId={artist.id} />}
          {tab === "portfolio" && <PortfolioTab key="portfolio" portfolio={portfolio} artistId={artist.id} userId={userId} />}
          {tab === "profile" && <ProfileTab key="profile" artist={artist} userId={userId} />}
          {tab === "payments" && <PaymentsTab key="payments" subscriptions={subscriptions} artistId={artist.id} />}
        </AnimatePresence>
      </div>
    </section>
  );
}

// ============================================================
// Overview
// ============================================================
function OverviewTab({ artist, bookings, upcoming, earnings, avgRating, reviewCount, portfolio, services, onJump }: {
  artist: Artist; bookings: Booking[]; upcoming: Booking[];
  earnings: number; avgRating: number; reviewCount: number;
  portfolio: PortfolioItem[]; services: Service[]; onJump: (t: Tab) => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <MetricCard icon={IndianRupee} label="Earnings" value={formatPrice(earnings)} accent="gold" />
        <MetricCard icon={Calendar} label="Upcoming" value={upcoming.length.toString()} accent="rose" />
        <MetricCard icon={Users} label="Clients" value={new Set(bookings.map((b) => b.customerName)).size.toString()} accent="violet" />
        <MetricCard icon={Star} label="Rating" value={avgRating ? avgRating.toFixed(1) : "—"} sub={`${reviewCount} reviews`} accent="emerald" />
        <MetricCard icon={Eye} label="Profile views" value={artist.profileViews.toString()} accent="gold" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-2xl">Next up</h3>
            <button onClick={() => onJump("bookings")} className="text-sm text-gold hover:underline inline-flex items-center gap-1">
              All bookings <ArrowUpRight size={12} />
            </button>
          </div>
          {upcoming.length === 0 ? (
            <div className="py-10 text-center text-ink-dim">
              No accepted bookings coming up. Check the Requests tab.
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 4).map((b) => (
                <div key={b.id} className="flex items-center justify-between p-4 rounded-2xl bg-surface/50 border border-border">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{b.customerName} · {b.eventName ?? b.serviceName}</div>
                    <div className="text-xs text-ink-dim">{b.serviceName}</div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="text-sm">{formatDateLong(new Date(b.date))}</div>
                    <div className="text-xs text-ink-dim">{b.timeSlot} · {formatPrice(b.totalPrice)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-3xl p-6">
          <h3 className="font-display text-2xl mb-5">Set-up checklist</h3>
          <ul className="space-y-3 text-sm">
            <TipItem done={portfolio.length >= 5} text="Upload 5+ portfolio images" />
            <TipItem done={services.length >= 3} text="List 3+ services" />
            <TipItem done={!!artist.instagram} text="Link your Instagram" />
            <TipItem done={artist.bio.length > 80} text="Write a standout bio" />
            <TipItem done={!!artist.upiId || !!artist.bankAccountNo} text="Add payment details" />
            <TipItem done={artist.cancellationPolicy.length > 10} text="Publish a cancellation policy" />
            <TipItem done={artist.agreedToTerms} text="Sign the Artist declaration" />
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

function MetricCard({ icon: Icon, label, value, sub, accent }: {
  icon: typeof DollarSign; label: string; value: string; sub?: string;
  accent: "gold" | "rose" | "violet" | "emerald";
}) {
  const accents = {
    gold: "from-gold/20 to-gold/5 text-gold",
    rose: "from-rose/20 to-rose/5 text-rose",
    violet: "from-violet/20 to-violet/5 text-violet",
    emerald: "from-emerald/20 to-emerald/5 text-emerald",
  };
  return (
    <div className="p-5 rounded-3xl border border-border bg-surface relative overflow-hidden">
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${accents[accent]} blur-xl opacity-60`} />
      <div className="relative">
        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${accents[accent]} flex items-center justify-center mb-3`}>
          <Icon size={17} />
        </div>
        <div className="text-xs uppercase tracking-widest text-ink-dim mb-1">{label}</div>
        <div className="font-display text-3xl lg:text-4xl">{value}</div>
        {sub && <div className="text-xs text-ink-dim mt-1">{sub}</div>}
      </div>
    </div>
  );
}

function TipItem({ done, text }: { done: boolean; text: string }) {
  return (
    <li className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${done ? "bg-emerald text-bg" : "border border-border"}`}>
        {done && <Check size={11} strokeWidth={3} />}
      </div>
      <span className={done ? "text-ink-dim line-through" : ""}>{text}</span>
    </li>
  );
}

// ============================================================
// Requests — pending bookings with accept/reject
// ============================================================
function RequestsTab({ requests }: { requests: Booking[] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="mb-6">
        <h2 className="font-display text-3xl mb-1">Pending requests</h2>
        <p className="text-ink-dim text-sm">Accept to confirm. Reject with a clear reason — the customer will be notified.</p>
      </div>
      {requests.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-3xl text-ink-dim">
          No pending requests right now.
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((b) => <RequestCard key={b.id} booking={b} />)}
        </div>
      )}
    </motion.div>
  );
}

function RequestCard({ booking }: { booking: Booking }) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "rejecting" | "loading">("idle");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function act(action: "accept" | "reject") {
    if (action === "reject" && !reason.trim()) {
      setMode("rejecting");
      return;
    }
    setMode("loading"); setError(null);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: action === "reject" ? reason : undefined }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setMode("idle");
    }
  }

  return (
    <div className="glass rounded-3xl p-5 lg:p-6">
      <div className="grid lg:grid-cols-[1fr_auto] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="chip text-gold border-gold/30">Pending</span>
            <span className="chip">{booking.serviceCategory}</span>
            {booking.budget && <span className="chip">Budget: {formatPrice(booking.budget)}</span>}
          </div>
          <div className="font-display text-2xl mb-1">{booking.eventName ?? booking.serviceName}</div>
          <div className="text-sm text-ink-dim">
            {booking.customerName}
            {booking.customerPhone && ` · ${booking.customerPhone}`}
            {booking.customerEmail && ` · ${booking.customerEmail}`}
          </div>
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-ink-dim">
            <span className="flex items-center gap-1"><Calendar size={12} className="text-gold" />{formatDateLong(new Date(booking.date))}</span>
            <span className="flex items-center gap-1"><Clock size={12} className="text-gold" />{booking.timeSlot} · {booking.serviceDuration} min</span>
            {booking.address && <span className="flex items-center gap-1"><MapPin size={12} className="text-gold" />{booking.address}</span>}
          </div>
          {booking.notes && <div className="text-sm text-ink-dim mt-3 italic">&ldquo;{booking.notes}&rdquo;</div>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="font-display text-2xl text-gradient-rose">{formatPrice(booking.totalPrice)}</div>
        </div>
      </div>

      {mode === "rejecting" ? (
        <div className="mt-5 pt-5 border-t border-border">
          <label className="block mb-3">
            <span className="text-xs uppercase tracking-widest text-ink-dim mb-2 block">Reason for rejection</span>
            <textarea
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="Unavailable on this date / booked / location out of range…"
              className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-gold/50 outline-none resize-none text-sm"
            />
          </label>
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setMode("idle"); setReason(""); }} className="btn-ghost text-xs py-2 px-3">Cancel</button>
            <button
              onClick={() => act("reject")}
              disabled={!reason.trim()}
              className="btn-ghost text-xs py-2 px-3 text-rose border-rose/40 hover:bg-rose/10 disabled:opacity-50"
            >
              Send rejection
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-5 pt-5 border-t border-border flex items-center justify-between gap-3">
          {error ? <span className="text-xs text-rose">{error}</span> : <span />}
          <div className="flex gap-2">
            <button
              onClick={() => setMode("rejecting")}
              disabled={mode === "loading"}
              className="btn-ghost text-sm py-2 px-4 text-rose border-rose/30 hover:bg-rose/10 disabled:opacity-50"
            >
              Reject
            </button>
            <button
              onClick={() => act("accept")}
              disabled={mode === "loading"}
              className="btn-primary text-sm py-2 px-5 disabled:opacity-50"
            >
              {mode === "loading" ? <Loader2 className="animate-spin" size={14} /> : <><Check size={14} /> Accept</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Bookings (non-pending)
// ============================================================
function BookingsTab({ bookings }: { bookings: Booking[] }) {
  const [filter, setFilter] = useState<"all" | "accepted" | "completed" | "cancelled" | "rejected">("accepted");
  const filtered = bookings.filter((b) => filter === "all" || b.status === filter);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", "accepted", "completed", "cancelled", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm capitalize ${
              filter === f ? "bg-gradient-to-r from-gold-bright to-gold-deep text-wine-deep font-medium" : "bg-surface border border-border text-ink-dim hover:text-ink"
            }`}
          >
            {f} ({f === "all" ? bookings.length : bookings.filter((b) => b.status === f).length})
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-3xl text-ink-dim">
          No {filter} bookings.
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((b) => (
            <div key={b.id} className="glass rounded-2xl p-5 grid lg:grid-cols-[1fr_auto] gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="chip">{b.serviceCategory}</span>
                  <StatusPill status={b.status} />
                </div>
                <div className="font-semibold text-lg">{b.eventName ?? b.serviceName}</div>
                <div className="text-sm text-ink-dim mt-0.5">{b.customerName}{b.customerPhone ? ` · ${b.customerPhone}` : ""}</div>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-ink-dim">
                  <span className="flex items-center gap-1"><Calendar size={12} className="text-gold" />{formatDateLong(new Date(b.date))}</span>
                  <span className="flex items-center gap-1"><Clock size={12} className="text-gold" />{b.timeSlot} · {b.serviceDuration} min</span>
                  {b.address && <span className="flex items-center gap-1"><MapPin size={12} className="text-gold" />{b.address}</span>}
                </div>
                {b.rejectionReason && <div className="text-xs text-rose mt-2 italic">Rejection reason: {b.rejectionReason}</div>}
              </div>
              <div className="text-right">
                <div className="font-display text-2xl text-gradient-rose">{formatPrice(b.totalPrice)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "text-gold border-gold/30",
    accepted: "text-emerald border-emerald/30",
    completed: "text-emerald border-emerald/30",
    cancelled: "text-rose border-rose/30",
    rejected: "text-rose border-rose/30",
  };
  return <span className={`chip capitalize ${map[status] ?? ""}`}>{status}</span>;
}

// ============================================================
// Calendar (with schedule event + block date)
// ============================================================
function CalendarTab({ availability, blockedDates, events }: {
  availability: AvailabilityInput; blockedDates: BlockedDate[]; events: ArtistEvent[];
}) {
  const [showSchedule, setShowSchedule] = useState(false);
  const [showBlock, setShowBlock] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h2 className="font-display text-3xl">Your calendar</h2>
          <p className="text-ink-dim text-sm mt-1">Schedule personal bookings or block dates so they&apos;re flagged as red on your public profile.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSchedule(true)} className="btn-primary">
            <CalendarPlus size={14} /> Schedule event
          </button>
          <button onClick={() => setShowBlock(true)} className="btn-ghost">
            <CalendarX size={14} /> Block date
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-5">
        <div className="glass rounded-3xl p-6">
          <AvailabilityCalendar availability={availability} />
        </div>
        <div className="space-y-5">
          <ListCard title="Scheduled events" empty="No personal events scheduled." >
            {events.map((e) => <EventRow key={e.id} event={e} />)}
          </ListCard>
          <ListCard title="Blocked dates" empty="No dates blocked yet.">
            {blockedDates.map((b) => <BlockRow key={b.id} block={b} />)}
          </ListCard>
        </div>
      </div>

      {showSchedule && <ScheduleEventModal onClose={() => setShowSchedule(false)} />}
      {showBlock && <BlockDateModal onClose={() => setShowBlock(false)} />}
    </motion.div>
  );
}

function ListCard({ title, children, empty }: { title: string; children: React.ReactNode; empty: string }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : !!children;
  return (
    <div className="glass rounded-3xl p-5">
      <div className="text-xs uppercase tracking-widest text-gold mb-3">{title}</div>
      {hasChildren ? <div className="space-y-2">{children}</div> : <div className="text-sm text-ink-dim py-4 text-center">{empty}</div>}
    </div>
  );
}

function EventRow({ event }: { event: ArtistEvent }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function remove() {
    if (!confirm("Delete this scheduled event?")) return;
    setLoading(true);
    await fetch(`/api/artist-events/${event.id}`, { method: "DELETE" });
    router.refresh();
  }
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-surface/60 border border-border">
      <div className="min-w-0">
        <div className="font-medium text-sm truncate">{event.eventName}</div>
        <div className="text-xs text-ink-dim">
          {format(new Date(event.eventDate + "T00:00:00"), "d MMM yyyy")} · {event.startTime}–{event.endTime}
          {event.location ? ` · ${event.location}` : ""}
        </div>
      </div>
      <button onClick={remove} disabled={loading} className="text-rose hover:opacity-70 p-1">
        {loading ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
      </button>
    </div>
  );
}

function BlockRow({ block }: { block: BlockedDate }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function remove() {
    setLoading(true);
    await fetch(`/api/blocked-dates/${block.id}`, { method: "DELETE" });
    router.refresh();
  }
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-surface/60 border border-border">
      <div>
        <div className="font-medium text-sm">{format(new Date(block.blockedDate + "T00:00:00"), "d MMM yyyy")}</div>
        {block.reason && <div className="text-xs text-ink-dim">{block.reason}</div>}
      </div>
      <button onClick={remove} disabled={loading} className="text-rose hover:opacity-70 text-xs">
        {loading ? <Loader2 className="animate-spin" size={14} /> : "Unblock"}
      </button>
    </div>
  );
}

function ScheduleEventModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    eventDate: isoDay(new Date()),
    startTime: "10:00",
    endTime: "15:00",
    eventPeriod: "Morning",
    eventName: "",
    location: "",
    customerName: "",
    customerPhone: "",
    notes: "",
  });
  async function save() {
    setLoading(true); setError(null);
    const res = await fetch("/api/artist-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await res.json();
    if (!res.ok) { setError(d.error || "Failed"); setLoading(false); return; }
    router.refresh();
    onClose();
  }
  return <Modal title="Schedule event" onClose={onClose}>
    <div className="space-y-3">
      <Grid>
        <ModalField label="Date"><input type="date" value={form.eventDate} onChange={(e) => setForm({...form, eventDate: e.target.value})} className="dash-input" /></ModalField>
        <ModalField label="Period"><select value={form.eventPeriod} onChange={(e) => setForm({...form, eventPeriod: e.target.value})} className="dash-input"><option>Morning</option><option>Afternoon</option><option>Evening</option></select></ModalField>
      </Grid>
      <Grid>
        <ModalField label="Start time"><input type="time" value={form.startTime} onChange={(e) => setForm({...form, startTime: e.target.value})} className="dash-input" /></ModalField>
        <ModalField label="End time"><input type="time" value={form.endTime} onChange={(e) => setForm({...form, endTime: e.target.value})} className="dash-input" /></ModalField>
      </Grid>
      <p className="text-[11px] text-ink-dim italic">Note: your selected slot will be fully blocked — include travel, setup, and buffer so you don&apos;t get overlapping bookings.</p>
      <ModalField label="Event name"><input value={form.eventName} onChange={(e) => setForm({...form, eventName: e.target.value})} placeholder="Haldi / Family makeup / Brand shoot" className="dash-input" /></ModalField>
      <ModalField label="Location"><input value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} className="dash-input" /></ModalField>
      <Grid>
        <ModalField label="Customer name"><input value={form.customerName} onChange={(e) => setForm({...form, customerName: e.target.value})} className="dash-input" /></ModalField>
        <ModalField label="Customer phone"><input value={form.customerPhone} onChange={(e) => setForm({...form, customerPhone: e.target.value})} className="dash-input" /></ModalField>
      </Grid>
      <ModalField label="Notes"><textarea rows={2} value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} className="dash-input resize-none" /></ModalField>
      {error && <div className="text-sm text-rose">{error}</div>}
    </div>
    <div className="mt-6 flex gap-3">
      <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
      <button onClick={save} disabled={loading || !form.eventName} className="btn-primary flex-1 disabled:opacity-50">
        {loading ? <Loader2 className="animate-spin" size={14} /> : <><Check size={14} />Schedule</>}
      </button>
    </div>
  </Modal>;
}

function BlockDateModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [blockedDate, setBlockedDate] = useState(isoDay(new Date()));
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function save() {
    setLoading(true); setError(null);
    const res = await fetch("/api/blocked-dates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockedDate, reason }),
    });
    const d = await res.json();
    if (!res.ok) { setError(d.error || "Failed"); setLoading(false); return; }
    router.refresh();
    onClose();
  }
  return <Modal title="Block date" onClose={onClose}>
    <div className="space-y-3">
      <ModalField label="Date to block"><input type="date" value={blockedDate} onChange={(e) => setBlockedDate(e.target.value)} className="dash-input" /></ModalField>
      <ModalField label="Reason (optional)"><input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Vacation, holiday, personal" className="dash-input" /></ModalField>
      {error && <div className="text-sm text-rose">{error}</div>}
    </div>
    <div className="mt-6 flex gap-3">
      <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
      <button onClick={save} disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
        {loading ? <Loader2 className="animate-spin" size={14} /> : <><Check size={14} />Block</>}
      </button>
    </div>
  </Modal>;
}

// ============================================================
// Services
// ============================================================
type ServicesSubTab = "menu" | "charges";

function ServicesTab({
  services: initialServices,
  additionalCharges: initialCharges,
  artistId,
}: {
  services: Service[];
  additionalCharges: AdditionalCharge[];
  artistId: string;
}) {
  const router = useRouter();
  const [sub, setSub] = useState<ServicesSubTab>("menu");
  const [services, setServices] = useState(initialServices);
  const [charges, setCharges] = useState(initialCharges);
  const [editingService, setEditingService] = useState<Service | "new" | null>(null);
  const [editingCharge, setEditingCharge] = useState<AdditionalCharge | "new" | null>(null);

  async function removeService(id: string) {
    if (!confirm("Remove this service?")) return;
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    setServices((s) => s.filter((x) => x.id !== id));
    router.refresh();
  }

  async function removeCharge(id: string) {
    if (!confirm("Remove this additional charge?")) return;
    await fetch(`/api/additional-charges/${id}`, { method: "DELETE" });
    setCharges((c) => c.filter((x) => x.id !== id));
    router.refresh();
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      {/* Sub-tab nav — Service Menu / Additional Charges */}
      <div className="flex items-center gap-2 mb-6 p-1 rounded-2xl border border-border bg-surface/40 w-fit">
        <SubTabButton active={sub === "menu"} onClick={() => setSub("menu")}>
          <Sparkles size={14} /> Service Menu
        </SubTabButton>
        <SubTabButton active={sub === "charges"} onClick={() => setSub("charges")}>
          <IndianRupee size={14} /> Additional Charges
          {charges.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-gold/20 text-gold">{charges.length}</span>
          )}
        </SubTabButton>
      </div>

      {sub === "menu" && (
        <>
          <div className="flex justify-between items-center mb-6">
            <p className="text-ink-dim text-sm">Services appear on your public profile for clients to book.</p>
            <button onClick={() => setEditingService("new")} className="btn-primary">
              <Plus size={16} /> Add service
            </button>
          </div>
          {services.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-border rounded-3xl">
              <p className="font-display text-2xl mb-2">No services yet</p>
              <button onClick={() => setEditingService("new")} className="btn-primary mt-2"><Plus size={14} />Add your first service</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {services.map((s) => (
                <ServiceCard
                  key={s.id}
                  service={s}
                  onEdit={() => setEditingService(s)}
                  onRemove={() => removeService(s.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {sub === "charges" && (
        <>
          <div className="flex justify-between items-center mb-6">
            <p className="text-ink-dim text-sm">
              Travel fees, early-morning, GST, special-occasion add-ons — anything that&rsquo;s priced separately from the menu.
            </p>
            <button onClick={() => setEditingCharge("new")} className="btn-primary">
              <Plus size={16} /> Add charge
            </button>
          </div>
          {charges.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-border rounded-3xl">
              <p className="font-display text-2xl mb-2">No additional charges yet</p>
              <p className="text-sm text-ink-dim mb-4">Helpful when an extra cost isn&rsquo;t baked into a service price.</p>
              <button onClick={() => setEditingCharge("new")} className="btn-primary"><Plus size={14} />Add your first charge</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {charges.map((c) => (
                <ChargeCard
                  key={c.id}
                  charge={c}
                  onEdit={() => setEditingCharge(c)}
                  onRemove={() => removeCharge(c.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {editingService !== null && (
        <ServiceEditor
          initial={editingService === "new" ? null : editingService}
          artistId={artistId}
          onClose={() => setEditingService(null)}
          onSaved={(s) => {
            setServices((list) => {
              const idx = list.findIndex((x) => x.id === s.id);
              if (idx >= 0) { const c = [...list]; c[idx] = s; return c; }
              return [...list, s];
            });
            setEditingService(null);
            router.refresh();
          }}
        />
      )}

      {editingCharge !== null && (
        <ChargeEditor
          initial={editingCharge === "new" ? null : editingCharge}
          artistId={artistId}
          onClose={() => setEditingCharge(null)}
          onSaved={(c) => {
            setCharges((list) => {
              const idx = list.findIndex((x) => x.id === c.id);
              if (idx >= 0) { const arr = [...list]; arr[idx] = c; return arr; }
              return [...list, c];
            });
            setEditingCharge(null);
            router.refresh();
          }}
        />
      )}
    </motion.div>
  );
}

function SubTabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
        active
          ? "bg-gradient-to-br from-gold/20 to-gold/5 text-ink border border-gold/30"
          : "text-ink-dim hover:text-ink border border-transparent"
      }`}
    >
      {children}
    </button>
  );
}

function ServiceCard({ service: s, onEdit, onRemove }: { service: Service; onEdit: () => void; onRemove: () => void }) {
  const inclusions = s.inclusions.split("\n").map((x) => x.trim()).filter(Boolean);
  const exclusions = s.exclusions.split("\n").map((x) => x.trim()).filter(Boolean);
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-gold mb-1">{s.category}</div>
          <div className="font-semibold text-lg">{s.name}</div>
        </div>
        <div className="font-display text-xl text-gradient-rose">{formatPrice(s.price)}</div>
      </div>
      {(inclusions.length > 0 || exclusions.length > 0) ? (
        <div className="space-y-1.5 mb-4">
          {inclusions.map((it, i) => (
            <div key={`+${i}`} className="flex items-start gap-2 text-sm">
              <span className="text-emerald shrink-0 font-semibold leading-5">+</span>
              <span className="text-ink-dim">{it}</span>
            </div>
          ))}
          {exclusions.map((it, i) => (
            <div key={`-${i}`} className="flex items-start gap-2 text-sm">
              <span className="text-rose shrink-0 font-semibold leading-5">−</span>
              <span className="text-ink-dim">{it}</span>
            </div>
          ))}
        </div>
      ) : (
        s.description && <p className="text-sm text-ink-dim leading-relaxed mb-4">{s.description}</p>
      )}
      <div className="text-xs text-ink-dim flex items-center gap-3 mb-4">
        <span className="flex items-center gap-1"><Clock size={11} className="text-gold" /> {s.duration} min</span>
      </div>
      <div className="flex gap-2">
        <button onClick={onEdit} className="btn-ghost text-xs py-2 px-3"><Edit3 size={12} />Edit</button>
        <button onClick={onRemove} className="btn-ghost text-xs py-2 px-3 text-rose hover:border-rose/50"><Trash2 size={12} />Remove</button>
      </div>
    </div>
  );
}

function ChargeCard({ charge: c, onEdit, onRemove }: { charge: AdditionalCharge; onEdit: () => void; onRemove: () => void }) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="font-semibold text-lg flex-1">{c.name}</div>
      </div>
      {c.description && <p className="text-sm text-ink-dim leading-relaxed mb-4">{c.description}</p>}
      <div className="flex gap-2">
        <button onClick={onEdit} className="btn-ghost text-xs py-2 px-3"><Edit3 size={12} />Edit</button>
        <button onClick={onRemove} className="btn-ghost text-xs py-2 px-3 text-rose hover:border-rose/50"><Trash2 size={12} />Remove</button>
      </div>
    </div>
  );
}

function ServiceEditor({ initial, artistId, onClose, onSaved }: {
  initial: Service | null; artistId: string;
  onClose: () => void; onSaved: (s: Service) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  // Migrate legacy single description into the inclusions box if a new
  // record has none — so artists don't lose existing copy mid-rollout.
  const seededInclusions = initial?.inclusions || (initial?.description && !initial.exclusions ? initial.description : "");
  const [inclusions, setInclusions] = useState(seededInclusions ?? "");
  const [exclusions, setExclusions] = useState(initial?.exclusions ?? "");
  const [duration, setDuration] = useState(initial?.duration ?? 60);
  const [price, setPrice] = useState(initial?.price ?? 5000);
  const [category, setCategory] = useState(initial?.category ?? "Bridal");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const isEdit = !!initial;

  async function save() {
    setLoading(true); setErr(null);
    try {
      const res = await fetch(isEdit ? `/api/services/${initial!.id}` : "/api/services", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId,
          name,
          description: initial?.description ?? "", // preserved untouched on edit
          inclusions,
          exclusions,
          duration,
          price,
          category,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      onSaved(data.service);
    } catch (e) { setErr(e instanceof Error ? e.message : "Something went wrong"); }
    finally { setLoading(false); }
  }

  return <Modal title={isEdit ? "Edit service" : "New service"} onClose={onClose}>
    <div className="space-y-4">
      <ModalField label="Service name"><input value={name} onChange={(e) => setName(e.target.value)} className="dash-input" placeholder="e.g. Bridal Full Look" /></ModalField>
      <ModalField label="Category">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="dash-input">
          {["Bridal","Party & Glam","Editorial","His Look","Just the Hair","Family Makeup"].map((c) => <option key={c}>{c}</option>)}
        </select>
      </ModalField>

      <div>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-emerald mb-2 flex items-center gap-1.5">
            <span className="inline-block w-4 h-4 rounded-full bg-emerald/15 text-emerald text-center text-[11px] leading-4 font-semibold">+</span>
            Inclusions
          </span>
          <textarea
            value={inclusions}
            onChange={(e) => setInclusions(e.target.value)}
            rows={5}
            className="dash-input resize-none"
            placeholder={"One per line.\nFull-face HD makeup\nLashes + setting spray\n2 hours of touch-up"}
          />
        </label>
      </div>

      <div>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-rose mb-2 flex items-center gap-1.5">
            <span className="inline-block w-4 h-4 rounded-full bg-rose/15 text-rose text-center text-[11px] leading-4 font-semibold">−</span>
            Exclusions
          </span>
          <textarea
            value={exclusions}
            onChange={(e) => setExclusions(e.target.value)}
            rows={4}
            className="dash-input resize-none"
            placeholder={"One per line.\nHair styling (book separately)\nTravel beyond 15km"}
          />
        </label>
      </div>

      <Grid>
        <ModalField label="Duration (min)"><input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="dash-input" min={15} step={15} /></ModalField>
        <ModalField label="Price (₹)">
          <input
            // type=text + inputMode=numeric so iOS shows a numeric
            // keyboard while letting us format with Indian-style
            // commas and accept backspace cleanly. type=number on
            // mobile was eating commas + the seeded "5000" couldn't
            // be cleared by a single backspace.
            type="text"
            inputMode="numeric"
            value={price > 0 ? price.toLocaleString("en-IN") : ""}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, "");
              setPrice(raw === "" ? 0 : parseInt(raw, 10));
            }}
            className="dash-input"
            placeholder="5,000"
          />
        </ModalField>
      </Grid>
      {err && <div className="text-sm text-rose bg-rose/10 border border-rose/30 rounded-xl px-4 py-3">{err}</div>}
    </div>
    <div className="mt-6 flex gap-3">
      <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
      <button onClick={save} disabled={loading || !name} className="btn-primary flex-1 disabled:opacity-50">
        {loading ? <Loader2 className="animate-spin" size={16} /> : <><Check size={14} />{isEdit ? "Save" : "Create"}</>}
      </button>
    </div>
  </Modal>;
}

function ChargeEditor({ initial, artistId, onClose, onSaved }: {
  initial: AdditionalCharge | null; artistId: string;
  onClose: () => void; onSaved: (c: AdditionalCharge) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const isEdit = !!initial;

  async function save() {
    setLoading(true); setErr(null);
    try {
      const res = await fetch(isEdit ? `/api/additional-charges/${initial!.id}` : "/api/additional-charges", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistId, name, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      onSaved(data.charge);
    } catch (e) { setErr(e instanceof Error ? e.message : "Something went wrong"); }
    finally { setLoading(false); }
  }

  return <Modal title={isEdit ? "Edit additional charge" : "New additional charge"} onClose={onClose}>
    <div className="space-y-4">
      <ModalField label="Charge name">
        <input value={name} onChange={(e) => setName(e.target.value)} className="dash-input" placeholder="e.g. Travel beyond 15km" />
      </ModalField>
      <ModalField label="Description">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="dash-input resize-none"
          placeholder="What it covers, when it applies, how it's calculated."
        />
      </ModalField>
      {err && <div className="text-sm text-rose bg-rose/10 border border-rose/30 rounded-xl px-4 py-3">{err}</div>}
    </div>
    <div className="mt-6 flex gap-3">
      <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
      <button onClick={save} disabled={loading || !name} className="btn-primary flex-1 disabled:opacity-50">
        {loading ? <Loader2 className="animate-spin" size={16} /> : <><Check size={14} />{isEdit ? "Save" : "Create"}</>}
      </button>
    </div>
  </Modal>;
}

// ============================================================
// Portfolio
// ============================================================
function PortfolioTab({ portfolio: initial, artistId, userId }: {
  portfolio: PortfolioItem[]; artistId: string; userId: string;
}) {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState(initial);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    if (!imageUrl) return;
    setAdding(true); setError(null);
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistId, imageUrl, caption, order: portfolio.length }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add");
      setPortfolio((p) => [...p, data.item]);
      setImageUrl(null);
      setCaption("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setAdding(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Remove this image?")) return;
    await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
    setPortfolio((p) => p.filter((x) => x.id !== id));
    router.refresh();
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="glass rounded-3xl p-6 lg:p-8 mb-8">
        <div className="mb-5">
          <h3 className="font-display text-2xl">Add portfolio image</h3>
          <p className="text-sm text-ink-dim mt-0.5">Drag in a photo, browse your device, or paste a hosted URL.</p>
        </div>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
          <ImagePicker
            bucket="portfolio"
            folder={userId}
            value={imageUrl}
            onChange={setImageUrl}
            aspect="portrait"
            helper="Tall (4:5) photos look best in your gallery."
          />
          <div className="space-y-4">
            <ModalField label="Caption (optional)">
              <input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. Bridal — sangeet evening"
                className="dash-input"
              />
            </ModalField>
            <button
              onClick={add}
              disabled={!imageUrl || adding}
              className="btn-primary w-full disabled:opacity-50"
            >
              {adding ? <Loader2 className="animate-spin" size={14} /> : <><Plus size={14} />Add to gallery</>}
            </button>
            {!imageUrl && (
              <p className="text-[11px] text-ink-dim italic text-center">
                Pick or paste an image to enable.
              </p>
            )}
            {error && <p className="text-xs text-rose">{error}</p>}
          </div>
        </div>
      </div>

      {portfolio.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-3xl">
          <p className="font-display text-2xl mb-2">Your portfolio is empty</p>
          <p className="text-sm text-ink-dim">Add 5+ images so clients can see your range.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {portfolio.map((p) => (
            <div key={p.id} className="group relative aspect-[4/5] rounded-2xl overflow-hidden border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <button onClick={() => remove(p.id)} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-rose/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ============================================================
// Profile — sub-sections
// ============================================================
type ProfileSection = "basic" | "professional" | "payments" | "cancellation" | "agreement";

function ProfileTab({ artist, userId }: { artist: Artist; userId: string }) {
  const router = useRouter();
  const [section, setSection] = useState<ProfileSection>("basic");
  const [form, setForm] = useState(artist);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Local slot state for the 5 Cosmetic Brands inputs. We track each
  // box independently so the artist can leave empty boxes between
  // filled ones, type spaces freely, and not have focus jump to a
  // different slot mid-edit. form.cosmeticBrands stays in sync as the
  // trimmed comma-joined string that the API expects.
  const [brandSlots, setBrandSlots] = useState<string[]>(() =>
    seedBrandSlots(artist.cosmeticBrands),
  );
  function setBrandAt(i: number, value: string) {
    setBrandSlots((prev) => {
      const next = [...prev];
      next[i] = value;
      const joined = next.map((b) => b.trim()).filter(Boolean).join(", ");
      setForm((f) => ({ ...f, cosmeticBrands: joined }));
      return next;
    });
  }

  async function save() {
    setLoading(true);
    await fetch("/api/artist", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    router.refresh();
  }

  const sections: { id: ProfileSection; label: string; icon: typeof Settings }[] = [
    { id: "basic", label: "Basic information", icon: Users },
    { id: "professional", label: "Professional details", icon: BadgeCheck },
    { id: "payments", label: "Payments & settlement", icon: IndianRupee },
    { id: "cancellation", label: "Cancellation policy", icon: CalendarX },
    { id: "agreement", label: "Declaration & agreement", icon: FileSignature },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="grid lg:grid-cols-[240px_1fr] gap-6">
        <div className="glass rounded-3xl p-3 h-fit sticky top-24">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-sm transition-colors text-left ${
                section === s.id ? "bg-gradient-to-r from-gold/15 to-transparent text-ink" : "text-ink-dim hover:text-ink"
              }`}
            >
              <s.icon size={15} className={section === s.id ? "text-gold" : ""} />
              <span className="flex-1">{s.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-5">
          {section === "basic" && (
            <>
              <SectionHead title="Basic information" subtitle="How customers see you at a glance." />
              <FieldCard title="Identity" icon={Users}>
                <Grid>
                  <ModalField label="Artist name">
                    <input value={form.displayName} onChange={(e) => setForm({...form, displayName: e.target.value})} className="dash-input" />
                  </ModalField>
                  <ModalField label="Studio name">
                    <input value={form.studioName} onChange={(e) => setForm({...form, studioName: e.target.value})} className="dash-input" placeholder="The studio / brand you work under" />
                  </ModalField>
                </Grid>
                <ModalField label="Tagline">
                  <input value={form.tagline} onChange={(e) => setForm({...form, tagline: e.target.value})} className="dash-input" placeholder="One line that captures your style" />
                </ModalField>
              </FieldCard>

              <FieldCard title="About you" icon={MessageSquare}>
                <ModalField label="Tell your story">
                  <textarea rows={5} value={form.bio} onChange={(e) => setForm({...form, bio: e.target.value})} className="dash-input resize-none" placeholder="Where you trained, the looks you specialise in, who you love to work with…" />
                </ModalField>
              </FieldCard>

              <FieldCard title="Where & how you work" icon={MapPin}>
                <Grid>
                  <ModalField label="City"><input value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} className="dash-input" /></ModalField>
                  <ModalField label="Area"><input value={form.area} onChange={(e) => setForm({...form, area: e.target.value})} className="dash-input" /></ModalField>
                </Grid>
                <ModalField label="Service mode">
                  <RadioPills
                    value={form.serviceMode}
                    onChange={(v) => setForm({ ...form, serviceMode: v })}
                    options={[
                      { value: "studio", label: "At Studio" },
                      { value: "client", label: "At Client's location" },
                      { value: "both", label: "At Studio & Client's location" },
                    ]}
                  />
                </ModalField>
              </FieldCard>

              <FieldCard title="Online presence" icon={Instagram}>
                <ModalField label="Instagram handle (without @)">
                  <input value={form.instagram ?? ""} onChange={(e) => setForm({...form, instagram: e.target.value})} className="dash-input" placeholder="yourname" />
                </ModalField>
              </FieldCard>

              <FieldCard title="Brand visuals" icon={ImageIcon}>
                <p className="text-xs text-ink-dim -mt-1 mb-1">Avatar shows on cards across the platform. <strong>Cover</strong> is your hero shot — this is exactly what shows up on the Discover card and the top of your public profile, so what you crop here is what visitors see.</p>
                <div className="grid md:grid-cols-2 gap-5">
                  <ImagePicker
                    bucket="avatars"
                    folder={userId}
                    value={form.avatarUrl}
                    onChange={(url) => setForm({...form, avatarUrl: url ?? ""})}
                    aspect="square"
                    label="Avatar (profile picture)"
                  />
                  <ImagePicker
                    bucket="avatars"
                    folder={userId}
                    value={form.coverUrl}
                    onChange={(url) => setForm({...form, coverUrl: url ?? ""})}
                    // Sheet 12-Jun #8: previously "wide" (16:9) which
                    // mismatched the homepage Discover card (5:6
                    // portrait). Now "portrait" so the upload aspect
                    // matches what visitors see on the card; the
                    // profile-page banner still centres it in the wide
                    // hero via object-cover.
                    aspect="portrait"
                    label="Cover image"
                  />
                </div>
              </FieldCard>
            </>
          )}

          {section === "professional" && (
            <>
              <SectionHead title="Professional details" subtitle="Help clients trust your craft." />

              <FieldCard title="Artist type" icon={Users}>
                <RadioPills
                  value={form.artistType}
                  onChange={(v) => setForm({ ...form, artistType: v })}
                  options={[
                    { value: "solo", label: "Solo Artist" },
                    { value: "team", label: "Artist with a team" },
                  ]}
                />
              </FieldCard>

              <FieldCard title="Skills" icon={Sparkles}>
                <Grid>
                  <ModalField label="Specialties (comma-sep.)">
                    <input value={form.specialties} onChange={(e) => setForm({...form, specialties: e.target.value})} className="dash-input" placeholder="Bridal, Editorial, HD Makeup" />
                  </ModalField>
                  <ModalField label="Years of experience">
                    <input type="number" value={form.yearsExp} onChange={(e) => setForm({...form, yearsExp: Number(e.target.value)})} className="dash-input" min={0} />
                  </ModalField>
                </Grid>
              </FieldCard>

              <FieldCard title="Skin tone expertise" icon={Palette}>
                <p className="text-xs text-ink-dim -mt-1">
                  Pick every tone you&apos;ve worked with — clients use this to find the right match.
                </p>
                <SkinToneSelect
                  value={form.skinToneExpertise}
                  onChange={(v) => setForm({ ...form, skinToneExpertise: v })}
                />
              </FieldCard>

              <FieldCard title="Experience" icon={Award}>
                <ModalField label="Summary">
                  <textarea rows={4} value={form.experienceSummary} onChange={(e) => setForm({...form, experienceSummary: e.target.value})} placeholder="Training, notable clients, awards…" className="dash-input resize-none" />
                </ModalField>
              </FieldCard>

              <FieldCard title="Capacity & reach" icon={Compass}>
                <Grid>
                  <ModalField label="Maximum bookings per day">
                    <input type="number" value={form.maxBookingsPerDay} onChange={(e) => setForm({...form, maxBookingsPerDay: Number(e.target.value)})} className="dash-input" min={1} max={20} />
                  </ModalField>
                  <ModalField label="Travel radius (km)">
                    <input type="number" value={form.travelRadiusKm} onChange={(e) => setForm({...form, travelRadiusKm: Number(e.target.value)})} className="dash-input" min={0} />
                  </ModalField>
                </Grid>
              </FieldCard>

              <FieldCard title="Cosmetic brands used" icon={Sparkles}>
                <p className="text-xs text-ink-dim -mt-1">Up to 5 brands you regularly work with — clients use this to gauge product compatibility.</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {brandSlots.map((b, i) => (
                    <input
                      key={i}
                      value={b}
                      onChange={(e) => setBrandAt(i, e.target.value)}
                      className="dash-input"
                      placeholder={`Brand ${i + 1}`}
                    />
                  ))}
                </div>
              </FieldCard>

              <FieldCard title="Outstation booking" icon={Compass}>
                <ToggleRow
                  label="Available for outstation bookings?"
                  value={form.outstationAvailable}
                  onChange={(v) => setForm({ ...form, outstationAvailable: v })}
                />
                {form.outstationAvailable && (
                  <ModalField label="Outstation conditions (3-5 points clients should know)">
                    <textarea
                      rows={6}
                      value={form.outstationConditions}
                      onChange={(e) => setForm({...form, outstationConditions: e.target.value})}
                      placeholder={"e.g.\n• Minimum 2-day notice\n• Travel & lodging at client's expense\n• Day-rate ₹X for full-day shoots\n• Extra hands for travel-day commute\n• Final settlement before departure"}
                      className="dash-input resize-none"
                    />
                  </ModalField>
                )}
              </FieldCard>

              <FieldCard title="Skin sensitivities" icon={Award}>
                <ToggleRow
                  label="Experience working on acne / other skin conditions?"
                  value={form.acneExperience}
                  onChange={(v) => setForm({ ...form, acneExperience: v })}
                />
                {form.acneExperience && (
                  <ModalField label="Details (optional — not mandatory to fill)">
                    <textarea
                      rows={4}
                      value={form.acneExperienceDetails}
                      onChange={(e) => setForm({...form, acneExperienceDetails: e.target.value})}
                      placeholder="What conditions you've worked with and how you adapt — patch tests, hypo-allergenic product lines, etc."
                      className="dash-input resize-none"
                    />
                  </ModalField>
                )}
              </FieldCard>
            </>
          )}

          {section === "payments" && (
            <>
              <SectionHead
                title="Payments & settlement"
                subtitle="Roop doesn't process payments — clients pay you directly. Share only what helps them plan."
              />

              <FieldCard title="Payment structure" icon={IndianRupee}>
                <ModalField label="Advance : Final settlement ratio">
                  <input
                    value={form.paymentStructure}
                    onChange={(e) => setForm({...form, paymentStructure: e.target.value})}
                    className="dash-input"
                    placeholder="e.g. 50:50 or 30% advance + 70% on the event day"
                  />
                </ModalField>
              </FieldCard>

              <FieldCard title="Accepted modes of payment" icon={Wallet}>
                <ModalField label="How clients can pay you">
                  <input
                    value={form.paymentModes}
                    onChange={(e) => setForm({...form, paymentModes: e.target.value})}
                    className="dash-input"
                    placeholder="UPI, Cash, Bank transfer"
                  />
                </ModalField>
              </FieldCard>

              <FieldCard title="Invoice availability" icon={FileSignature}>
                <ToggleRow
                  label="Do you provide an invoice or receipt?"
                  value={form.invoiceAvailable}
                  onChange={(v) => setForm({ ...form, invoiceAvailable: v })}
                />
              </FieldCard>

              <FieldCard title="Additional notes" icon={MessageSquare}>
                <ModalField label="Anything else clients should know about payments">
                  <textarea
                    rows={4}
                    value={form.paymentNotes}
                    onChange={(e) => setForm({...form, paymentNotes: e.target.value})}
                    className="dash-input resize-none"
                    placeholder="GST registration, refund timelines, security deposits, etc."
                  />
                </ModalField>
              </FieldCard>
            </>
          )}

          {section === "cancellation" && (
            <>
              <SectionHead title="Cancellation policy" subtitle="What happens if a client cancels? State it clearly." />
              <FieldCard title="Your policy" icon={CalendarX}>
                <ModalField label="Spell out the rules — clients see this before booking">
                  <textarea
                    rows={8}
                    value={form.cancellationPolicy}
                    onChange={(e) => setForm({...form, cancellationPolicy: e.target.value})}
                    placeholder={"e.g.\n• Free cancellation up to 7 days before the event\n• 50% charge within 7 days\n• No refund within 48 hours"}
                    className="dash-input resize-none"
                  />
                </ModalField>
              </FieldCard>
            </>
          )}

          {section === "agreement" && (
            <>
              <SectionHead title="Declaration & agreement" subtitle="Confirm you understand Roop's terms before taking bookings." />
              <FieldCard title="Terms" icon={FileSignature}>
                <div className="text-sm text-ink-dim leading-relaxed space-y-2">
                  <p>By checking below you confirm:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>You are the account holder and all work shown is original or licensed.</li>
                    <li>You will honour bookings accepted via Roop and communicate delays promptly.</li>
                    <li>You agree to the ₹699/month listing fee and Roop&apos;s content / behaviour guidelines.</li>
                    <li>You understand payments are settled directly by the customer; Roop is not a payment gateway for event fees.</li>
                  </ul>
                </div>
                <label className="flex items-center gap-3 p-4 border border-border rounded-2xl cursor-pointer hover:border-gold/40 mt-2">
                  <input type="checkbox" checked={form.agreedToTerms} onChange={(e) => setForm({...form, agreedToTerms: e.target.checked})} className="w-5 h-5 accent-gold" />
                  <span className="text-sm">I agree to the above terms.</span>
                </label>
              </FieldCard>
            </>
          )}

          <div className="pt-2">
            <button onClick={save} disabled={loading} className="btn-primary">
              {loading ? <Loader2 className="animate-spin" size={14} /> : saved ? <><Check size={14} />Saved</> : <><Check size={14} />Save changes</>}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SectionHead({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h3 className="font-display text-2xl">{title}</h3>
      <p className="text-sm text-ink-dim mt-1">{subtitle}</p>
    </div>
  );
}

function FieldCard({ title, icon: Icon, children }: {
  title: string;
  icon?: typeof Settings;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-3xl p-5 lg:p-6 space-y-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold">
        {Icon && <Icon size={13} />}
        {title}
      </div>
      {children}
    </div>
  );
}

// Pill-style single-select used for "Service mode" and "Artist type".
function RadioPills<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string; hint?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={`px-4 py-2.5 rounded-full text-sm transition-all border ${
              active
                ? "border-gold bg-gradient-to-br from-gold/25 via-gold/5 to-transparent text-ink"
                : "border-border bg-surface/40 text-ink-dim hover:border-gold/40 hover:text-ink"
            }`}
            title={opt.hint}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// Yes/No toggle row — keyboard-accessible switch with a label on the left.
function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 border border-border rounded-2xl">
      <span className="text-sm flex-1">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${
          value ? "bg-gradient-to-r from-gold to-amber" : "bg-surface-2"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
            value ? "translate-x-6" : ""
          }`}
        />
      </button>
    </div>
  );
}

// Seed the 5 cosmetic-brand input slots from the saved comma-sep
// string. Used once on mount — after that, slot state is owned by the
// ProfileTab so empty boxes between filled ones stay where the artist
// left them and typing spaces doesn't trim mid-keystroke.
function seedBrandSlots(raw: string): string[] {
  const arr = raw
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean);
  while (arr.length < 5) arr.push("");
  return arr.slice(0, 5);
}

// Multi-select chip toggle for skin tone expertise. Stored as comma-separated tags.
function SkinToneSelect({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const selected = new Set(
    value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );

  function toggle(tone: string) {
    const next = new Set(selected);
    if (next.has(tone)) next.delete(tone);
    else next.add(tone);
    onChange(Array.from(next).join(", "));
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {SKIN_TONE_OPTIONS.map((opt) => {
        const active = selected.has(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            aria-pressed={active}
            className={`flex flex-col items-start gap-1 p-3 lg:p-4 rounded-2xl border text-left transition-all ${
              active
                ? "border-gold bg-gradient-to-br from-gold/20 via-gold/5 to-transparent shadow-sm"
                : "border-border bg-surface/40 hover:border-gold/40"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-medium">{opt.value}</span>
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                  active ? "bg-gradient-to-br from-gold to-amber border-gold text-wine-deep" : "border-border-strong text-transparent"
                }`}
              >
                <Check size={11} strokeWidth={3} />
              </span>
            </div>
            <span className="text-[11px] text-ink-dim">{opt.description}</span>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// Payments
// ============================================================
function PaymentsTab({ subscriptions, artistId }: { subscriptions: Subscription[]; artistId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute current month and whether it's paid
  const thisMonth = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  }, []);
  const paidThisMonth = subscriptions.find((s) => s.periodMonth.startsWith(thisMonth.slice(0, 7)) && s.status === "paid");

  async function pay() {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodMonth: thisMonth }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      const w = window as unknown as { Razorpay?: new (opts: Record<string, unknown>) => { open: () => void } };
      if (!w.Razorpay) {
        const s = document.createElement("script");
        s.src = "https://checkout.razorpay.com/v1/checkout.js";
        document.body.appendChild(s);
        await new Promise((r) => { s.onload = r; });
      }

      const rz = new (window as unknown as { Razorpay: new (o: Record<string, unknown>) => { open: () => void } }).Razorpay({
        key: data.keyId,
        order_id: data.orderId,
        amount: data.amount,
        currency: "INR",
        name: "Roop",
        description: "Monthly listing fee",
        handler: async (resp: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          await fetch("/api/subscriptions/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subscriptionId: data.subscriptionId,
              paymentId: resp.razorpay_payment_id,
              orderId: resp.razorpay_order_id,
              signature: resp.razorpay_signature,
            }),
          });
          router.refresh();
        },
        theme: { color: "#C9A97E" },
      });
      rz.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-5">
        <div className="glass rounded-3xl p-6 lg:p-8">
          <div className="text-xs uppercase tracking-widest text-gold mb-3">This month</div>
          <div className="font-display text-5xl mb-2">₹699</div>
          <p className="text-sm text-ink-dim mb-6">Listing fee keeps your profile live and bookable for the month.</p>
          {paidThisMonth ? (
            <div className="inline-flex items-center gap-2 chip text-emerald border-emerald/30">
              <Check size={12} /> Paid · {paidThisMonth.paidAt ? format(new Date(paidThisMonth.paidAt), "d MMM yyyy") : ""}
            </div>
          ) : (
            <button onClick={pay} disabled={loading} className="btn-primary disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" size={14} /> : <><CreditCard size={14} /> Pay ₹699</>}
            </button>
          )}
          {error && <div className="text-sm text-rose mt-3">{error}</div>}
        </div>

        <div className="glass rounded-3xl p-6 lg:p-8">
          <div className="text-xs uppercase tracking-widest text-gold mb-3">History</div>
          {subscriptions.length === 0 ? (
            <div className="text-sm text-ink-dim py-4">No past payments.</div>
          ) : (
            <div className="space-y-2">
              {subscriptions.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-surface/60 border border-border text-sm">
                  <div>
                    <div className="font-medium">{format(new Date(s.periodMonth), "MMMM yyyy")}</div>
                    <div className="text-xs text-ink-dim">{formatPrice(s.amount)}</div>
                  </div>
                  <StatusPill status={s.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// Shared modal + form primitives
// ============================================================
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-bg/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-strong rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-3xl">{title}</h3>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center"><X size={16} /></button>
          </div>
          {children}
          <style jsx>{`
            :global(.dash-input) {
              width: 100%; padding: 0.75rem 1rem; border-radius: 0.85rem;
              background: rgba(245, 235, 224, 0.04);
              border: 1px solid var(--border-strong); color: var(--ink); outline: none; font-size: 0.95rem;
            }
            :global(.dash-input:focus) { border-color: var(--gold); }
          `}</style>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-ink-dim mb-2 block">{label}</span>
      {children}
    </label>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}
