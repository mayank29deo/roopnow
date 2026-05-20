// Email notifications via Resend (verified roopnow.com domain).
// Graceful no-op if RESEND_API_KEY isn't set, so dev/preview keeps
// working without secrets.
//
// FROM is the branded sender (e.g. "Roop <hello@roopnow.com>"); replies
// route to MAIL_REPLY_TO (Suraksha's working inbox) via the Reply-To
// header so users hitting Reply always land in a real human's mailbox.

import { createAdminClient } from "./supabase/admin";
import { formatPrice, formatDateLong } from "./utils";

const API = "https://api.resend.com/emails";
const FROM = process.env.MAIL_FROM || "Roop <hello@roopnow.com>";
const REPLY_TO = process.env.MAIL_REPLY_TO || "surakshawork20@gmail.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://roopnow.com";

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

// ============================================================
// Shared branded email shell. Every transactional message uses
// this so the wine + gold envelope stays identical across the
// pipeline; the body is what varies.
//
// Layout (top → bottom):
//   gold gradient strip · ROOP wordmark + tagline ·
//   title (with optional italic gold accent) · intro paragraph ·
//   optional bullet section (sectionLabel + bullets[]) ·
//   optional extra HTML block · optional CTAs · signoff · footer
// ============================================================
type Cta = { label: string; url: string; primary?: boolean };

function brandedEmail(opts: {
  title: string;            // HTML allowed
  titleAccent?: string;     // italic gold accent on its own line
  intro: string;            // HTML allowed
  sectionLabel?: string;
  bullets?: string[];       // each line can embed <strong> for the label
  extra?: string;           // raw HTML inserted between bullets and CTAs
  ctas?: Cta[];
  signoff?: string;         // HTML; defaults to "— The Roop team"
  footerNote?: string;      // override the rare-nudges footer copy
}): string {
  const accent = opts.titleAccent
    ? `<br/><span style="font-style:italic;color:#E8B86D;">${opts.titleAccent}</span>`
    : "";

  const bulletsHtml = opts.bullets?.length
    ? `
      <tr><td style="padding:12px 40px;"><div style="height:1px;background:rgba(201,169,126,0.15);font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr>
        <td style="padding:18px 40px 4px;">
          ${opts.sectionLabel ? `<div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.22em;color:#C9A97E;text-transform:uppercase;margin-bottom:14px;">${opts.sectionLabel}</div>` : ""}
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            ${opts.bullets
              .map(
                (b) => `
              <tr>
                <td style="padding:6px 0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                    <td style="width:22px;vertical-align:top;">
                      <span style="display:inline-block;width:18px;height:18px;line-height:18px;border-radius:999px;background:rgba(201,169,126,0.18);color:#E8B86D;font-size:11px;text-align:center;font-family:Georgia,serif;">&#10022;</span>
                    </td>
                    <td style="font-family:Arial,Helvetica,sans-serif;color:#D4B896;font-size:14px;line-height:1.6;padding-left:10px;">${b}</td>
                  </tr></table>
                </td>
              </tr>`
              )
              .join("")}
          </table>
        </td>
      </tr>`
    : "";

  const extraHtml = opts.extra
    ? `<tr><td style="padding:14px 40px 4px;font-family:Arial,Helvetica,sans-serif;color:#D4B896;font-size:14px;line-height:1.7;">${opts.extra}</td></tr>`
    : "";

  const ctasHtml = opts.ctas?.length
    ? `
      <tr>
        <td align="center" style="padding:24px 40px 8px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            ${opts.ctas
              .map((cta, i) => {
                const style = cta.primary !== false
                  ? "padding:14px 28px;background:linear-gradient(135deg,#E8B86D,#A8875E);color:#1A0710;font-weight:600;"
                  : "padding:13px 26px;border:1px solid rgba(201,169,126,0.4);color:#F5E9D7;";
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

  const signoff = opts.signoff ?? "&mdash; The Roop team";
  const footerNote = opts.footerNote ?? "We keep nudges rare and meaningful.";

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Roop</title>
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
                <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;color:#F5E9D7;margin:0 0 18px 0;font-weight:normal;">
                  ${opts.title}${accent}
                </h1>
                <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#D4B896;margin:0;">${opts.intro}</p>
              </td>
            </tr>

            ${bulletsHtml}
            ${extraHtml}
            ${ctasHtml}

            <tr>
              <td style="padding:28px 40px 36px;">
                <p style="font-family:Arial,Helvetica,sans-serif;color:#D4B896;font-size:14px;line-height:1.7;margin:0;">${signoff}</p>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 40px 24px;border-top:1px solid rgba(201,169,126,0.12);background:rgba(26,7,16,0.45);">
                <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#8A6D5C;margin:0;line-height:1.6;text-align:center;">
                  <a href="${SITE_URL}" style="color:#C9A97E;text-decoration:none;">roopnow.com</a>
                  &nbsp;&middot;&nbsp;
                  ${footerNote}
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

// ============================================================
// 1. Booking requested — fires on POST /api/bookings.
//    Sends two emails: artist gets the request details, customer
//    gets an acknowledgement.
// ============================================================
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
    const bullets = [
      `<strong>Event:</strong> ${b.event_name ?? "—"}`,
      `<strong>Service:</strong> ${b.services?.name ?? "—"}`,
      `<strong>When:</strong> ${formatDateLong(new Date(b.date))} at ${b.time_slot}`,
      `<strong>Location:</strong> ${b.address ?? "—"}`,
      customerPhone ? `<strong>Phone / WhatsApp:</strong> ${customerPhone}` : null,
      `<strong>Total:</strong> ${formatPrice(b.total_price)}`,
      b.notes ? `<strong>Notes:</strong> ${b.notes}` : null,
    ].filter(Boolean) as string[];

    await send({
      to: artistEmail,
      subject: `New booking request: ${b.event_name ?? "Event"} (${formatDateLong(new Date(b.date))})`,
      html: brandedEmail({
        title: "New booking request,",
        titleAccent: `${artistName}.`,
        intro: `You have a new request from <strong>${customer?.name ?? "a customer"}</strong>.`,
        sectionLabel: "Request details",
        bullets,
        ctas: [{ label: "Open dashboard", url: `${SITE_URL}/artist/dashboard`, primary: true }],
        signoff: "Sign in to accept or reject this request.<br/>&mdash; The Roop team",
      }),
    });
  }

  if (customer?.email) {
    await send({
      to: customer.email,
      subject: "Your request is in — waiting on the Artist",
      html: brandedEmail({
        title: `Thanks ${customer.name?.split(" ")[0] ?? ""},`,
        titleAccent: "we&rsquo;ve got your request.",
        intro: `We&rsquo;ve forwarded your request to <strong>${artistName}</strong>. You&rsquo;ll get an email the moment they respond.`,
        sectionLabel: "Your request",
        bullets: [
          `<strong>Event:</strong> ${b.event_name ?? "—"}`,
          `<strong>When:</strong> ${formatDateLong(new Date(b.date))} at ${b.time_slot}`,
          `<strong>Artist:</strong> ${artistName}`,
        ],
        signoff: "Any follow-up will come directly from the Artist.<br/>&mdash; The Roop team",
      }),
    });
  }
}

// ============================================================
// 2. Booking decided — fires on PATCH /api/bookings/:id with
//    action = "accept" | "reject". Customer-facing only.
// ============================================================
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

  const artistName = b.artists?.display_name ?? "Your Artist";

  if (action === "accept") {
    await send({
      to: b.profiles.email,
      subject: `Confirmed: ${artistName} accepted your request`,
      html: brandedEmail({
        title: "You&rsquo;re booked!",
        intro: `<strong>${artistName}</strong> accepted your request for <strong>${b.event_name ?? "your event"}</strong> on ${formatDateLong(new Date(b.date))} at ${b.time_slot}.`,
        sectionLabel: "What happens next",
        bullets: [
          "Your Artist will be in touch shortly with any final logistics",
          "You can view your booking anytime from your dashboard",
          "Need to change something? Reply to this email and we&rsquo;ll help",
        ],
        ctas: [{ label: "View booking", url: `${SITE_URL}/dashboard`, primary: true }],
      }),
    });
  } else {
    const reasonBlock = reason
      ? `<div style="background:rgba(201,169,126,0.08);border:1px solid rgba(201,169,126,0.2);border-radius:12px;padding:14px 16px;font-style:italic;margin:6px 0 14px 0;">&ldquo;${reason}&rdquo;</div>`
      : "";
    await send({
      to: b.profiles.email,
      subject: "Update on your Roop booking request",
      html: brandedEmail({
        title: "Your request couldn&rsquo;t be accepted",
        intro: `<strong>${artistName}</strong> couldn&rsquo;t take on your request this time.`,
        extra: `${reasonBlock}<p style="margin:0;">Plenty of other amazing Artists are available — explore and book one you love.</p>`,
        ctas: [{ label: "Discover Artists", url: `${SITE_URL}/discover`, primary: true }],
      }),
    });
  }
}

// ============================================================
// 3. Booking completed — fires on PATCH /api/bookings/:id action
//    = "complete". Closes the loop: customer is nudged for a
//    review, artist gets a job-done confirmation.
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

  // Customer — review nudge.
  if (customer?.email) {
    await send({
      to: customer.email,
      subject: `How was your session with ${artistName}?`,
      html: brandedEmail({
        title: "How was it,",
        titleAccent: `${customer.name?.split(" ")[0] ?? ""}?`,
        intro: `Hope your <strong>${eventLabel}</strong> went beautifully. Your honest review helps the next bride, customer or creative find the right Artist — and helps <strong>${artistName}</strong> grow.`,
        sectionLabel: "A 30-second favour",
        bullets: [
          "Rate your experience out of 5",
          "Leave a few lines about the look, the service, the moment",
          "Photos welcome — show off the result",
        ],
        ctas: artistId
          ? [{ label: "Leave a review", url: `${SITE_URL}/artists/${artistId}?review=1`, primary: true }]
          : undefined,
        signoff: "Thanks for trusting us with the moment.<br/>&mdash; The Roop team",
      }),
    });
  }

  // Artist — job-done confirmation.
  if (artistEmail) {
    await send({
      to: artistEmail,
      subject: `Marked complete: ${eventLabel}`,
      html: brandedEmail({
        title: "Another moment delivered.",
        intro: `Your session with <strong>${customer?.name ?? "the customer"}</strong> is marked complete. We&rsquo;ve nudged them to leave you a review — every honest one builds your Roop reputation.`,
        sectionLabel: "Session recap",
        bullets: [
          `<strong>Event:</strong> ${eventLabel}`,
          `<strong>Service:</strong> ${b.services?.name ?? "—"}`,
          `<strong>When:</strong> ${whenLabel}`,
          `<strong>Customer:</strong> ${customer?.name ?? "—"}`,
          `<strong>Total:</strong> ${formatPrice(b.total_price)}`,
        ],
        ctas: [{ label: "Open dashboard", url: `${SITE_URL}/artist/dashboard`, primary: true }],
        signoff: "Beautifully done.<br/>&mdash; The Roop team",
      }),
    });
  }
}

// ============================================================
// 4. Booking cancelled by customer — fires on DELETE
//    /api/bookings/:id. Artist needs to know the slot is freed.
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

  await send({
    to: artistEmail,
    subject: `Booking cancelled — slot freed (${formatDateLong(new Date(b.date))})`,
    html: brandedEmail({
      title: "A slot just opened up.",
      intro: `<strong>${b.profiles?.name ?? "The customer"}</strong> cancelled their booking. The slot is back on your calendar and available for new requests.`,
      sectionLabel: "Cancelled booking",
      bullets: [
        `<strong>Event:</strong> ${b.event_name ?? "—"}`,
        `<strong>Service:</strong> ${b.services?.name ?? "—"}`,
        `<strong>When:</strong> ${formatDateLong(new Date(b.date))} at ${b.time_slot}`,
      ],
      ctas: [{ label: "Open dashboard", url: `${SITE_URL}/artist/dashboard`, primary: true }],
      signoff: "Hopefully another booking finds its way to you soon.<br/>&mdash; The Roop team",
    }),
  });
}

// ============================================================
// 5. Subscription paid — fires on POST /api/subscriptions/verify
//    after Razorpay signature checks out. Artist gets a receipt.
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

  await send({
    to: email,
    subject: `Receipt — Roop listing, ${monthLabel}`,
    html: brandedEmail({
      title: "Payment received.",
      intro: `Thank you, <strong>${firstName}</strong>. Your Roop listing is active for <strong>${monthLabel}</strong>.`,
      sectionLabel: "Receipt",
      bullets: [
        `<strong>Amount:</strong> ${formatPrice(s.amount)}`,
        `<strong>Period:</strong> ${monthLabel}`,
        s.razorpay_payment_id ? `<strong>Payment ID:</strong> ${s.razorpay_payment_id}` : null,
        `<strong>Status:</strong> Paid`,
        s.paid_at ? `<strong>Paid on:</strong> ${formatDateLong(new Date(s.paid_at))}` : null,
      ].filter(Boolean) as string[],
      ctas: [{ label: "Open dashboard", url: `${SITE_URL}/artist/dashboard`, primary: true }],
      signoff: "Keep this email for your records.<br/>&mdash; The Roop team",
      footerNote: "This is a receipt for your monthly listing fee. Replies reach a real human.",
    }),
  });
}

// ============================================================
// 6. Welcome email — sent once when a user signs up (email/password
//    OR first-time Google OAuth). Role-aware: customers get a
//    discover-the-platform CTA, Artists get a get-set-up CTA.
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

// Two voices, two templates:
//   • Artists get the full studio set-up email (intro paragraph, bullet
//     checklist, dual CTAs) — they need orientation.
//   • Customers get a short, evocative invite. The email is the
//     teaser; the magic lives on /welcome where the briefcase opens
//     and the personalised "Welcome, ${firstName}" moment plays.
function welcomeHtml({ firstName, isArtist }: { firstName: string; isArtist: boolean }) {
  return isArtist ? artistWelcomeHtml(firstName) : customerWelcomeHtml(firstName);
}

function artistWelcomeHtml(firstName: string) {
  return brandedEmail({
    title: "Welcome to Roop,",
    titleAccent: `${firstName}.`,
    intro: `Your craft just found its stage. Roop is built by and for India&rsquo;s beauty Artists &mdash; a curated home where your work gets the showcase it deserves, your calendar belongs to you, and verified clients come to <em>you</em>. We can&rsquo;t wait to see your portfolio come to life.`,
    sectionLabel: "Your studio set-up",
    bullets: [
      "Upload 5+ portfolio photos",
      "List your services &amp; rates",
      "Add your cancellation policy",
      "Get verified and go live on Discover",
    ],
    ctas: [
      { label: "Open your dashboard", url: `${SITE_URL}/artist/dashboard`, primary: true },
      { label: "How Roop works", url: `${SITE_URL}/for-artists`, primary: false },
    ],
    signoff: "We can&rsquo;t wait to see what you create.<br/>&mdash; The Roop team",
    footerNote: "You received this because you just joined Roop. We keep nudges rare and meaningful.",
  });
}

function customerWelcomeHtml(firstName: string) {
  // Customer welcome is image-driven: a looping GIF of a gold envelope
  // opening and a letter rising out of it carries the brand moment.
  // The body copy stays under 20 words, with one gold CTA → /discover.
  // No /welcome bounce — the magic lives inside the inbox.
  const heroUrl = `${SITE_URL}/email-hero.gif`;
  const ctaUrl = `${SITE_URL}/discover`;
  const namePart = firstName
    ? `<span style="font-style:italic;color:#E8B86D;">${firstName}</span>.`
    : "to your moment.";

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
              <td style="padding:0;font-size:0;line-height:0;">
                <a href="${ctaUrl}" style="display:block;text-decoration:none;">
                  <img src="${heroUrl}" alt="Welcome to Roop" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;" />
                </a>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:32px 40px 8px;">
                <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;color:#F5E9D7;margin:0;font-weight:normal;">
                  Welcome${firstName ? "," : ""} ${namePart}
                </h1>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:0 40px 4px;">
                <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:#D4B896;margin:0;">Your moment is ready.</p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:26px 40px 36px;">
                <a href="${ctaUrl}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#E8B86D,#A8875E);color:#1A0710;text-decoration:none;border-radius:999px;font-weight:600;font-size:14px;font-family:Arial,Helvetica,sans-serif;">Begin</a>
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
