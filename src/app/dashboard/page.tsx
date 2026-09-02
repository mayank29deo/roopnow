import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { formatPrice, formatDateLong } from "@/lib/utils";
import { Sparkles, Calendar, Clock, MapPin, CheckCircle, XCircle, Clock3 } from "lucide-react";
import { CancelBookingButton } from "@/components/CancelBookingButton";

export const dynamic = "force-dynamic";

type BookingRow = {
  id: string;
  date: string;
  time_slot: string;
  status: string;
  total_price: number;
  address: string | null;
  notes: string | null;
  event_name: string | null;
  budget: number | null;
  rejection_reason: string | null;
  artists: {
    id: string; display_name: string; avatar_url: string; city: string; area: string;
  } | null;
  services: { name: string; category: string; duration: number } | null;
};

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "artist") redirect("/artist/dashboard");

  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select(`
      id, date, time_slot, status, total_price, address, notes,
      event_name, budget, rejection_reason,
      artists ( id, display_name, avatar_url, city, area ),
      services ( name, category, duration )
    `)
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  const bookings = (data ?? []) as unknown as BookingRow[];
  const pending = bookings.filter((b) => b.status === "pending");
  const active = bookings.filter((b) => b.status === "accepted" && new Date(b.date) >= new Date());
  const past = bookings.filter((b) =>
    b.status === "rejected" || b.status === "cancelled" || b.status === "completed" ||
    (b.status === "accepted" && new Date(b.date) < new Date())
  );

  return (
    <section className="py-12 lg:py-20">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="chip mb-4"><Sparkles size={12} className="text-gold" />Your space</div>
            <h1 className="font-display text-5xl lg:text-6xl">Hi, {user.name.split(" ")[0]}.</h1>
            <p className="mt-3 text-ink-dim max-w-xl">
              Track your booking requests, upcoming sessions, and past appointments.
            </p>
          </div>
          <Link href="/discover" className="btn-primary shine self-start">
            <Sparkles size={14} /> Book another Artist
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          <StatCard label="Pending" value={pending.length.toString()} highlight={pending.length > 0} />
          <StatCard label="Upcoming" value={active.length.toString()} />
          <StatCard label="Completed" value={past.filter((b) => b.status === "accepted" || b.status === "completed").length.toString()} />
        </div>

        {pending.length > 0 && (
          <>
            <h2 className="font-display text-3xl mb-5">Waiting on Artist</h2>
            <div className="grid gap-4 mb-14">
              {pending.map((b) => <BookingCard key={b.id} booking={b} canCancel />)}
            </div>
          </>
        )}

        <h2 className="font-display text-3xl mb-5">Upcoming</h2>
        {active.length === 0 ? (
          <EmptyState
            title="No upcoming bookings"
            body="Ready for your next glow-up? Discover Artists and book your moment."
            cta="Discover Artists"
            href="/discover"
          />
        ) : (
          <div className="grid gap-4 mb-14">
            {active.map((b) => <BookingCard key={b.id} booking={b} canCancel />)}
          </div>
        )}

        <h2 className="font-display text-3xl mb-5">Past</h2>
        {past.length === 0 ? (
          <p className="text-ink-dim text-sm">Nothing in your history yet.</p>
        ) : (
          <div className="grid gap-4">
            {past.map((b) => <BookingCard key={b.id} booking={b} past />)}
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

function StatusPill({ status }: { status: string }) {
  if (status === "pending") return <span className="chip text-gold border-gold/30"><Clock3 size={10} /> Pending</span>;
  if (status === "accepted") return <span className="chip text-emerald border-emerald/30"><CheckCircle size={10} /> Accepted</span>;
  if (status === "completed") return <span className="chip text-emerald border-emerald/30"><CheckCircle size={10} /> Completed</span>;
  if (status === "rejected") return <span className="chip text-rose border-rose/30"><XCircle size={10} /> Rejected</span>;
  if (status === "cancelled") return <span className="chip text-rose border-rose/30"><XCircle size={10} /> Cancelled</span>;
  return <span className="chip">{status}</span>;
}

function BookingCard({ booking, canCancel, past }: {
  booking: BookingRow; canCancel?: boolean; past?: boolean;
}) {
  const artist = booking.artists;
  const service = booking.services;
  if (!artist || !service) return null;
  const dimmed = booking.status === "cancelled" || booking.status === "rejected";
  return (
    <div className={`glass rounded-3xl p-5 lg:p-7 ${dimmed ? "opacity-70" : ""}`}>
      <div className="grid lg:grid-cols-[auto_1fr_auto] gap-5 items-center">
        <Link href={`/artists/${artist.id}`} className="flex items-center gap-4">
          <img src={artist.avatar_url} alt="" className="w-16 h-16 rounded-2xl object-cover" />
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-gold mb-1">{service.category}</div>
            <div className="font-semibold text-lg truncate">{booking.event_name ?? service.name}</div>
            <div className="text-sm text-ink-dim">with {artist.display_name}{past ? "" : ""}</div>
          </div>
        </Link>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-ink-dim">
            <Calendar size={12} className="text-gold" /> {formatDateLong(new Date(booking.date))}
          </span>
          <span className="flex items-center gap-1.5 text-ink-dim">
            <Clock size={12} className="text-gold" /> Ready by {shiftBlockStartToReadyBy(booking.time_slot)} · {service.duration} min
          </span>
          {booking.address && (
            <span className="flex items-center gap-1.5 text-ink-dim">
              <MapPin size={12} className="text-gold" /> {booking.address}
            </span>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="font-display text-2xl text-gradient-rose">{formatPrice(booking.total_price)}</div>
          <StatusPill status={booking.status} />
          {canCancel && (booking.status === "pending" || booking.status === "accepted") && <CancelBookingButton id={booking.id} />}
        </div>
      </div>
      {booking.rejection_reason && (
        <div className="mt-4 pt-4 border-t border-border text-sm">
          <span className="text-rose font-medium">Artist&apos;s reason:</span>{" "}
          <span className="text-ink-dim italic">&ldquo;{booking.rejection_reason}&rdquo;</span>
        </div>
      )}
      {booking.notes && !booking.rejection_reason && (
        <div className="mt-4 pt-4 border-t border-border text-sm text-ink-dim">
          <span className="text-gold">Notes:</span> {booking.notes}
        </div>
      )}
    </div>
  );
}

// 2-Sep iteration: server stores time_slot as the artist block
// start (readyBy - 3h). The customer's own dashboard should read
// back the ready-by moment they actually picked — this un-shifts.
// Wrap-safe for the (unlikely) case where readyBy < 3:00 AM and
// the stored time_slot rolled into the previous day.
function shiftBlockStartToReadyBy(hhmm: string): string {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const total = h * 60 + m + 3 * 60;
  const wrapped = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  return `${String(Math.floor(wrapped / 60)).padStart(2, "0")}:${String(wrapped % 60).padStart(2, "0")}`;
}
