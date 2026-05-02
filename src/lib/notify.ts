// Email notifications via Resend. Graceful no-op if RESEND_API_KEY is unset,
// so the app keeps working even before the email provider is wired up.

import { createAdminClient } from "./supabase/admin";
import { formatPrice, formatDateLong } from "./utils";

const FROM = process.env.RESEND_FROM || "Roop <bookings@roop.in>";
const API = "https://api.resend.com/emails";

async function send(opts: { to: string | string[]; subject: string; html: string }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log("[notify] RESEND_API_KEY unset, skipping email:", opts.subject, "→", opts.to);
    return;
  }
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: opts.to, subject: opts.subject, html: opts.html }),
    });
    if (!res.ok) console.error("[notify] resend error", res.status, await res.text());
  } catch (err) {
    console.error("[notify] send failed", err);
  }
}

function shell(title: string, body: string) {
  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;background:#1A0710;color:#F5E9D7;padding:40px 20px">
      <div style="max-width:560px;margin:auto;background:#2A0D18;border:1px solid rgba(201,169,126,0.2);border-radius:20px;padding:32px">
        <div style="letter-spacing:0.2em;color:#C9A97E;font-weight:600">ROOP</div>
        <h1 style="font-size:28px;margin:18px 0 8px;color:#F5E9D7">${title}</h1>
        <div style="color:#D4B896;line-height:1.6;font-size:15px">${body}</div>
        <hr style="border:none;border-top:1px solid rgba(201,169,126,0.15);margin:28px 0" />
        <p style="font-size:12px;color:#8A6D5C">Where creation meets the moment.</p>
      </div>
    </div>`;
}

export async function notifyBookingRequested(bookingId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("bookings")
    .select(`
      id, date, time_slot, address, event_name, total_price, notes, customer_phone,
      artists ( display_name, user_id, profiles:profiles!artists_user_id_fkey ( email ) ),
      profiles ( name, email, phone ),
      services ( name )
    `)
    .eq("id", bookingId)
    .maybeSingle();
  if (!data) return;

  type Row = {
    date: string; time_slot: string; address: string | null;
    event_name: string | null; total_price: number; notes: string | null;
    customer_phone: string | null;
    artists: { display_name: string; profiles: { email: string } | null } | null;
    profiles: { name: string; email: string; phone: string | null } | null;
    services: { name: string } | null;
  };
  const b = data as unknown as Row;

  const artistEmail = b.artists?.profiles?.email;
  const artistName = b.artists?.display_name ?? "there";
  const customer = b.profiles;
  const customerPhone = b.customer_phone ?? customer?.phone ?? null;

  if (artistEmail) {
    await send({
      to: artistEmail,
      subject: `New booking request: ${b.event_name ?? "Event"} (${formatDateLong(new Date(b.date))})`,
      html: shell(
        `New booking request, ${artistName}`,
        `
          <p>You have a new request from <strong>${customer?.name ?? "a customer"}</strong>.</p>
          <ul style="margin:18px 0;padding-left:18px">
            <li><strong>Event:</strong> ${b.event_name ?? "—"}</li>
            <li><strong>Service:</strong> ${b.services?.name ?? "—"}</li>
            <li><strong>When:</strong> ${formatDateLong(new Date(b.date))} at ${b.time_slot}</li>
            <li><strong>Location:</strong> ${b.address ?? "—"}</li>
            ${customerPhone ? `<li><strong>Phone / WhatsApp:</strong> ${customerPhone}</li>` : ""}
            <li><strong>Total:</strong> ${formatPrice(b.total_price)}</li>
            ${b.notes ? `<li><strong>Notes:</strong> ${b.notes}</li>` : ""}
          </ul>
          <p>Sign in to accept or reject this request.</p>
          <a href="https://roop.in/artist/dashboard" style="display:inline-block;background:linear-gradient(135deg,#D4B586,#A8875E);color:#1A0710;padding:12px 22px;border-radius:999px;font-weight:600;text-decoration:none">Open dashboard</a>
        `
      ),
    });
  }

  if (customer?.email) {
    await send({
      to: customer.email,
      subject: "Your request is in — waiting on the Artist",
      html: shell(
        `Thanks ${customer.name?.split(" ")[0] ?? ""}, we've got your request.`,
        `
          <p>We've forwarded your request to <strong>${artistName}</strong>. You'll get an email the moment they respond.</p>
          <ul style="margin:18px 0;padding-left:18px">
            <li><strong>Event:</strong> ${b.event_name ?? "—"}</li>
            <li><strong>When:</strong> ${formatDateLong(new Date(b.date))} at ${b.time_slot}</li>
            <li><strong>Artist:</strong> ${artistName}</li>
          </ul>
          <p>Any follow-up will come directly from the Artist.</p>
        `
      ),
    });
  }
}

export async function notifyBookingDecided(
  bookingId: string,
  action: "accept" | "reject",
  reason?: string
) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("bookings")
    .select(`
      id, date, time_slot, event_name,
      artists ( display_name ),
      profiles ( name, email )
    `)
    .eq("id", bookingId)
    .maybeSingle();
  if (!data) return;
  type Row = {
    date: string; time_slot: string; event_name: string | null;
    artists: { display_name: string } | null;
    profiles: { name: string; email: string } | null;
  };
  const b = data as unknown as Row;
  if (!b.profiles?.email) return;

  if (action === "accept") {
    await send({
      to: b.profiles.email,
      subject: `Confirmed: ${b.artists?.display_name ?? "Your Artist"} accepted your request`,
      html: shell(
        `You're booked!`,
        `
          <p><strong>${b.artists?.display_name ?? "Your Artist"}</strong> accepted your request for <strong>${b.event_name ?? "your event"}</strong> on ${formatDateLong(new Date(b.date))} at ${b.time_slot}.</p>
          <p>They'll be in touch shortly with any final logistics.</p>
        `
      ),
    });
  } else {
    await send({
      to: b.profiles.email,
      subject: "Update on your Roop booking request",
      html: shell(
        `Your request couldn't be accepted`,
        `
          <p><strong>${b.artists?.display_name ?? "The Artist"}</strong> couldn't take on your request this time.</p>
          ${reason ? `<p style="background:rgba(201,169,126,0.08);border:1px solid rgba(201,169,126,0.2);border-radius:12px;padding:14px;font-style:italic">"${reason}"</p>` : ""}
          <p>Plenty of other amazing Artists are available — explore and book one you love.</p>
          <a href="https://roop.in/discover" style="display:inline-block;background:linear-gradient(135deg,#D4B586,#A8875E);color:#1A0710;padding:12px 22px;border-radius:999px;font-weight:600;text-decoration:none">Discover Artists</a>
        `
      ),
    });
  }
}
