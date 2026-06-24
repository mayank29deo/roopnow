import { NextRequest, NextResponse } from "next/server";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { z } from "zod";

// Phase 4: `description` is optional now — the UI writes structured
// `inclusions` (green +) and `exclusions` (red −) bullet lists instead.
// description is still accepted for backward compat / older callers.
const schema = z.object({
  artistId: z.string(),
  name: z.string().min(2),
  description: z.string().optional().default(""),
  inclusions: z.string().optional().default(""),
  exclusions: z.string().optional().default(""),
  trialMakeupAvailable: z.boolean().optional().default(false),
  duration: z.number().int().min(15),
  price: z.number().int().min(100),
  category: z.string(),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "artist") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = schema.parse(await req.json());
    if (data.artistId !== user.artistId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const supabase = await createClient();
    const { data: service, error } = await supabase
      .from("services")
      .insert({
        artist_id: data.artistId,
        name: data.name,
        description: data.description,
        inclusions: data.inclusions,
        exclusions: data.exclusions,
        trial_makeup_available: data.trialMakeupAvailable,
        duration: data.duration,
        price: data.price,
        category: data.category,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, service });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
