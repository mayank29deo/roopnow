import { NextRequest, NextResponse } from "next/server";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { z } from "zod";
import { notifyBookingRequested } from "@/lib/notify";

const schema = z.object({
  artistId: z.string(),
  serviceId: z.string(),
  date: z.string(),
  timeSlot: z.string(),
  eventName: z.string().min(1, "Event name is required"),
  budget: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(7, "A reachable phone number is required"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Please log in to book." }, { status: 401 });

    const data = schema.parse(await req.json());
    const supabase = await createClient();

    const { data: service } = await supabase
      .from("services")
      .select("price, name")
      .eq("id", data.serviceId)
      .maybeSingle();
    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        artist_id: data.artistId,
        service_id: data.serviceId,
        date: data.date,
        time_slot: data.timeSlot,
        total_price: service.price,
        event_name: data.eventName,
        budget: data.budget ?? null,
        notes: data.notes ?? null,
        address: data.address,
        customer_phone: data.phone,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Fire-and-forget email (never blocks the response).
    notifyBookingRequested(booking.id).catch((e) => console.error("notify failed:", e));

    return NextResponse.json({ ok: true, bookingId: booking.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid booking details" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
