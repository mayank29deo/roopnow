import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, getSessionUser } from "@/lib/supabase/server";

// 6-Oct tracker item 3: generic PATCH /api/profile so any
// authenticated user (customer OR artist) can update their own
// profile row — name + phone. The /api/artist route handles the
// deeper artist-dashboard fields; this one is the lightweight
// customer counterpart that works for both roles.
const schema = z.object({
  name: z.string().min(2).max(60).optional(),
  phone: z.string().max(20).optional(),
});

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) update.name = body.name.trim();
  if (typeof body.phone === "string") update.phone = body.phone.trim() || null;
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const supabase = await createClient();
  // profiles RLS already restricts UPDATE to auth.uid() = id —
  // the row we touch is implicitly the user's own.
  const { data, error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", user.id)
    .select()
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, profile: data });
}
