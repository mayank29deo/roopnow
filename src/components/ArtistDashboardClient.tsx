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
  CreditCard, FileSignature, Phone, Mail,
} from "lucide-react";
import { formatPrice, formatDateLong } from "@/lib/utils";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import type { AvailabilityInput } from "@/lib/availability";
import { isoDay } from "@/lib/availability";
import { format } from "date-fns";

type Artist = {
  id: string; displayName: string; tagline: string; bio: string;
  city: string; area: string; avatarUrl: string; coverUrl: string;
  specialties: string; yearsExp: number; instagram: string | null;
  verified: boolean; featured: boolean; profileViews: number;
  experienceSummary: string; travelRadiusKm: number;
  upiId: string; bankAccountName: string; bankIfsc: string; bankAccountNo: string;
  cancellationPolicy: string; agreedToTerms: boolean;
};
type Booking = {
  id: string; date: string; timeSlot: string; status: string;
  totalPrice: number; notes: string | null; address: string | null;
  eventName: string | null; budget: number | null; rejectionReason: string | null;
  customerName: string; customerPhone: string | null; customerEmail: string | null;
  serviceName: string; serviceCategory: string; serviceDuration: number;
};
type Service = { id: string; name: string; description: string; duration: number; price: number; category: string };
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
  artist, bookings, services, portfolio, blockedDates, events, subscriptions,
  availability, earnings, avgRating, reviewCount, userName,
}: {
  artist: Artist; bookings: Booking[]; services: Service[]; portfolio: PortfolioItem[];
  blockedDates: BlockedDate[]; events: ArtistEvent[]; subscriptions: Subscription[];
  availability: AvailabilityInput;
  earnings: number; avgRating: number; reviewCount: number; userName: string;
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
          {tab === "services" && <ServicesTab key="services" services={services} artistId={artist.id} />}
          {tab === "portfolio" && <PortfolioTab key="portfolio" portfolio={portfolio} artistId={artist.id} />}
          {tab === "profile" && <ProfileTab key="profile" artist={artist} />}
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
function ServicesTab({ services: initial, artistId }: { services: Service[]; artistId: string }) {
  const router = useRouter();
  const [services, setServices] = useState(initial);
  const [editing, setEditing] = useState<Service | "new" | null>(null);

  async function remove(id: string) {
    if (!confirm("Remove this service?")) return;
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    setServices((s) => s.filter((x) => x.id !== id));
    router.refresh();
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="flex justify-between items-center mb-6">
        <p className="text-ink-dim text-sm">Services appear on your public profile for clients to book.</p>
        <button onClick={() => setEditing("new")} className="btn-primary">
          <Plus size={16} /> Add service
        </button>
      </div>
      {services.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-3xl">
          <p className="font-display text-2xl mb-2">No services yet</p>
          <button onClick={() => setEditing("new")} className="btn-primary mt-2"><Plus size={14} />Add your first service</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {services.map((s) => (
            <div key={s.id} className="glass rounded-2xl p-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-gold mb-1">{s.category}</div>
                  <div className="font-semibold text-lg">{s.name}</div>
                </div>
                <div className="font-display text-xl text-gradient-rose">{formatPrice(s.price)}</div>
              </div>
              <p className="text-sm text-ink-dim leading-relaxed mb-4">{s.description}</p>
              <div className="text-xs text-ink-dim flex items-center gap-3 mb-4">
                <span className="flex items-center gap-1"><Clock size={11} className="text-gold" /> {s.duration} min</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(s)} className="btn-ghost text-xs py-2 px-3"><Edit3 size={12} />Edit</button>
                <button onClick={() => remove(s.id)} className="btn-ghost text-xs py-2 px-3 text-rose hover:border-rose/50"><Trash2 size={12} />Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== null && (
        <ServiceEditor
          initial={editing === "new" ? null : editing}
          artistId={artistId}
          onClose={() => setEditing(null)}
          onSaved={(s) => {
            setServices((list) => {
              const idx = list.findIndex((x) => x.id === s.id);
              if (idx >= 0) { const c = [...list]; c[idx] = s; return c; }
              return [...list, s];
            });
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </motion.div>
  );
}

function ServiceEditor({ initial, artistId, onClose, onSaved }: {
  initial: Service | null; artistId: string;
  onClose: () => void; onSaved: (s: Service) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [desc, setDesc] = useState(initial?.description ?? "");
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
        body: JSON.stringify({ artistId, name, description: desc, duration, price, category }),
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
      <ModalField label="Category"><select value={category} onChange={(e) => setCategory(e.target.value)} className="dash-input">{["Bridal","Party & Glam","Editorial & HD","Men's Grooming","Hair & Style","SFX & Artistic"].map((c) => <option key={c}>{c}</option>)}</select></ModalField>
      <ModalField label="Description"><textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} className="dash-input resize-none" /></ModalField>
      <Grid>
        <ModalField label="Duration (min)"><input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="dash-input" min={15} step={15} /></ModalField>
        <ModalField label="Price (₹)"><input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="dash-input" min={500} step={100} /></ModalField>
      </Grid>
      {err && <div className="text-sm text-rose bg-rose/10 border border-rose/30 rounded-xl px-4 py-3">{err}</div>}
    </div>
    <div className="mt-6 flex gap-3">
      <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
      <button onClick={save} disabled={loading || !name || !desc} className="btn-primary flex-1 disabled:opacity-50">
        {loading ? <Loader2 className="animate-spin" size={16} /> : <><Check size={14} />{isEdit ? "Save" : "Create"}</>}
      </button>
    </div>
  </Modal>;
}

// ============================================================
// Portfolio
// ============================================================
function PortfolioTab({ portfolio: initial, artistId }: { portfolio: PortfolioItem[]; artistId: string }) {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState(initial);
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  async function add() {
    if (!url) return;
    setLoading(true);
    const res = await fetch("/api/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artistId, imageUrl: url, caption, order: portfolio.length }),
    });
    const data = await res.json();
    if (res.ok) {
      setPortfolio((p) => [...p, data.item]);
      setUrl(""); setCaption("");
      router.refresh();
    }
    setLoading(false);
  }

  async function remove(id: string) {
    if (!confirm("Remove this image?")) return;
    await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
    setPortfolio((p) => p.filter((x) => x.id !== id));
    router.refresh();
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="glass rounded-3xl p-6 mb-8">
        <h3 className="font-display text-2xl mb-4">Add portfolio image</h3>
        <div className="grid lg:grid-cols-[1fr_1fr_auto] gap-3">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Image URL" className="px-4 py-3 rounded-xl bg-surface border border-border focus:border-gold/50 outline-none" />
          <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Optional caption" className="px-4 py-3 rounded-xl bg-surface border border-border focus:border-gold/50 outline-none" />
          <button onClick={add} disabled={loading || !url} className="btn-primary disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={14} /> : <><Plus size={14} />Add</>}
          </button>
        </div>
      </div>

      {portfolio.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-3xl">
          <p className="font-display text-2xl mb-2">Your portfolio is empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {portfolio.map((p) => (
            <div key={p.id} className="group relative aspect-[4/5] rounded-2xl overflow-hidden border border-border">
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

function ProfileTab({ artist }: { artist: Artist }) {
  const router = useRouter();
  const [section, setSection] = useState<ProfileSection>("basic");
  const [form, setForm] = useState(artist);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

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

        <div className="glass rounded-3xl p-6 lg:p-8">
          {section === "basic" && (
            <div className="space-y-5">
              <SectionHead title="Basic information" subtitle="How customers see you at a glance." />
              <ModalField label="Display name"><input value={form.displayName} onChange={(e) => setForm({...form, displayName: e.target.value})} className="dash-input" /></ModalField>
              <ModalField label="Tagline"><input value={form.tagline} onChange={(e) => setForm({...form, tagline: e.target.value})} className="dash-input" /></ModalField>
              <ModalField label="About you"><textarea rows={5} value={form.bio} onChange={(e) => setForm({...form, bio: e.target.value})} className="dash-input resize-none" /></ModalField>
              <Grid>
                <ModalField label="City"><input value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} className="dash-input" /></ModalField>
                <ModalField label="Area"><input value={form.area} onChange={(e) => setForm({...form, area: e.target.value})} className="dash-input" /></ModalField>
              </Grid>
              <ModalField label="Instagram handle (without @)"><input value={form.instagram ?? ""} onChange={(e) => setForm({...form, instagram: e.target.value})} className="dash-input" placeholder="yourname" /></ModalField>
              <ModalField label="Avatar URL"><input value={form.avatarUrl} onChange={(e) => setForm({...form, avatarUrl: e.target.value})} className="dash-input" /></ModalField>
              <ModalField label="Cover image URL"><input value={form.coverUrl} onChange={(e) => setForm({...form, coverUrl: e.target.value})} className="dash-input" /></ModalField>
            </div>
          )}

          {section === "professional" && (
            <div className="space-y-5">
              <SectionHead title="Professional details" subtitle="Help clients trust your craft." />
              <Grid>
                <ModalField label="Specialties (comma-sep.)"><input value={form.specialties} onChange={(e) => setForm({...form, specialties: e.target.value})} className="dash-input" /></ModalField>
                <ModalField label="Years of experience"><input type="number" value={form.yearsExp} onChange={(e) => setForm({...form, yearsExp: Number(e.target.value)})} className="dash-input" min={0} /></ModalField>
              </Grid>
              <ModalField label="Experience summary"><textarea rows={4} value={form.experienceSummary} onChange={(e) => setForm({...form, experienceSummary: e.target.value})} placeholder="Training, notable clients, awards…" className="dash-input resize-none" /></ModalField>
              <ModalField label="Travel radius (km)"><input type="number" value={form.travelRadiusKm} onChange={(e) => setForm({...form, travelRadiusKm: Number(e.target.value)})} className="dash-input" min={0} /></ModalField>
            </div>
          )}

          {section === "payments" && (
            <div className="space-y-5">
              <SectionHead title="Payments & settlement" subtitle="Where we send your earnings. Only visible to you." />
              <ModalField label="UPI ID"><input value={form.upiId} onChange={(e) => setForm({...form, upiId: e.target.value})} placeholder="yourname@upi" className="dash-input" /></ModalField>
              <div className="h-px bg-border my-2" />
              <ModalField label="Bank account holder name"><input value={form.bankAccountName} onChange={(e) => setForm({...form, bankAccountName: e.target.value})} className="dash-input" /></ModalField>
              <Grid>
                <ModalField label="Bank account number"><input value={form.bankAccountNo} onChange={(e) => setForm({...form, bankAccountNo: e.target.value})} className="dash-input" /></ModalField>
                <ModalField label="IFSC"><input value={form.bankIfsc} onChange={(e) => setForm({...form, bankIfsc: e.target.value})} className="dash-input uppercase" /></ModalField>
              </Grid>
            </div>
          )}

          {section === "cancellation" && (
            <div className="space-y-5">
              <SectionHead title="Cancellation policy" subtitle="What happens if a client cancels? State it clearly." />
              <ModalField label="Your policy">
                <textarea
                  rows={8}
                  value={form.cancellationPolicy}
                  onChange={(e) => setForm({...form, cancellationPolicy: e.target.value})}
                  placeholder={"e.g. \n• Free cancellation up to 7 days before the event\n• 50% charge within 7 days\n• No refund within 48 hours"}
                  className="dash-input resize-none"
                />
              </ModalField>
            </div>
          )}

          {section === "agreement" && (
            <div className="space-y-5">
              <SectionHead title="Declaration & agreement" subtitle="Confirm you understand Roop's terms before taking bookings." />
              <div className="text-sm text-ink-dim leading-relaxed space-y-2 mb-4">
                <p>By checking below you confirm:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>You are the account holder and all work shown is original or licensed.</li>
                  <li>You will honour bookings accepted via Roop and communicate delays promptly.</li>
                  <li>You agree to the ₹699/month listing fee and Roop&apos;s content / behaviour guidelines.</li>
                  <li>You understand payments are settled directly by the customer; Roop is not a payment gateway for event fees.</li>
                </ul>
              </div>
              <label className="flex items-center gap-3 p-4 border border-border rounded-2xl cursor-pointer hover:border-gold/40">
                <input type="checkbox" checked={form.agreedToTerms} onChange={(e) => setForm({...form, agreedToTerms: e.target.checked})} className="w-5 h-5 accent-gold" />
                <span className="text-sm">I agree to the above terms.</span>
              </label>
            </div>
          )}

          <div className="mt-8">
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
    <div className="mb-2">
      <h3 className="font-display text-2xl">{title}</h3>
      <p className="text-sm text-ink-dim mt-1">{subtitle}</p>
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
