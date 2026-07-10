import { NextRequest, NextResponse, after } from "next/server";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { z } from "zod";
import { notifyBookingRequested } from "@/lib/notify";

// "6:00 AM" / "5:30 PM" for the 409 overlap message. Handles times
// past midnight so a booking that spans 11 PM → 1 AM still labels
// its end as "1:00 AM".
function fmt12(totalMinutes: number): string {
  const m = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(m / 60);
  const min = m % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return min === 0 ? `${h12}:00 ${ampm}` : `${h12}:${String(min).padStart(2, "0")} ${ampm}`;
}

const schema = z.object({
  artistId: z.string(),
  serviceId: z.string(),
  date: z.string(),
  // 28-Jun calendar redesign: drawer now sends arrivalTime + durationMinutes.
  // timeSlot kept for back-compat with any older caller — if both are sent
  // we prefer arrivalTime since that's the new canonical field.
  arrivalTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  timeSlot: z.string().optional(),
  durationMinutes: z.number().int().positive().optional(),
  eventName: z.string().min(1, "Event name is required"),
  // budget kept here as optional for backward-compat with any caller
  // that still sends it — UI no longer collects it (24-Jun tracker #3).
  budget: z.number().int().nonnegative().optional(),
  partySize: z.number().int().positive().optional(),
  notes: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(7, "A reachable phone number is required"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Please log in to book." }, { status: 401 });

    const data = schema.parse(await req.json());
    const arrival = data.arrivalTime ?? data.timeSlot;
    if (!arrival) {
      return NextResponse.json({ error: "Arrival time is required." }, { status: 400 });
    }
    const supabase = await createClient();

    const { data: service } = await supabase
      .from("services")
      .select("price, name, duration")
      .eq("id", data.serviceId)
      .maybeSingle();
    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    // 7-Jul tracker item 7: reject the request if the requested slot
    // overlaps any active (pending or accepted) booking on the same
    // date. We check the day window ± existing bookings' [start, end).
    const newDurationMin = data.durationMinutes ?? 240;
    const [arrH, arrM] = arrival.split(":").map((n) => parseInt(n, 10));
    const newStart = arrH * 60 + arrM;
    const newEnd = newStart + newDurationMin;
    const dayStart = new Date(data.date); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1);
    const { data: sameDay } = await supabase
      .from("bookings")
      .select("time_slot, duration_minutes, services(duration)")
      .eq("artist_id", data.artistId)
      .gte("date", dayStart.toISOString())
      .lt("date", dayEnd.toISOString())
      .in("status", ["pending", "accepted"]);
    // The Supabase JS client types the foreign-key relation as
    // `services: { duration }[]` even when the relationship is a
    // to-one — go through unknown to grab the shape we actually
    // read at runtime.
    for (const b of (sameDay ?? []) as unknown as Array<{
      time_slot: string | null;
      duration_minutes: number | null;
      services: { duration: number | null } | { duration: number | null }[] | null;
    }>) {
      if (!b.time_slot) continue;
      const [bH, bM] = b.time_slot.split(":").map((n) => parseInt(n, 10));
      const bStart = bH * 60 + bM;
      const svc = Array.isArray(b.services) ? b.services[0] : b.services;
      const bDur = b.duration_minutes ?? svc?.duration ?? 240;
      const bEnd = bStart + bDur;
      // Half-open overlap: [newStart, newEnd) ∩ [bStart, bEnd) is
      // non-empty iff newStart < bEnd AND newEnd > bStart.
      if (newStart < bEnd && newEnd > bStart) {
        // 10-Jul: return the exact busy range + earliest free time so
        // the customer sees "6:00 AM – 10:00 AM, try after 10:00 AM"
        // instead of a generic collision.
        return NextResponse.json(
          {
            error: `The artist is already booked from ${fmt12(bStart)} to ${fmt12(bEnd)} on this date. Please pick a time after ${fmt12(bEnd)} or another day.`,
          },
          { status: 409 },
        );
      }
    }

    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        artist_id: data.artistId,
        service_id: data.serviceId,
        date: data.date,
        time_slot: arrival,
        // 7-Jul item 4: default 4-hour block if the client didn't send
        // a duration — customer no longer picks it, artist confirms
        // after discussion.
        duration_minutes: data.durationMinutes ?? 240,
        // 7-Jul item 5: quoted total = service.price × party size.
        // partySize is nullable/optional; default to 1 head.
        total_price: service.price * Math.max(1, data.partySize ?? 1),
        event_name: data.eventName,
        budget: data.budget ?? null,
        party_size: data.partySize ?? null,
        notes: data.notes ?? null,
        address: data.address,
        customer_phone: data.phone,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // 9-Jul: emails now run inside after() so the serverless runtime
    // keeps the promise alive past the response — a raw fire-and-forget
    // promise was being killed once we returned, which is why nothing
    // was reaching Resend anymore.
    after(async () => {
      try { await notifyBookingRequested(booking.id); }
      catch (e) { console.error("notify failed:", e); }
    });

    return NextResponse.json({ ok: true, bookingId: booking.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid booking details" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
