import { NextRequest, NextResponse, after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyWelcome } from "@/lib/notify";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  phone: z.string().optional(),
  role: z.enum(["customer", "artist"]).default("customer"),
  // 6-Oct tracker item 1: artist signups collect their Insta handle
  // at the top of the funnel. Server stamps it onto the artist row
  // created by the handle_new_user trigger via a post-insert update
  // on the admin client (fresh signup has no session yet).
  instagram: z.string().max(60).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const data = schema.parse(await req.json());
    const supabase = await createClient();

    const { data: signupResult, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name, phone: data.phone, role: data.role },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 6-Oct tracker item 1: stamp Instagram onto the artist row the
    // handle_new_user trigger just inserted. Service-role client
    // because the signup response may not include a usable session
    // yet (depends on email-confirmation setting).
    const newUserId = signupResult?.user?.id;
    if (data.role === "artist" && data.instagram && newUserId) {
      after(async () => {
        try {
          const admin = createAdminClient();
          await admin.from("artists")
            .update({ instagram: data.instagram })
            .eq("user_id", newUserId);
        } catch (e) {
          console.error("artist instagram stamp failed:", e);
        }
      });
    }

    // The handle_new_user trigger creates the profile (and artist row if applicable).
    // Welcome email runs inside after() so the serverless runtime
    // keeps the promise alive past the response.
    after(async () => {
      try { await notifyWelcome({ email: data.email, name: data.name, role: data.role }); }
      catch (e) { console.error("welcome notify failed:", e); }
    });

    return NextResponse.json({ ok: true, role: data.role });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
