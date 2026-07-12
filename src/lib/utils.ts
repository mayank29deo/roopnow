export function formatPrice(rupees: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

// 12-Jul: pin every date formatter to Asia/Kolkata. Without an
// explicit timeZone, Intl uses the process's local zone — Vercel
// serverless runs in UTC, so an IST-midnight booking timestamp
// (stored as the previous UTC day at 18:30) rendered as d-1 in
// every server-rendered surface: the artist request card, the
// customer email, the summary strip. Passing timeZone lets the
// same code produce the correct IST calendar day both on the
// browser and on the server.
const IST = "Asia/Kolkata";

export function formatDateLong(d: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: IST,
  }).format(d);
}

export function formatDateShort(d: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: IST,
  }).format(d);
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
