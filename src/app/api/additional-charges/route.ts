import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, getSessionUser } from "@/lib/supabase/server";

const schema = z.object({
  artistId: z.string(),
  name: z.string().min(2).max(80),
  description: z.string().max(500).optional().default(""),
});

// Create a single Additional Charge row (travel fee, early-morning,
// GST, etc.). RLS already restricts inserts to rows whose artist
// belongs to auth.uid(), but we also block cross-artist writes here.
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "artist") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = schema.parse(await req.json());
    if (data.artistId !== user.artistId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = await createClient();

    // Append to the end of the artist's existing list (max sort_order + 1).
    const { data: tail } = await supabase
      .from("additional_charges")
      .select("sort_order")
      .eq("artist_id", data.artistId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextSort = (tail?.sort_order ?? -1) + 1;

    const { data: row, error } = await supabase
      .from("additional_charges")
      .insert({
        artist_id: data.artistId,
        name: data.name,
        description: data.description,
        sort_order: nextSort,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, charge: row });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
