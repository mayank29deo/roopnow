import { NextRequest, NextResponse, after } from "next/server";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { z } from "zod";
import {
  notifyBookingDecided,
  notifyBookingCompleted,
  notifyBookingCancelledByCustomer,
} from "@/lib/notify";

// Customer OR artist cancels a booking. Customer can only cancel
// their own; artist can only cancel bookings on their own artist row.
// Both paths write status = cancelled (soft delete) so the admin log
// + audit trail stay intact.
export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("bookings")
    .select("user_id, artist_id, status")
    .eq("id", id)
    .maybeSingle();
  const isOwner = !!existing && existing.user_id === user.id;
  const isArtist = !!existing && user.role === "artist" && !!user.artistId && existing.artist_id === user.artistId;
  if (!existing || (!isOwner && !isArtist)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  // Only notify if the slot was actually held — silent if it was already
  // rejected / completed / cancelled.
  const wasLive = existing.status === "pending" || existing.status === "accepted";

  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (wasLive && isOwner) {
    // after() keeps the promise alive past the response — a bare
    // fire-and-forget promise was being killed by the serverless
    // runtime and Resend never got the request.
    after(async () => {
      try { await notifyBookingCancelledByCustomer(id); }
      catch (e) { console.error("notify failed:", e); }
    });
  }
  // Artist-side cancellation notification for the customer is a
  // separate template (not implemented yet); admin still sees it via
  // the audit log so this is safe as-is.
  return NextResponse.json({ ok: true });
}

// Artist transitions a booking: pending → accepted / rejected (with reason) / completed.
// 10-Jul: on accept, the artist can override the customer's default
// 4-hour block by sending durationMinutes — how long they'll actually
// be tied up (travel out + service + travel back). Stored on
// bookings.duration_minutes so the overlap check + customer date
// picker both see the true block window.
// 10-Jul tracker item 5: reschedule action lets the artist re-set
// the time_slot + duration_minutes on an already-accepted booking
// without changing status.
const patchSchema = z.object({
  action: z.enum(["accept", "reject", "complete", "reschedule"]),
  reason: z.string().optional(),
  durationMinutes: z.number().int().positive().max(1440).optional(),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user || user.role !== "artist" || !user.artistId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;

  let body;
  try {
    body = patchSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  if (body.action === "reject" && !body.reason?.trim()) {
    return NextResponse.json({ error: "Reason is required when rejecting." }, { status: 400 });
  }

  const statusMap = { accept: "accepted", reject: "rejected", complete: "completed" } as const;

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("bookings")
    .select("artist_id, status")
    .eq("id", id)
    .maybeSingle();
  if (!existing || existing.artist_id !== user.artistId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Build the update payload:
  // - accept / reject / complete: flip status + write duration if provided
  // - reschedule: leave status alone, just update time_slot + duration
  const update: Record<string, unknown> = {};
  if (body.action !== "reschedule") {
    update.status = statusMap[body.action as "accept" | "reject" | "complete"];
    update.rejection_reason = body.action === "reject" ? body.reason : null;
  }
  if ((body.action === "accept" || body.action === "reschedule") && typeof body.durationMinutes === "number") {
    update.duration_minutes = body.durationMinutes;
  }
  // 22-Jul: the artist can also nudge the start time at accept-time
  // through ConfirmBlockPanel — no need to re-open the Bookings tab
  // and edit twice like before.
  if ((body.action === "accept" || body.action === "reschedule") && typeof body.timeSlot === "string") {
    update.time_slot = body.timeSlot;
  }

  const { data, error } = await supabase
    .from("bookings")
    .update(update)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (body.action === "accept" || body.action === "reject") {
    const action = body.action;
    const reason = body.reason;
    after(async () => {
      try { await notifyBookingDecided(id, action, reason); }
      catch (e) { console.error("notify failed:", e); }
    });
  } else if (body.action === "complete") {
    after(async () => {
      try { await notifyBookingCompleted(id); }
      catch (e) { console.error("notify failed:", e); }
    });
  }
  // No email on reschedule for now — customer already reads new
  // times from their dashboard; adding a template + email fanout
  // when Suraksha asks for one is a follow-up.

  return NextResponse.json({ ok: true, booking: data });
}
