import { NextRequest, NextResponse, after } from "next/server";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { z } from "zod";
import {
  notifyBookingDecided,
  notifyBookingCompleted,
  notifyBookingCancelledByCustomer,
} from "@/lib/notify";

// Customer cancels their own pending/accepted booking.
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
    .select("user_id, status")
    .eq("id", id)
    .maybeSingle();
  if (!existing || existing.user_id !== user.id) {
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

  if (wasLive) {
    // after() keeps the promise alive past the response — a bare
    // fire-and-forget promise was being killed by the serverless
    // runtime and Resend never got the request.
    after(async () => {
      try { await notifyBookingCancelledByCustomer(id); }
      catch (e) { console.error("notify failed:", e); }
    });
  }
  return NextResponse.json({ ok: true });
}

// Artist transitions a booking: pending → accepted / rejected (with reason) / completed.
// 10-Jul: on accept, the artist can override the customer's default
// 4-hour block by sending durationMinutes — how long they'll actually
// be tied up (travel out + service + travel back). Stored on
// bookings.duration_minutes so the overlap check + customer date
// picker both see the true block window.
const patchSchema = z.object({
  action: z.enum(["accept", "reject", "complete"]),
  reason: z.string().optional(),
  durationMinutes: z.number().int().positive().max(1440).optional(),
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

  // Build the update payload — duration_minutes is only touched on
  // accept, and only when the artist explicitly sent one. Silence
  // means keep whatever's already on the row (usually the 4h default
  // written at request time).
  const update: Record<string, unknown> = {
    status: statusMap[body.action],
    rejection_reason: body.action === "reject" ? body.reason : null,
  };
  if (body.action === "accept" && typeof body.durationMinutes === "number") {
    update.duration_minutes = body.durationMinutes;
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

  return NextResponse.json({ ok: true, booking: data });
}
