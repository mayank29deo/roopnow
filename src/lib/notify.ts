// Email notifications via Gmail SMTP (nodemailer). Graceful no-op if
// GMAIL_USER / GMAIL_APP_PASSWORD aren't set, so the app keeps working
// even before email is wired up.
//
// Note: Gmail caps a personal account at ~500 sends/day. Move to a
// transactional provider (Resend / Postmark / SES) once volume grows.

import nodemailer, { type Transporter } from "nodemailer";
import { createAdminClient } from "./supabase/admin";
import { formatPrice, formatDateLong } from "./utils";

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const FROM_NAME = process.env.MAIL_FROM_NAME || "Roop";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://roopnow.com";

let cachedTransporter: Transporter | null = null;
function getTransporter(): Transporter | null {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) return null;
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    });
  }
  return cachedTransporter;
}

async function send(opts: { to: string | string[]; subject: string; html: string }) {
  const t = getTransporter();
  if (!t) {
    console.log("[notify] Gmail SMTP not configured, skipping:", opts.subject, "→", opts.to);
    return;
  }
  try {
    await t.sendMail({
      from: `${FROM_NAME} <${GMAIL_USER}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
  } catch (err) {
    console.error("[notify] gmail send failed", err);
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

// ============================================================
// Welcome email — sent once when a user signs up (email/password
// OR first-time Google OAuth). Role-aware: customers get a
// discover-the-platform CTA, Artists get a get-set-up CTA.
// ============================================================
export async function notifyWelcome(opts: {
  email: string;
  name: string;
  role: "customer" | "artist" | "admin";
}) {
  // Admins are internal — they don't need a welcome email.
  if (opts.role === "admin") return;
  const firstName = (opts.name || "").split(" ")[0] || "there";
  const isArtist = opts.role === "artist";
  await send({
    to: opts.email,
    subject: isArtist
      ? `${firstName}, your craft just found its stage`
      : `Welcome to Roop, ${firstName}`,
    html: welcomeHtml({ firstName, isArtist }),
  });
}

function welcomeHtml({ firstName, isArtist }: { firstName: string; isArtist: boolean }) {
  const intro = isArtist
    ? `Your craft just found its stage. Roop is built by and for India&rsquo;s beauty Artists &mdash; a curated home where your work gets the showcase it deserves, your calendar belongs to you, and verified clients come to <em>you</em>. We can&rsquo;t wait to see your portfolio come to life.`
    : `We&rsquo;re so glad you found us. Roop is where India&rsquo;s most talented makeup Artists, hairstylists and beauty pros meet the moments that matter most &mdash; your wedding, your birthday glam, your first big editorial. Every Artist is verified, every portfolio is real, every booking is confirmed.`;

  const primary = isArtist
    ? { label: "Open your dashboard", url: `${SITE_URL}/artist/dashboard` }
    : { label: "Discover Artists", url: `${SITE_URL}/discover` };
  const secondary = isArtist
    ? { label: "How Roop works", url: `${SITE_URL}/for-artists` }
    : { label: "Become an Artist", url: `${SITE_URL}/for-artists` };

  const steps = isArtist
    ? [
        "Upload 5+ portfolio photos",
        "List your services & rates",
        "Add your cancellation policy",
        "Get verified and go live on Discover",
      ]
    : [
        "Browse verified Artist portfolios",
        "Book a session in under 2 minutes",
        "Read real reviews from real clients",
        "No DMs, no ghosting, no last-minute drops",
      ];
  const stepsLabel = isArtist ? "Your studio set-up" : "What&rsquo;s next";

  const stepsHtml = steps
    .map(
      (s) => `
      <tr>
        <td style="padding:6px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="width:22px;vertical-align:top;">
              <span style="display:inline-block;width:18px;height:18px;line-height:18px;border-radius:999px;background:rgba(201,169,126,0.18);color:#E8B86D;font-size:11px;text-align:center;font-family:Georgia,serif;">&#10022;</span>
            </td>
            <td style="font-family:Arial,Helvetica,sans-serif;color:#D4B896;font-size:14px;line-height:1.6;padding-left:10px;">${s}</td>
          </tr></table>
        </td>
      </tr>`
    )
    .join("");

  const signoff = isArtist
    ? "We can&rsquo;t wait to see what you create.<br/>&mdash; The Roop team"
    : "We&rsquo;re here for every kind of beautiful moment.<br/>&mdash; The Roop team";

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Welcome to Roop</title>
  </head>
  <body style="margin:0;padding:0;background:#1A0710;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#1A0710;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#2A0D18;border:1px solid rgba(201,169,126,0.22);border-radius:24px;overflow:hidden;">

            <tr><td style="height:4px;background:linear-gradient(90deg,#E8B86D,#D4B586,#A8875E);font-size:0;line-height:0;">&nbsp;</td></tr>

            <tr>
              <td align="center" style="padding:40px 40px 4px;">
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:38px;letter-spacing:0.08em;color:#C9A97E;font-weight:500;">ROOP</div>
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:0.28em;color:#8A6D5C;margin-top:8px;text-transform:uppercase;">Where creation meets the moment</div>
              </td>
            </tr>

            <tr>
              <td style="padding:32px 40px 8px;">
                <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:1.15;color:#F5E9D7;margin:0 0 18px 0;font-weight:normal;">
                  Welcome to Roop,<br/>
                  <span style="font-style:italic;color:#E8B86D;">${firstName}</span>.
                </h1>
                <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#D4B896;margin:0;">${intro}</p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:28px 40px 16px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding-right:10px;">
                      <a href="${primary.url}" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#E8B86D,#A8875E);color:#1A0710;text-decoration:none;border-radius:999px;font-weight:600;font-size:14px;font-family:Arial,Helvetica,sans-serif;">${primary.label}</a>
                    </td>
                    <td>
                      <a href="${secondary.url}" style="display:inline-block;padding:13px 26px;border:1px solid rgba(201,169,126,0.4);color:#F5E9D7;text-decoration:none;border-radius:999px;font-size:14px;font-family:Arial,Helvetica,sans-serif;">${secondary.label}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr><td style="padding:12px 40px;"><div style="height:1px;background:rgba(201,169,126,0.15);font-size:0;line-height:0;">&nbsp;</div></td></tr>

            <tr>
              <td style="padding:18px 40px 28px;">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.22em;color:#C9A97E;text-transform:uppercase;margin-bottom:14px;">${stepsLabel}</div>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  ${stepsHtml}
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:0 40px 36px;">
                <p style="font-family:Arial,Helvetica,sans-serif;color:#D4B896;font-size:14px;line-height:1.7;margin:0;">${signoff}</p>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 40px 24px;border-top:1px solid rgba(201,169,126,0.12);background:rgba(26,7,16,0.45);">
                <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#8A6D5C;margin:0;line-height:1.6;text-align:center;">
                  <a href="${SITE_URL}" style="color:#C9A97E;text-decoration:none;">roopnow.com</a>
                  &nbsp;&middot;&nbsp;
                  You received this because you just joined Roop. We keep nudges rare and meaningful.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
