import { NextRequest, NextResponse, after } from "next/server";
import { createHmac } from "crypto";
import { getSessionUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifySubscriptionPaid } from "@/lib/notify";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "artist" || !user.artistId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { subscriptionId, paymentId, orderId, signature } = (await req.json()) as {
    subscriptionId: string; paymentId: string; orderId: string; signature: string;
  };

  const expected = createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  if (expected !== signature) {
    return NextResponse.json({ error: "Signature mismatch" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("artist_subscriptions")
    .update({
      status: "paid",
      razorpay_payment_id: paymentId,
      paid_at: new Date().toISOString(),
    })
    .eq("id", subscriptionId)
    .eq("artist_id", user.artistId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  after(async () => {
    try { await notifySubscriptionPaid(subscriptionId); }
    catch (e) { console.error("notify failed:", e); }
  });

  return NextResponse.json({ ok: true });
}
