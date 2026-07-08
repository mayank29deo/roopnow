// Email notifications via Resend on the verified roopnow.com domain.
//
// Phase 7B (Suraksha iteration, May 2026) rebuilds every transactional
// template against a single branded shell + footer. Hero images live
// in /public/email-images/ — drop the JPG/PNG with the filenames
// listed in HERO below and they resolve automatically once deployed.
//
// Admin notifications fanout to every profile with role='admin', with
// a fallback to MAIL_REPLY_TO so nothing goes unseen during ramp-up.

import { createAdminClient } from "./supabase/admin";
import { formatPrice, formatDateLong } from "./utils";

const API = "https://api.resend.com/emails";
const FROM = process.env.MAIL_FROM || "Roop <hello@roopnow.com>";
const REPLY_TO = process.env.MAIL_REPLY_TO || "surakshawork20@gmail.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://roopnow.com";

// Hero images for the five client-facing transactional templates.
// Filenames match Suraksha's spec — drop the assets at these paths
// in /public/ and they render in email automatically.
const HERO = {
  welcome:                 `${SITE_URL}/email-images/welcome.jpg`,
  requestSent:             `${SITE_URL}/email-images/request-sent.jpg`,
  confirmed:               `${SITE_URL}/email-images/confirmed.jpg`,
  requestReceived:         `${SITE_URL}/email-images/request-received.jpg`,
  bookingConfirmedArtist:  `${SITE_URL}/email-images/booking-confirmed-artist.jpg`,
};

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
      body: JSON.stringify({
        from: FROM,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        reply_to: REPLY_TO,
      }),
    });
    if (!res.ok) console.error("[notify] resend error", res.status, await res.text());
  } catch (err) {
    console.error("[notify] send failed", err);
  }
}

// Admin fan-out — pulls every admin profile's email, falling back to
// MAIL_REPLY_TO if no admins exist yet (early-stage safety net).
async function getAdminEmails(): Promise<string[]> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("profiles")
      .select("email")
      .eq("role", "admin");
    const emails = (data ?? [])
      .map((r) => (r as { email?: string }).email)
      .filter((e): e is string => !!e);
    return emails.length > 0 ? emails : [REPLY_TO];
  } catch (err) {
    console.error("[notify] getAdminEmails failed", err);
    return [REPLY_TO];
  }
}

function istTimestamp(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

// ============================================================
// Shared branded email shell + Sheet 6 footer
// ============================================================
type Cta = { label: string; url: string; primary?: boolean };

// 25-Jun iteration: customer-facing Confirmed / Rejected emails now
// use a *framed* layout — Suraksha wants the whole branded moment
// (title, intro, CTA, signoff, with-love, logo, tagline) to land
// INSIDE the cream parchment frame of confirmed.jpg, so the email
// reads like a printed card. The links bar / disclaimer stays below
// the image on dark wine.
//
// To enable: pass `framedContent: true` instead of `hero` and the
// template image at HERO.confirmed (or an override) becomes a CSS
// background on a single tall cell with the content overlaid via
// padding tuned to the visible frame interior.
//
// The image is 600×1067 once rendered (native 675×1200, scaled).
// Frame interior (where text can land):
//   • top ≈ 285px (just below wax seal)
//   • side ≈ 70px
//   • bottom ≈ 80px
//   → usable area ≈ 460×700px
function brandedEmail(opts: {
  hero?: { src: string; alt?: string };
  framedContent?: boolean;  // 25-Jun: text-on-parchment customer template
  framedSrc?: string;       // override the framed bg image (defaults to HERO.confirmed)
  preheader?: string;       // hidden inbox-preview text
  title?: string;           // serif headline
  titleAccent?: string;     // italic gold accent on its own line
  intro?: string;           // first paragraph (HTML allowed)
  body?: string;            // raw HTML between intro and CTAs
  ctas?: Cta[];
  signoff?: string;         // overrides the italic tagline above the footer
}): string {
  const preheaderHtml = opts.preheader
    ? `<div style="display:none;font-size:1px;color:#1A0710;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${opts.preheader}</div>`
    : "";

  const signoff = opts.signoff ?? "Here for every kind of beautiful moment.";

  // ─── Framed customer template (parchment-inside-frame) ──────
  if (opts.framedContent) {
    const frameSrc = opts.framedSrc ?? HERO.confirmed;
    // Dark wine ink reads cleanly on the cream parchment. Gold is
    // reserved for the CTA button so the text stays calm and luxe.
    const INK = "#4A0E1E";
    const INK_SOFT = "#6B1E2E";
    const ACCENT = "#8B6914";

    const accent = opts.titleAccent
      ? `<br/><span style="font-style:italic;color:${ACCENT};font-weight:500;">${opts.titleAccent}</span>`
      : "";

    const ctasInside = opts.ctas?.length
      ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:18px auto 0;"><tr>
          ${opts.ctas
            .map((cta) => {
              const style = cta.primary !== false
                ? "padding:13px 28px;background:linear-gradient(135deg,#E8B86D,#A8875E);color:#1A0710;font-weight:600;"
                : `padding:12px 26px;border:1px solid ${INK_SOFT};color:${INK};`;
              return `<td style="padding:0 4px;">
                <a href="${cta.url}" style="display:inline-block;${style}text-decoration:none;border-radius:999px;font-size:13px;font-family:Arial,Helvetica,sans-serif;">${cta.label}</a>
              </td>`;
            })
            .join("")}
        </tr></table>`
      : "";

    const introInside = opts.intro
      ? `<p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.7;color:${INK};margin:14px 0 0;">${opts.intro}</p>`
      : "";

    const bodyInside = opts.body
      ? `<div style="font-family:Arial,Helvetica,sans-serif;color:${INK};font-size:13px;line-height:1.7;margin-top:12px;">${opts.body}</div>`
      : "";

    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Roop</title>
  </head>
  <body style="margin:0;padding:0;background:#1A0710;">
    ${preheaderHtml}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#1A0710;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#2A0D18;border:1px solid rgba(201,169,126,0.22);border-radius:24px;overflow:hidden;">

            <tr><td style="height:4px;background:linear-gradient(90deg,#E8B86D,#D4B586,#A8875E);font-size:0;line-height:0;">&nbsp;</td></tr>

            <!-- Framed parchment cell — bg image + overlaid text -->
            <tr>
              <td
                width="600"
                height="1067"
                valign="top"
                align="center"
                bgcolor="#F5E9D7"
                background="${frameSrc}"
                style="background-image:url('${frameSrc}');background-color:#F5E9D7;background-repeat:no-repeat;background-position:top center;background-size:600px 1067px;width:600px;height:1067px;mso-line-height-rule:exactly;"
              >
                <!--[if mso]>
                <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:600px;height:1067px;">
                  <v:fill type="frame" src="${frameSrc}" color="#F5E9D7" />
                  <v:textbox inset="0,0,0,0">
                <![endif]-->

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;">
                  <tr>
                    <td align="center" valign="top" style="padding:285px 70px 0;">
                      ${opts.title ? `<h1 style="font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-size:26px;line-height:1.2;color:${INK};margin:0;font-weight:500;letter-spacing:0.01em;">${opts.title}${accent}</h1>` : ""}
                      ${introInside}
                      ${bodyInside}
                      ${ctasInside}

                      <!-- Decorative divider + signoff/with-love/logo/tagline, all inside the frame -->
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:24px auto 0;">
                        <tr>
                          <td style="width:40px;height:1px;background:${INK_SOFT};opacity:0.4;font-size:0;line-height:0;">&nbsp;</td>
                          <td style="padding:0 12px;color:${ACCENT};font-size:13px;font-family:Georgia,serif;line-height:1;">·&nbsp;&#10022;&nbsp;·</td>
                          <td style="width:40px;height:1px;background:${INK_SOFT};opacity:0.4;font-size:0;line-height:0;">&nbsp;</td>
                        </tr>
                      </table>

                      <p style="font-family:'Playfair Display',Georgia,serif;font-size:16px;font-style:italic;color:${INK};margin:14px 0 0;line-height:1.4;">${signoff}</p>

                      <p style="font-family:Arial,Helvetica,sans-serif;font-size:9px;letter-spacing:0.32em;color:${INK_SOFT};margin:12px 0 0;text-transform:uppercase;">With Love, The Roop Team</p>

                      <p style="margin:14px 0 0;">
                        <span style="display:inline-block;font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:700;letter-spacing:0.12em;color:${INK};">ROOP</span>
                      </p>

                      <p style="font-family:Arial,Helvetica,sans-serif;font-size:8px;letter-spacing:0.3em;color:${INK_SOFT};margin:6px 0 0;text-transform:uppercase;">Where Creation Meets the Moment</p>
                    </td>
                  </tr>
                </table>

                <!--[if mso]></v:textbox></v:rect><![endif]-->
              </td>
            </tr>

            <!-- Bottom links bar stays on dark wine — disclaimer + utility links -->
            <tr>
              <td style="padding:20px 40px 24px;border-top:1px solid rgba(201,169,126,0.12);background:rgba(26,7,16,0.45);">
                <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#C9A97E;margin:0;line-height:1.6;text-align:center;">
                  <a href="${SITE_URL}" style="color:#C9A97E;text-decoration:none;">roopnow.com</a>
                  &nbsp;&middot;&nbsp;
                  <a href="https://www.instagram.com/roop.now" style="color:#C9A97E;text-decoration:none;">Instagram</a>
                  &nbsp;&middot;&nbsp;
                  <a href="mailto:hello@roopnow.com" style="color:#C9A97E;text-decoration:none;">Support</a>
                </p>
                <p style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#8A6D5C;margin:8px 0 0;text-align:center;">You received this because you joined Roop.</p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  }

  // ─── Default branded shell (hero-above-text) ────────────────
  const heroHtml = opts.hero
    ? `
      <tr>
        <td style="padding:0;font-size:0;line-height:0;">
          <img src="${opts.hero.src}" alt="${opts.hero.alt ?? ""}" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;" />
        </td>
      </tr>`
    : "";

  const accent = opts.titleAccent
    ? `<br/><span style="font-style:italic;color:#E8B86D;">${opts.titleAccent}</span>`
    : "";

  const titleHtml = opts.title
    ? `
      <tr>
        <td align="center" style="padding:${opts.hero ? "36px" : "44px"} 40px 8px;">
          <h1 style="font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;color:#F5E9D7;margin:0;font-weight:500;letter-spacing:0.01em;">${opts.title}${accent}</h1>
        </td>
      </tr>`
    : "";

  const introHtml = opts.intro
    ? `
      <tr>
        <td align="center" style="padding:12px 40px 4px;">
          <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#D4B896;margin:0;">${opts.intro}</p>
        </td>
      </tr>`
    : "";

  const bodyHtml = opts.body
    ? `<tr><td style="padding:18px 40px 4px;font-family:Arial,Helvetica,sans-serif;color:#D4B896;font-size:14px;line-height:1.7;">${opts.body}</td></tr>`
    : "";

  const ctasHtml = opts.ctas?.length
    ? `
      <tr>
        <td align="center" style="padding:26px 40px 8px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            ${opts.ctas
              .map((cta, i) => {
                const style = cta.primary !== false
                  ? "padding:14px 30px;background:linear-gradient(135deg,#E8B86D,#A8875E);color:#1A0710;font-weight:600;"
                  : "padding:13px 28px;border:1px solid rgba(201,169,126,0.4);color:#F5E9D7;";
                const pad = i === 0 && opts.ctas!.length > 1 ? "0 10px 0 0" : "0";
                return `<td style="padding:${pad};">
                  <a href="${cta.url}" style="display:inline-block;${style}text-decoration:none;border-radius:999px;font-size:14px;font-family:Arial,Helvetica,sans-serif;">${cta.label}</a>
                </td>`;
              })
              .join("")}
          </tr></table>
        </td>
      </tr>`
    : "";

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Roop</title>
  </head>
  <body style="margin:0;padding:0;background:#1A0710;">
    ${preheaderHtml}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#1A0710;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#2A0D18;border:1px solid rgba(201,169,126,0.22);border-radius:24px;overflow:hidden;">

            <tr><td style="height:4px;background:linear-gradient(90deg,#E8B86D,#D4B586,#A8875E);font-size:0;line-height:0;">&nbsp;</td></tr>

            ${heroHtml}
            ${titleHtml}
            ${introHtml}
            ${bodyHtml}
            ${ctasHtml}

            <!-- Footer: divider + italic tagline + with-love + logo + tagline + links bar (Sheet 6 spec) -->
            <tr>
              <td align="center" style="padding:40px 40px 6px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="width:60px;height:1px;background:rgba(201,169,126,0.4);font-size:0;line-height:0;">&nbsp;</td>
                    <td style="padding:0 14px;color:#C9A97E;font-size:14px;font-family:Georgia,serif;line-height:1;">·&nbsp;&#10022;&nbsp;·</td>
                    <td style="width:60px;height:1px;background:rgba(201,169,126,0.4);font-size:0;line-height:0;">&nbsp;</td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:14px 40px 4px;">
                <p style="font-family:'Playfair Display',Georgia,serif;font-size:20px;font-style:italic;color:#F5E9D7;margin:0;line-height:1.4;">${signoff}</p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:14px 40px 8px;">
                <p style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:0.36em;color:#C9A97E;margin:0;text-transform:uppercase;">With Love, The Roop Team</p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:18px 40px 4px;">
                <img src="${SITE_URL}/logo.png" alt="Roop" width="170" style="display:block;max-width:170px;height:auto;border:0;outline:none;" />
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:0 40px 32px;">
                <p style="font-family:Arial,Helvetica,sans-serif;font-size:9px;letter-spacing:0.32em;color:#8A6D5C;margin:0;text-transform:uppercase;">Where Creation Meets the Moment</p>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 40px 24px;border-top:1px solid rgba(201,169,126,0.12);background:rgba(26,7,16,0.45);">
                <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#C9A97E;margin:0;line-height:1.6;text-align:center;">
                  <a href="${SITE_URL}" style="color:#C9A97E;text-decoration:none;">roopnow.com</a>
                  &nbsp;&middot;&nbsp;
                  <a href="https://www.instagram.com/roop.now" style="color:#C9A97E;text-decoration:none;">Instagram</a>
                  &nbsp;&middot;&nbsp;
                  <a href="mailto:hello@roopnow.com" style="color:#C9A97E;text-decoration:none;">Support</a>
                </p>
                <p style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#8A6D5C;margin:8px 0 0;text-align:center;">You received this because you joined Roop.</p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// ============================================================
// 1. Welcome — fired on signup (email/password + Google OAuth).
//    Body is identical for both roles per Sheet 6 ("Are you here to
//    get glam or create it? Either way — welcome to the good side.").
//    Only the CTA destination differs.
//    Also fans out a new-user notification to admins.
// ============================================================
export async function notifyWelcome(opts: {
  email: string;
  name: string;
  role: "customer" | "artist" | "admin";
}) {
  if (opts.role === "admin") return;
  const firstName = (opts.name || "").split(" ")[0] || "there";

  const cta: Cta = opts.role === "artist"
    ? { label: "Open your studio", url: `${SITE_URL}/artist/dashboard`, primary: true }
    : { label: "Find your artist", url: `${SITE_URL}/discover`, primary: true };

  await send({
    to: opts.email,
    subject: "Welcome to ROOP. Your moment starts now.",
    html: brandedEmail({
      hero: { src: HERO.welcome, alt: "ROOP heard you" },
      preheader: "ROOP heard you — your moment starts now.",
      title: "ROOP HEARD YOU!",
      intro: `Hello, <em style="font-style:italic;color:#E8B86D;">${firstName}</em>. You just walked into something special.<br/><br/>Are you here to <strong>get glam</strong> or <strong>create it</strong>?<br/><em>Either way &mdash; welcome to the good side.</em>`,
      ctas: [cta],
    }),
  });

  // Tell the admins a new user joined.
  notifyAdminNewUser({ name: opts.name || firstName, email: opts.email, role: opts.role })
    .catch((e) => console.error("admin new-user notify failed:", e));
}

// ============================================================
// 2 + 4. Booking requested — fires on POST /api/bookings.
//    Customer gets a minimal "You're This Close To…" ack carried by
//    the hero image. Artist gets a detailed request card so they can
//    act. Admins get a summary notification.
// ============================================================
export async function notifyBookingRequested(bookingId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("bookings")
    .select(`
      id, date, time_slot, address, event_name, total_price, notes, customer_phone,
      artists ( display_name, user_id, profiles:profiles!artists_user_id_fkey ( email ) ),
      profiles ( name, email, phone ),
      services ( name, category )
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
    services: { name: string; category: string } | null;
  };
  const b = data as unknown as Row;

  const artistEmail = b.artists?.profiles?.email;
  const artistName = b.artists?.display_name ?? "your Artist";
  const customer = b.profiles;
  const customerPhone = b.customer_phone ?? customer?.phone ?? null;

  // Customer ack — image-driven, copy is intentionally minimal.
  if (customer?.email) {
    const firstName = customer.name?.split(" ")[0] ?? "";
    await send({
      to: customer.email,
      subject: "Booking request is successfully sent",
      html: brandedEmail({
        hero: { src: HERO.requestSent, alt: "You're this close" },
        preheader: `Your request is on its way to ${artistName}.`,
        title: "You're this close.",
        intro: `Hey <em style="font-style:italic;color:#E8B86D;">${firstName}</em>, your booking request just landed with <strong>${artistName}</strong>.<br/><br/>We&rsquo;ll email you the moment they respond &mdash; usually within a couple of hours.`,
        ctas: [{ label: "View your bookings", url: `${SITE_URL}/dashboard`, primary: true }],
      }),
    });
  }

  // Artist — full request details so they can decide.
  if (artistEmail) {
    const detailRow = (label: string, value: string) =>
      `<tr><td style="padding:6px 0;color:#8A6D5C;width:130px;font-size:13px;letter-spacing:0.06em;text-transform:uppercase;">${label}</td><td style="padding:6px 0;color:#F5E9D7;font-size:14px;">${value}</td></tr>`;

    const detailsTable = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:8px;">
        ${detailRow("Event", b.event_name ?? "—")}
        ${detailRow("Service", b.services?.name ?? "—")}
        ${detailRow("Category", b.services?.category ?? "—")}
        ${detailRow("When", `${formatDateLong(new Date(b.date))} at ${b.time_slot}`)}
        ${detailRow("Location", b.address ?? "—")}
        ${customerPhone ? detailRow("Phone / WhatsApp", customerPhone) : ""}
        ${detailRow("Total", formatPrice(b.total_price))}
        ${b.notes ? detailRow("Notes", b.notes) : ""}
      </table>`;

    await send({
      to: artistEmail,
      subject: "You've got a new client request on ROOP.",
      html: brandedEmail({
        hero: { src: HERO.requestReceived, alt: "New booking request" },
        preheader: `New booking request from ${customer?.name ?? "a customer"}.`,
        title: `Hey, ${artistName.split(" ")[0]}.`,
        intro: `You have a new booking request from <strong>${customer?.name ?? "a customer"}</strong>. Head to your ROOP dashboard to review the details and respond.<br/><br/><em>Please respond within 1&ndash;2 hours to keep your response rate strong.</em>`,
        body: detailsTable,
        ctas: [{ label: "Open dashboard", url: `${SITE_URL}/artist/dashboard`, primary: true }],
      }),
    });
  }

  // Admin — internal handoff record.
  notifyAdminBookingRequest(bookingId).catch((e) =>
    console.error("admin booking-request notify failed:", e),
  );
}

// ============================================================
// 3 + 5. Booking decided — fires on PATCH /api/bookings/:id with
//    action = accept | reject. Sends:
//    • customer accept/reject email
//    • on accept, an "you're booked" confirmation to the artist
//    • admin booking-update email
// ============================================================
export async function notifyBookingDecided(
  bookingId: string,
  action: "accept" | "reject",
  reason?: string,
) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("bookings")
    .select(`
      id, date, time_slot, event_name,
      artists ( display_name, profiles:profiles!artists_user_id_fkey ( name, email ) ),
      profiles ( name, email )
    `)
    .eq("id", bookingId)
    .maybeSingle();
  if (!data) return;
  type Row = {
    date: string; time_slot: string; event_name: string | null;
    artists: { display_name: string; profiles: { name: string; email: string } | null } | null;
    profiles: { name: string; email: string } | null;
  };
  const b = data as unknown as Row;

  const customerEmail = b.profiles?.email;
  const customerFirst = b.profiles?.name?.split(" ")[0] ?? "";
  const artistEmail = b.artists?.profiles?.email;
  const artistFirst = b.artists?.profiles?.name?.split(" ")[0] ?? b.artists?.display_name?.split(" ")[0] ?? "";
  const artistName = b.artists?.display_name ?? "Your Artist";

  if (action === "accept") {
    if (customerEmail) {
      await send({
        to: customerEmail,
        subject: "Your artist said yes ✦",
        html: brandedEmail({
          // 25-Jun: customer confirmed email lays its text inside the
          // cream parchment frame of confirmed.jpg. See brandedEmail()
          // framedContent block for the layout reasoning.
          framedContent: true,
          preheader: `${artistName} has confirmed your booking.`,
          title: `${customerFirst}.`,
          intro: `It&rsquo;s happening. Your artist has <strong>confirmed</strong> your booking.<br/><br/>They&rsquo;ll reach out directly &mdash; expect a message soon to sort details, prep, and payments.<br/><br/><em>The glam is officially on.</em>`,
          ctas: [{ label: "View booking", url: `${SITE_URL}/dashboard`, primary: true }],
        }),
      });
    }

    // Artist confirmation — Sheet 6 item #5.
    if (artistEmail) {
      await send({
        to: artistEmail,
        subject: `You're booked, ${artistFirst}.`,
        html: brandedEmail({
          hero: { src: HERO.bookingConfirmedArtist, alt: "You're booked" },
          preheader: "Your booking is confirmed.",
          title: `${artistFirst}.`,
          intro: `Your booking is <strong>confirmed</strong>.<br/><br/>Next step &mdash; reach out to them as soon as possible to take things forward. Details, payments, and prep are all yours to handle from here.<br/><br/><em>Make it a great one.</em>`,
          ctas: [{ label: "Open dashboard", url: `${SITE_URL}/artist/dashboard`, primary: true }],
        }),
      });
    }
  } else {
    if (customerEmail) {
      // Rejection reason is shown inline on cream — dark wine-tinted
      // quote box so it stays readable against the parchment bg.
      const reasonBlock = reason
        ? `<div style="background:rgba(74,14,30,0.06);border:1px solid rgba(74,14,30,0.18);border-radius:12px;padding:12px 14px;font-style:italic;margin:12px 0;color:#4A0E1E;">&ldquo;${reason}&rdquo;</div>`
        : "";
      await send({
        to: customerEmail,
        subject: "About your recent booking request.",
        html: brandedEmail({
          // 25-Jun: same framed-parchment treatment as the accept path
          // — rejection lands on the cream card too so the brand
          // moment is consistent.
          framedContent: true,
          preheader: `${artistName} couldn't take this booking — find another artist.`,
          title: `Hey, ${customerFirst}.`,
          intro: `Not this time &mdash; but don&rsquo;t worry. Your artist couldn&rsquo;t take this booking.`,
          body: `${reason ? `Here&rsquo;s what they said:${reasonBlock}` : ""}<p style="margin:0;">There are incredible artists on ROOP who would love to work with you.</p><p style="margin:10px 0 0;font-style:italic;color:#8B6914;">Your moment isn&rsquo;t cancelled. Just redirected.</p>`,
          ctas: [{ label: "Find your artist", url: `${SITE_URL}/discover`, primary: true }],
        }),
      });
    }
  }

  // Admin — booking outcome record.
  notifyAdminBookingDecided(bookingId, action, reason).catch((e) =>
    console.error("admin booking-decided notify failed:", e),
  );
}

// ============================================================
// Booking completed — Phase 3 plumbing kept from earlier round.
//    Customer is nudged for a review, artist gets a job-done ack.
// ============================================================
export async function notifyBookingCompleted(bookingId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("bookings")
    .select(`
      id, date, time_slot, event_name, total_price,
      artists ( id, display_name, profiles:profiles!artists_user_id_fkey ( email ) ),
      profiles ( name, email ),
      services ( name )
    `)
    .eq("id", bookingId)
    .maybeSingle();
  if (!data) return;
  type Row = {
    date: string; time_slot: string; event_name: string | null; total_price: number;
    artists: { id: string; display_name: string; profiles: { email: string } | null } | null;
    profiles: { name: string; email: string } | null;
    services: { name: string } | null;
  };
  const b = data as unknown as Row;

  const artistId = b.artists?.id;
  const artistName = b.artists?.display_name ?? "Your Artist";
  const artistEmail = b.artists?.profiles?.email;
  const customer = b.profiles;
  const eventLabel = b.event_name ?? "your event";
  const whenLabel = `${formatDateLong(new Date(b.date))} at ${b.time_slot}`;

  if (customer?.email) {
    await send({
      to: customer.email,
      subject: `How was your session with ${artistName}?`,
      html: brandedEmail({
        preheader: "Leave a quick review and help the next person find the right artist.",
        title: "How was it,",
        titleAccent: `${customer.name?.split(" ")[0] ?? ""}?`,
        intro: `Hope your <strong>${eventLabel}</strong> went beautifully. Your honest review helps the next bride, customer or creative find the right Artist &mdash; and helps <strong>${artistName}</strong> grow.`,
        body: `<ul style="padding-left:20px;margin:8px 0 0;"><li>Rate your experience out of 5</li><li>Leave a few lines about the look, the service, the moment</li><li>Photos welcome &mdash; show off the result</li></ul>`,
        ctas: artistId
          ? [{ label: "Leave a review", url: `${SITE_URL}/artists/${artistId}?review=1`, primary: true }]
          : undefined,
        signoff: "Thanks for trusting us with the moment.",
      }),
    });
  }

  if (artistEmail) {
    const detailRow = (label: string, value: string) =>
      `<tr><td style="padding:6px 0;color:#8A6D5C;width:120px;font-size:13px;letter-spacing:0.06em;text-transform:uppercase;">${label}</td><td style="padding:6px 0;color:#F5E9D7;font-size:14px;">${value}</td></tr>`;
    await send({
      to: artistEmail,
      subject: `Marked complete: ${eventLabel}`,
      html: brandedEmail({
        preheader: "Another moment delivered. The customer's been nudged for a review.",
        title: "Another moment delivered.",
        intro: `Your session with <strong>${customer?.name ?? "the customer"}</strong> is marked complete. We&rsquo;ve nudged them to leave you a review &mdash; every honest one builds your Roop reputation.`,
        body: `
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:6px;">
            ${detailRow("Event", eventLabel)}
            ${detailRow("Service", b.services?.name ?? "—")}
            ${detailRow("When", whenLabel)}
            ${detailRow("Customer", customer?.name ?? "—")}
            ${detailRow("Total", formatPrice(b.total_price))}
          </table>`,
        ctas: [{ label: "Open dashboard", url: `${SITE_URL}/artist/dashboard`, primary: true }],
        signoff: "Beautifully done.",
      }),
    });
  }
}

// ============================================================
// Artist approved by admin — fires when PATCH /api/admin/artists/:id
// flips verified from false to true. The profile is now live on
// Discover; the artist gets a welcome-to-the-shelf email.
// ============================================================
export async function notifyArtistApproved(artistId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("artists")
    .select(`
      id, display_name,
      profiles:profiles!artists_user_id_fkey ( name, email )
    `)
    .eq("id", artistId)
    .maybeSingle();
  if (!data) return;
  type Row = {
    id: string;
    display_name: string;
    profiles: { name: string; email: string } | null;
  };
  const a = data as unknown as Row;
  const email = a.profiles?.email;
  if (!email) return;
  const firstName = a.profiles?.name?.split(" ")[0] ?? a.display_name?.split(" ")[0] ?? "there";

  await send({
    to: email,
    subject: "You're live on ROOP ✦",
    html: brandedEmail({
      hero: { src: HERO.welcome, alt: "You're on the shelf" },
      preheader: "Your profile is now discoverable to customers.",
      title: `Welcome to the shelf, ${firstName}.`,
      intro: `Good news &mdash; your ROOP profile has been <strong>approved</strong>. It&rsquo;s live on the platform now and customers can find you on <em>Discover</em>.<br/><br/>Keep your calendar, portfolio and services fresh so every visit lands you a booking.`,
      ctas: [{ label: "Open dashboard", url: `${SITE_URL}/artist/dashboard`, primary: true }],
      signoff: "Here for every kind of beautiful moment.",
    }),
  });
}

// ============================================================
// Booking cancelled by customer — fires on DELETE /api/bookings/:id.
// ============================================================
export async function notifyBookingCancelledByCustomer(bookingId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("bookings")
    .select(`
      id, date, time_slot, event_name,
      artists ( display_name, profiles:profiles!artists_user_id_fkey ( email ) ),
      profiles ( name ),
      services ( name )
    `)
    .eq("id", bookingId)
    .maybeSingle();
  if (!data) return;
  type Row = {
    date: string; time_slot: string; event_name: string | null;
    artists: { display_name: string; profiles: { email: string } | null } | null;
    profiles: { name: string } | null;
    services: { name: string } | null;
  };
  const b = data as unknown as Row;

  const artistEmail = b.artists?.profiles?.email;
  if (!artistEmail) return;

  const detailRow = (label: string, value: string) =>
    `<tr><td style="padding:6px 0;color:#8A6D5C;width:120px;font-size:13px;letter-spacing:0.06em;text-transform:uppercase;">${label}</td><td style="padding:6px 0;color:#F5E9D7;font-size:14px;">${value}</td></tr>`;

  await send({
    to: artistEmail,
    subject: `Booking cancelled — slot freed (${formatDateLong(new Date(b.date))})`,
    html: brandedEmail({
      preheader: `${b.profiles?.name ?? "The customer"} cancelled — the slot is back on your calendar.`,
      title: "A slot just opened up.",
      intro: `<strong>${b.profiles?.name ?? "The customer"}</strong> cancelled their booking. The slot is back on your calendar and available for new requests.`,
      body: `
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:6px;">
          ${detailRow("Event", b.event_name ?? "—")}
          ${detailRow("Service", b.services?.name ?? "—")}
          ${detailRow("When", `${formatDateLong(new Date(b.date))} at ${b.time_slot}`)}
        </table>`,
      ctas: [{ label: "Open dashboard", url: `${SITE_URL}/artist/dashboard`, primary: true }],
      signoff: "Hopefully another booking finds its way to you soon.",
    }),
  });
}

// ============================================================
// Subscription paid — Razorpay receipt to artist.
// ============================================================
export async function notifySubscriptionPaid(subscriptionId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("artist_subscriptions")
    .select(`
      id, period_month, amount, razorpay_payment_id, paid_at,
      artists ( display_name, profiles:profiles!artists_user_id_fkey ( email, name ) )
    `)
    .eq("id", subscriptionId)
    .maybeSingle();
  if (!data) return;
  type Row = {
    period_month: string; amount: number;
    razorpay_payment_id: string | null; paid_at: string | null;
    artists: { display_name: string; profiles: { email: string; name: string } | null } | null;
  };
  const s = data as unknown as Row;

  const email = s.artists?.profiles?.email;
  if (!email) return;

  const monthLabel = new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(new Date(s.period_month));
  const firstName = s.artists?.profiles?.name?.split(" ")[0] ?? "there";

  const detailRow = (label: string, value: string) =>
    `<tr><td style="padding:6px 0;color:#8A6D5C;width:120px;font-size:13px;letter-spacing:0.06em;text-transform:uppercase;">${label}</td><td style="padding:6px 0;color:#F5E9D7;font-size:14px;">${value}</td></tr>`;

  await send({
    to: email,
    subject: `Receipt — Roop listing, ${monthLabel}`,
    html: brandedEmail({
      preheader: `Listing fee received for ${monthLabel}.`,
      title: "Payment received.",
      intro: `Thank you, <strong>${firstName}</strong>. Your Roop listing is active for <strong>${monthLabel}</strong>.`,
      body: `
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:6px;">
          ${detailRow("Amount", formatPrice(s.amount))}
          ${detailRow("Period", monthLabel)}
          ${s.razorpay_payment_id ? detailRow("Payment ID", s.razorpay_payment_id) : ""}
          ${detailRow("Status", "Paid")}
          ${s.paid_at ? detailRow("Paid on", formatDateLong(new Date(s.paid_at))) : ""}
        </table>`,
      ctas: [{ label: "Open dashboard", url: `${SITE_URL}/artist/dashboard`, primary: true }],
      signoff: "Keep this email for your records.",
    }),
  });
}

// ============================================================
// 6. Admin: new user joined — fanout when notifyWelcome runs.
// ============================================================
export async function notifyAdminNewUser(opts: {
  name: string;
  email: string;
  role: "customer" | "artist";
}) {
  const admins = await getAdminEmails();
  if (admins.length === 0) return;

  const detailRow = (label: string, value: string) =>
    `<tr><td style="padding:6px 0;color:#8A6D5C;width:90px;font-size:13px;letter-spacing:0.06em;text-transform:uppercase;">${label}</td><td style="padding:6px 0;color:#F5E9D7;font-size:14px;">${value}</td></tr>`;

  await send({
    to: admins,
    subject: `New ${opts.role} on Roop — ${opts.name || opts.email}`,
    html: brandedEmail({
      preheader: `${opts.name || opts.email} just joined as a ${opts.role}.`,
      title: "A new user joined ROOP.",
      intro: `Welcome message has gone out. Logging this so you can keep an eye on growth.`,
      body: `
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:6px;">
          ${detailRow("Name", opts.name || "—")}
          ${detailRow("Type", opts.role)}
          ${detailRow("Email", opts.email)}
          ${detailRow("Time", istTimestamp())}
        </table>`,
      ctas: [{ label: "Open admin dashboard", url: `${SITE_URL}/admin`, primary: true }],
    }),
  });
}

// ============================================================
// 7. Admin: booking request submitted — fanout from notifyBookingRequested.
// ============================================================
export async function notifyAdminBookingRequest(bookingId: string) {
  const admins = await getAdminEmails();
  if (admins.length === 0) return;

  const admin = createAdminClient();
  const { data } = await admin
    .from("bookings")
    .select(`
      id, date, event_name,
      artists ( display_name ),
      profiles ( name ),
      services ( name, category )
    `)
    .eq("id", bookingId)
    .maybeSingle();
  if (!data) return;
  type Row = {
    date: string; event_name: string | null;
    artists: { display_name: string } | null;
    profiles: { name: string } | null;
    services: { name: string; category: string } | null;
  };
  const b = data as unknown as Row;

  const detailRow = (label: string, value: string) =>
    `<tr><td style="padding:6px 0;color:#8A6D5C;width:130px;font-size:13px;letter-spacing:0.06em;text-transform:uppercase;">${label}</td><td style="padding:6px 0;color:#F5E9D7;font-size:14px;">${value}</td></tr>`;

  await send({
    to: admins,
    subject: "New booking request submitted.",
    html: brandedEmail({
      preheader: `${b.profiles?.name ?? "A customer"} → ${b.artists?.display_name ?? "an artist"}.`,
      title: "New booking request",
      intro: `A booking request has been submitted on ROOP.`,
      body: `
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:6px;">
          ${detailRow("Customer", b.profiles?.name ?? "—")}
          ${detailRow("Artist", b.artists?.display_name ?? "—")}
          ${detailRow("Event type", b.services?.category ?? b.event_name ?? "—")}
          ${detailRow("Service", b.services?.name ?? "—")}
          ${detailRow("Requested date", formatDateLong(new Date(b.date)))}
          ${detailRow("Status", "Awaiting artist response")}
        </table>`,
      ctas: [{ label: "View request", url: `${SITE_URL}/admin`, primary: true }],
    }),
  });
}

// ============================================================
// 8. Admin: booking outcome — fanout from notifyBookingDecided.
// ============================================================
export async function notifyAdminBookingDecided(
  bookingId: string,
  action: "accept" | "reject",
  reason?: string,
) {
  const admins = await getAdminEmails();
  if (admins.length === 0) return;

  const admin = createAdminClient();
  const { data } = await admin
    .from("bookings")
    .select(`
      id, date, event_name,
      artists ( display_name ),
      profiles ( name ),
      services ( name, category )
    `)
    .eq("id", bookingId)
    .maybeSingle();
  if (!data) return;
  type Row = {
    date: string; event_name: string | null;
    artists: { display_name: string } | null;
    profiles: { name: string } | null;
    services: { name: string; category: string } | null;
  };
  const b = data as unknown as Row;

  const outcome = action === "accept" ? "Confirmed" : "Rejected";
  const detailRow = (label: string, value: string) =>
    `<tr><td style="padding:6px 0;color:#8A6D5C;width:130px;font-size:13px;letter-spacing:0.06em;text-transform:uppercase;">${label}</td><td style="padding:6px 0;color:#F5E9D7;font-size:14px;">${value}</td></tr>`;

  const reasonBlock = action === "reject" && reason
    ? `<div style="background:rgba(201,169,126,0.08);border:1px solid rgba(201,169,126,0.2);border-radius:12px;padding:14px 16px;font-style:italic;margin:14px 0 4px;">&ldquo;${reason}&rdquo;</div>`
    : "";

  await send({
    to: admins,
    subject: `Booking ${outcome.toLowerCase()} — ${b.artists?.display_name ?? "Artist"} × ${b.profiles?.name ?? "Customer"}`,
    html: brandedEmail({
      preheader: `${b.artists?.display_name ?? "Artist"} ${action === "accept" ? "confirmed" : "rejected"} ${b.profiles?.name ?? "a customer"}'s request.`,
      title: "Booking update",
      intro: `An artist has just responded to a booking request.`,
      body: `
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:6px;">
          ${detailRow("Customer", b.profiles?.name ?? "—")}
          ${detailRow("Artist", b.artists?.display_name ?? "—")}
          ${detailRow("Date", formatDateLong(new Date(b.date)))}
          ${detailRow("Event", b.services?.category ?? b.event_name ?? "—")}
          ${detailRow("Outcome", outcome)}
          ${action === "reject" && reason ? detailRow("Reason", reason) : ""}
        </table>
        ${reasonBlock}`,
      ctas: [{ label: "View in dashboard", url: `${SITE_URL}/admin`, primary: true }],
    }),
  });
}
