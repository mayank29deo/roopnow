import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
import { formatPrice, formatDateLong } from "@/lib/utils";
import { Sparkles, Calendar, Clock, MapPin, CheckCircle, XCircle, ArrowUpRight } from "lucide-react";
import { CancelBookingButton } from "@/components/CancelBookingButton";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "artist") redirect("/artist/dashboard");

  const bookings = await db.booking.findMany({
    where: { userId: user.id },
    include: { artist: true, service: true },
    orderBy: { date: "desc" },
  });

  const now = new Date();
  const upcoming = bookings.filter((b) => b.date >= now && b.status !== "cancelled");
  const past = bookings.filter((b) => b.date < now || b.status === "cancelled");

  return (
    <section className="py-12 lg:py-20">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="chip mb-4"><Sparkles size={12} className="text-gold" />Your space</div>
            <h1 className="font-display text-5xl lg:text-6xl">Hi, {user.name.split(" ")[0]}.</h1>
            <p className="mt-3 text-ink-dim max-w-xl">
              Track upcoming appointments, relive past glow-ups, and plan your next look.
            </p>
          </div>
          <Link href="/discover" className="btn-primary shine self-start">
            <Sparkles size={14} /> Book another artist
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          <StatCard label="Total bookings" value={bookings.length.toString()} />
          <StatCard label="Upcoming" value={upcoming.length.toString()} highlight />
          <StatCard label="Completed" value={past.filter((b) => b.status !== "cancelled").length.toString()} />
        </div>

        <h2 className="font-display text-3xl mb-5">Upcoming</h2>
        {upcoming.length === 0 ? (
          <EmptyState
            title="No upcoming bookings"
            body="Ready for your next glow-up? Discover artists and book your moment."
            cta="Discover artists"
            href="/discover"
          />
        ) : (
          <div className="grid gap-4 mb-14">
            {upcoming.map((b) => (
              <BookingCard key={b.id} booking={b} canCancel />
            ))}
          </div>
        )}

        <h2 className="font-display text-3xl mb-5">Past bookings</h2>
        {past.length === 0 ? (
          <p className="text-ink-dim text-sm">You haven&apos;t had any past bookings yet.</p>
        ) : (
          <div className="grid gap-4">
            {past.map((b) => (
              <BookingCard key={b.id} booking={b} past />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`p-6 rounded-3xl border ${highlight ? "border-gold/30 bg-gradient-to-br from-gold/10 to-transparent" : "border-border bg-surface"}`}>
      <div className="text-xs uppercase tracking-widest text-ink-dim mb-1">{label}</div>
      <div className="font-display text-5xl">{value}</div>
    </div>
  );
}

function EmptyState({ title, body, cta, href }: { title: string; body: string; cta: string; href: string }) {
  return (
    <div className="border border-dashed border-border rounded-3xl p-12 text-center">
      <div className="text-3xl mb-2">✨</div>
      <p className="font-display text-2xl mb-2">{title}</p>
      <p className="text-ink-dim text-sm mb-6 max-w-md mx-auto">{body}</p>
      <Link href={href} className="btn-primary">{cta}</Link>
    </div>
  );
}

function BookingCard({ booking, canCancel, past }: {
  booking: {
    id: string;
    date: Date;
    timeSlot: string;
    status: string;
    totalPrice: number;
    address: string | null;
    notes: string | null;
    artist: { id: string; displayName: string; avatarUrl: string; city: string; area: string };
    service: { name: string; category: string; duration: number };
  };
  canCancel?: boolean;
  past?: boolean;
}) {
  const cancelled = booking.status === "cancelled";
  return (
    <div className={`glass rounded-3xl p-5 lg:p-7 ${cancelled ? "opacity-50" : ""}`}>
      <div className="grid lg:grid-cols-[auto_1fr_auto] gap-5 items-center">
        <Link href={`/artists/${booking.artist.id}`} className="flex items-center gap-4">
          <img src={booking.artist.avatarUrl} alt="" className="w-16 h-16 rounded-2xl object-cover" />
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-gold mb-1">{booking.service.category}</div>
            <div className="font-semibold text-lg truncate">{booking.service.name}</div>
            <div className="text-sm text-ink-dim">with {booking.artist.displayName}</div>
          </div>
        </Link>

        <div className="flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-ink-dim">
            <Calendar size={12} className="text-gold" /> {formatDateLong(booking.date)}
          </span>
          <span className="flex items-center gap-1.5 text-ink-dim">
            <Clock size={12} className="text-gold" /> {booking.timeSlot} · {booking.service.duration} min
          </span>
          {booking.address && (
            <span className="flex items-center gap-1.5 text-ink-dim">
              <MapPin size={12} className="text-gold" /> {booking.address}
            </span>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="font-display text-2xl text-gradient-rose">{formatPrice(booking.totalPrice)}</div>
          {cancelled ? (
            <span className="chip text-rose border-rose/30"><XCircle size={10} /> Cancelled</span>
          ) : past ? (
            <span className="chip text-emerald border-emerald/30"><CheckCircle size={10} /> Completed</span>
          ) : (
            <span className="chip text-gold border-gold/30"><CheckCircle size={10} /> Confirmed</span>
          )}
          {canCancel && !cancelled && <CancelBookingButton id={booking.id} />}
        </div>
      </div>
      {booking.notes && (
        <div className="mt-4 pt-4 border-t border-border text-sm text-ink-dim">
          <span className="text-gold">Notes:</span> {booking.notes}
        </div>
      )}
    </div>
  );
}
