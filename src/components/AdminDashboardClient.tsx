"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Users, Calendar, IndianRupee, Star, Eye,
  LayoutDashboard, BadgeCheck, Bookmark, MessageSquareQuote,
  Search, Check, X, Loader2, Phone, Mail, Instagram, MapPin,
  ArrowUpRight, Clock, AlertTriangle, CheckCircle, XCircle, TrendingUp,
} from "lucide-react";
import { formatPrice, formatDateLong } from "@/lib/utils";
import { format } from "date-fns";

type Stats = {
  artists: number;
  customers: number;
  totalBookings: number;
  todayBookings: number;
  weekBookings: number;
  monthBookings: number;
  pendingArtists: number;
  earnings: number;
  avgRating: number;
  reviewCount: number;
  statusCounts: Record<string, number>;
};

type AdminArtist = {
  id: string;
  userId: string;
  displayName: string;
  city: string;
  area: string;
  specialties: string;
  yearsExp: number;
  instagram: string | null;
  avatarUrl: string;
  verified: boolean;
  featured: boolean;
  createdAt: string;
  agreedToTerms: boolean;
  hasPaymentDetails: boolean;
  email: string;
  name: string;
  phone: string | null;
};

type AdminBooking = {
  id: string;
  date: string;
  timeSlot: string;
  status: string;
  totalPrice: number;
  eventName: string | null;
  customerPhone: string | null;
  rejectionReason: string | null;
  createdAt: string;
  artistName: string;
  artistAvatar: string;
  customerName: string;
  customerEmail: string | null;
  serviceName: string;
  serviceCategory: string;
};

type AdminReview = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  artistName: string;
  artistAvatar: string;
  customerName: string;
};

type Tab = "overview" | "artists" | "bookings" | "reviews";

export function AdminDashboardClient({
  adminName, stats, artists, bookings, reviews,
}: {
  adminName: string;
  stats: Stats;
  artists: AdminArtist[];
  bookings: AdminBooking[];
  reviews: AdminReview[];
}) {
  const [tab, setTab] = useState<Tab>("overview");

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "artists", label: "Artists", icon: BadgeCheck, badge: stats.pendingArtists },
    { id: "bookings", label: "Bookings", icon: Bookmark },
    { id: "reviews", label: "Reviews", icon: MessageSquareQuote },
  ];

  return (
    <section className="py-10 lg:py-16">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex items-start justify-between gap-6 mb-10 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-gold-bright to-gold-deep flex items-center justify-center shadow-lg">
              <ShieldCheck size={26} className="text-wine-deep" />
            </div>
            <div>
              <div className="chip mb-2"><ShieldCheck size={12} className="text-gold" /> Admin console</div>
              <h1 className="font-display text-4xl lg:text-5xl">Hello, {adminName.split(" ")[0]}.</h1>
              <p className="text-ink-dim mt-1">Roop&apos;s mission control — track artists, bookings, and quality.</p>
            </div>
          </div>
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
          {tab === "overview" && <OverviewTab key="ov" stats={stats} bookings={bookings} reviews={reviews} onJump={setTab} />}
          {tab === "artists" && <ArtistsTab key="ar" artists={artists} />}
          {tab === "bookings" && <BookingsTab key="bk" bookings={bookings} />}
          {tab === "reviews" && <ReviewsTab key="rv" reviews={reviews} />}
        </AnimatePresence>
      </div>
    </section>
  );
}

// ============================================================
// Overview
// ============================================================
function OverviewTab({ stats, bookings, reviews, onJump }: {
  stats: Stats; bookings: AdminBooking[]; reviews: AdminReview[];
  onJump: (t: Tab) => void;
}) {
  const recentBookings = bookings.slice(0, 6);
  const lowReviews = reviews.filter((r) => r.rating <= 3);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="luxe grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Metric icon={Users} label="Artists" value={stats.artists.toString()} accent="gold" />
        <Metric icon={Users} label="Customers" value={stats.customers.toString()} accent="rose" />
        <Metric icon={Calendar} label="Bookings" value={stats.totalBookings.toString()} accent="violet" />
        <Metric icon={IndianRupee} label="GMV (accepted)" value={formatPrice(stats.earnings)} accent="emerald" />
        <Metric icon={Star} label="Avg rating" value={stats.avgRating ? stats.avgRating.toFixed(1) : "—"} sub={`${stats.reviewCount} reviews`} accent="gold" />
      </div>

      <div className="luxe grid sm:grid-cols-3 gap-4 mb-10">
        <Metric icon={TrendingUp} label="Today" value={stats.todayBookings.toString()} sub="bookings created" accent="rose" />
        <Metric icon={TrendingUp} label="This week" value={stats.weekBookings.toString()} sub="bookings created" accent="violet" />
        <Metric icon={TrendingUp} label="This month" value={stats.monthBookings.toString()} sub="bookings created" accent="gold" />
      </div>

      <div className="luxe mb-8">
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-2xl">Booking pipeline</h3>
            <span className="text-xs text-ink-dim">across all time</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatusTile icon={Clock} label="Pending" count={stats.statusCounts.pending} tone="gold" />
            <StatusTile icon={CheckCircle} label="Accepted" count={stats.statusCounts.accepted} tone="emerald" />
            <StatusTile icon={CheckCircle} label="Completed" count={stats.statusCounts.completed} tone="emerald" />
            <StatusTile icon={XCircle} label="Cancelled" count={stats.statusCounts.cancelled} tone="rose" />
            <StatusTile icon={XCircle} label="Rejected" count={stats.statusCounts.rejected} tone="rose" />
          </div>
        </div>
      </div>

      <div className="luxe grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-2xl">Latest bookings</h3>
            <button onClick={() => onJump("bookings")} className="text-sm text-gold hover:underline inline-flex items-center gap-1">
              All <ArrowUpRight size={12} />
            </button>
          </div>
          {recentBookings.length === 0 ? (
            <div className="py-8 text-center text-ink-dim text-sm">No bookings yet.</div>
          ) : (
            <div className="space-y-2">
              {recentBookings.map((b) => (
                <div key={b.id} className="flex items-center gap-4 p-3 rounded-2xl bg-surface/50 border border-border">
                  <img src={b.artistAvatar} alt="" className="w-10 h-10 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{b.eventName ?? b.serviceName}</div>
                    <div className="text-xs text-ink-dim truncate">{b.customerName} → {b.artistName} · {b.serviceCategory}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <StatusPill status={b.status} />
                    <div className="text-xs text-ink-dim mt-1">{formatPrice(b.totalPrice)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-2xl">Needs attention</h3>
          </div>
          <div className="space-y-3">
            <AttentionRow
              icon={BadgeCheck}
              title={`${stats.pendingArtists} artists pending verification`}
              cta="Review"
              onClick={() => onJump("artists")}
              urgent={stats.pendingArtists > 0}
            />
            <AttentionRow
              icon={Clock}
              title={`${stats.statusCounts.pending} pending booking requests`}
              cta="Open"
              onClick={() => onJump("bookings")}
              urgent={stats.statusCounts.pending > 5}
            />
            <AttentionRow
              icon={AlertTriangle}
              title={`${lowReviews.length} reviews ≤ 3 stars`}
              cta="Inspect"
              onClick={() => onJump("reviews")}
              urgent={lowReviews.length > 0}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Metric({ icon: Icon, label, value, sub, accent }: {
  icon: typeof Users; label: string; value: string; sub?: string;
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

function StatusTile({ icon: Icon, label, count, tone }: {
  icon: typeof Clock; label: string; count: number; tone: "gold" | "emerald" | "rose";
}) {
  const t = {
    gold: "text-gold border-gold/30 bg-gold/5",
    emerald: "text-emerald border-emerald/30 bg-emerald/5",
    rose: "text-rose border-rose/30 bg-rose/5",
  };
  return (
    <div className={`p-4 rounded-2xl border ${t[tone]}`}>
      <Icon size={16} />
      <div className="font-display text-2xl mt-2">{count}</div>
      <div className="text-[11px] uppercase tracking-widest opacity-80">{label}</div>
    </div>
  );
}

function AttentionRow({ icon: Icon, title, cta, onClick, urgent }: {
  icon: typeof BadgeCheck; title: string; cta: string; onClick: () => void; urgent?: boolean;
}) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-colors ${
      urgent ? "border-gold/40 bg-gold/5 hover:bg-gold/10" : "border-border bg-surface/50 hover:bg-surface"
    }`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${urgent ? "bg-gold/20 text-gold" : "bg-surface-2 text-ink-dim"}`}>
        <Icon size={15} />
      </div>
      <span className="text-sm flex-1">{title}</span>
      <span className="text-xs text-gold font-medium inline-flex items-center gap-1">{cta} <ArrowUpRight size={11} /></span>
    </button>
  );
}

// ============================================================
// Artists
// ============================================================
function ArtistsTab({ artists: initial }: { artists: AdminArtist[] }) {
  const [list, setList] = useState(initial);
  const [filter, setFilter] = useState<"all" | "pending" | "verified" | "featured">("pending");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return list.filter((a) => {
      if (filter === "pending" && a.verified) return false;
      if (filter === "verified" && !a.verified) return false;
      if (filter === "featured" && !a.featured) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay = `${a.displayName} ${a.email} ${a.city} ${a.area} ${a.specialties}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [list, filter, query]);

  function updateOne(updated: AdminArtist) {
    setList((all) => all.map((a) => (a.id === updated.id ? updated : a)));
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="flex flex-wrap gap-3 items-center mb-6">
        <div className="flex flex-wrap gap-2">
          {(["pending", "all", "verified", "featured"] as const).map((f) => {
            const count = f === "all" ? list.length :
              f === "pending" ? list.filter((a) => !a.verified).length :
              f === "verified" ? list.filter((a) => a.verified).length :
              list.filter((a) => a.featured).length;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm capitalize ${
                  filter === f ? "bg-gradient-to-r from-gold-bright to-gold-deep text-wine-deep font-medium" : "bg-surface border border-border text-ink-dim hover:text-ink"
                }`}
              >
                {f} ({count})
              </button>
            );
          })}
        </div>
        <div className="relative ml-auto w-full sm:w-auto sm:min-w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-dim" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, city, specialty…"
            className="w-full pl-9 pr-4 py-2 rounded-full bg-surface border border-border focus:border-gold/50 outline-none text-sm"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="luxe">
          <div className="glass rounded-3xl py-16 text-center text-ink-dim">No artists match.</div>
        </div>
      ) : (
        <div className="luxe grid gap-3">
          {filtered.map((a) => <AdminArtistRow key={a.id} artist={a} onChange={updateOne} />)}
        </div>
      )}
    </motion.div>
  );
}

function AdminArtistRow({ artist, onChange }: { artist: AdminArtist; onChange: (a: AdminArtist) => void }) {
  const [busy, setBusy] = useState<"verify" | "feature" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggle(field: "verified" | "featured") {
    setBusy(field === "verified" ? "verify" : "feature"); setError(null);
    try {
      const res = await fetch(`/api/admin/artists/${artist.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !artist[field] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onChange({ ...artist, [field]: !artist[field] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="glass rounded-3xl p-5 grid lg:grid-cols-[auto_1fr_auto] gap-4">
      <img src={artist.avatarUrl} alt="" className="w-16 h-16 rounded-2xl object-cover border border-border-strong" />
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-lg">{artist.displayName}</span>
          {artist.verified && <span className="chip text-emerald border-emerald/30"><BadgeCheck size={11} /> Verified</span>}
          {artist.featured && <span className="chip text-gold border-gold/30">★ Featured</span>}
          {!artist.agreedToTerms && <span className="chip text-rose border-rose/30">No terms</span>}
        </div>
        <div className="text-sm text-ink-dim mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="flex items-center gap-1"><MapPin size={11} className="text-gold" /> {artist.city}{artist.area ? `, ${artist.area}` : ""}</span>
          {artist.email && <span className="flex items-center gap-1"><Mail size={11} className="text-gold" /> {artist.email}</span>}
          {artist.phone && <span className="flex items-center gap-1"><Phone size={11} className="text-gold" /> {artist.phone}</span>}
          {artist.instagram && <span className="flex items-center gap-1"><Instagram size={11} className="text-gold" /> @{artist.instagram}</span>}
        </div>
        <div className="flex flex-wrap gap-2 mt-2 text-xs">
          <span className="chip">{artist.yearsExp || 0} yrs</span>
          {artist.specialties.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 4).map((s) => (
            <span key={s} className="chip">{s}</span>
          ))}
          {artist.hasPaymentDetails ? (
            <span className="chip text-emerald border-emerald/30">Payments set</span>
          ) : (
            <span className="chip text-rose border-rose/30">No payments</span>
          )}
        </div>
        {error && <div className="text-xs text-rose mt-2">{error}</div>}
      </div>
      <div className="flex flex-col gap-2 lg:items-end">
        <Link href={`/artists/${artist.id}`} target="_blank" className="text-xs text-gold hover:underline inline-flex items-center gap-1">
          View profile <ArrowUpRight size={11} />
        </Link>
        <button
          onClick={() => toggle("verified")}
          disabled={busy !== null}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${
            artist.verified
              ? "bg-surface border border-border text-ink-dim hover:bg-rose/10 hover:text-rose hover:border-rose/40"
              : "bg-gradient-to-r from-gold-bright to-gold-deep text-wine-deep"
          }`}
        >
          {busy === "verify" ? <Loader2 className="animate-spin" size={13} /> : artist.verified ? <><X size={13} className="inline" /> Unverify</> : <><Check size={13} className="inline" /> Verify</>}
        </button>
        <button
          onClick={() => toggle("featured")}
          disabled={busy !== null}
          className="text-xs text-ink-dim hover:text-ink disabled:opacity-50"
        >
          {busy === "feature" ? <Loader2 className="animate-spin inline" size={11} /> : artist.featured ? "Remove from featured" : "Mark as featured"}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Bookings
// ============================================================
function BookingsTab({ bookings }: { bookings: AdminBooking[] }) {
  const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "completed" | "cancelled" | "rejected">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (filter !== "all" && b.status !== filter) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay = `${b.artistName} ${b.customerName} ${b.eventName ?? ""} ${b.serviceName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [bookings, filter, query]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="flex flex-wrap gap-3 items-center mb-6">
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "accepted", "completed", "cancelled", "rejected"] as const).map((f) => {
            const count = f === "all" ? bookings.length : bookings.filter((b) => b.status === f).length;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm capitalize ${
                  filter === f ? "bg-gradient-to-r from-gold-bright to-gold-deep text-wine-deep font-medium" : "bg-surface border border-border text-ink-dim hover:text-ink"
                }`}
              >
                {f} ({count})
              </button>
            );
          })}
        </div>
        <div className="relative ml-auto w-full sm:w-auto sm:min-w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-dim" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search artist, customer, event…"
            className="w-full pl-9 pr-4 py-2 rounded-full bg-surface border border-border focus:border-gold/50 outline-none text-sm"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="luxe">
          <div className="glass rounded-3xl py-16 text-center text-ink-dim">No bookings match.</div>
        </div>
      ) : (
        <div className="luxe grid gap-3">
          {filtered.map((b) => (
            <div key={b.id} className="glass rounded-2xl p-5 grid lg:grid-cols-[auto_1fr_auto] gap-4">
              <img src={b.artistAvatar} alt="" className="w-12 h-12 rounded-2xl object-cover border border-border-strong shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="chip">{b.serviceCategory}</span>
                  <StatusPill status={b.status} />
                </div>
                <div className="font-semibold">{b.eventName ?? b.serviceName}</div>
                <div className="text-sm text-ink-dim mt-0.5">
                  <span className="font-medium text-ink">{b.customerName}</span> → {b.artistName}
                </div>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-ink-dim">
                  <span className="flex items-center gap-1"><Calendar size={11} className="text-gold" />{formatDateLong(new Date(b.date))}</span>
                  <span className="flex items-center gap-1"><Clock size={11} className="text-gold" />{b.timeSlot}</span>
                  {b.customerPhone && <span className="flex items-center gap-1"><Phone size={11} className="text-gold" />{b.customerPhone}</span>}
                  {b.customerEmail && <span className="flex items-center gap-1"><Mail size={11} className="text-gold" />{b.customerEmail}</span>}
                </div>
                {b.rejectionReason && (
                  <div className="text-xs text-rose mt-2 italic">Rejected: &ldquo;{b.rejectionReason}&rdquo;</div>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="font-display text-2xl">{formatPrice(b.totalPrice)}</div>
                <div className="text-xs text-ink-dim mt-1">requested {format(new Date(b.createdAt), "d MMM")}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ============================================================
// Reviews
// ============================================================
function ReviewsTab({ reviews }: { reviews: AdminReview[] }) {
  const [minRating, setMinRating] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const filtered = minRating === 0 ? reviews : reviews.filter((r) => r.rating <= minRating);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <span className="text-xs uppercase tracking-widest text-ink-dim mr-2">Show reviews ≤</span>
        {([0, 1, 2, 3, 4, 5] as const).map((r) => (
          <button
            key={r}
            onClick={() => setMinRating(r)}
            className={`px-3 py-1.5 rounded-full text-xs ${
              minRating === r ? "bg-gradient-to-r from-gold-bright to-gold-deep text-wine-deep font-medium" : "bg-surface border border-border text-ink-dim hover:text-ink"
            }`}
          >
            {r === 0 ? "All" : `${r}★`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="luxe">
          <div className="glass rounded-3xl py-16 text-center text-ink-dim">No reviews to flag — quality looks good.</div>
        </div>
      ) : (
        <div className="luxe grid md:grid-cols-2 gap-4">
          {filtered.map((r) => (
            <div key={r.id} className="glass rounded-3xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <img src={r.artistAvatar} alt="" className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <div className="font-semibold text-sm">{r.artistName}</div>
                    <div className="text-xs text-ink-dim">by {r.customerName}</div>
                  </div>
                </div>
                <div className={`flex items-center gap-1 ${r.rating <= 3 ? "text-rose" : "text-gold"}`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} fill={i < r.rating ? "currentColor" : "transparent"} strokeWidth={1.5} />
                  ))}
                </div>
              </div>
              <p className="text-sm leading-relaxed">{r.comment || <span className="text-ink-dim italic">No comment</span>}</p>
              <div className="text-[11px] text-ink-dim mt-3">{format(new Date(r.createdAt), "d MMM yyyy")}</div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ============================================================
// Shared
// ============================================================
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
