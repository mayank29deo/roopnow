import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Sparkles, User } from "lucide-react";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { EditProfileCard } from "@/components/EditProfileCard";

// 11-Oct tracker: shared /profile entry point reachable from the
// Nav dropdown. Customers edit name + phone here. Artists get the
// same minimum fields plus a prompt that points them to their
// richer /artist/dashboard Profile tab for everything else
// (studio, services, availability, cancellation policy, etc.)
// Admins just see the basic editor — they don't have an artist row.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit profile — Roop",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("name, phone, email")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <section className="py-14 lg:py-20">
      <div className="max-w-2xl mx-auto px-5 lg:px-8">
        <div className="chip mb-4"><User size={12} className="text-gold" /> Account</div>
        <h1 className="font-display text-5xl lg:text-6xl mb-3">Edit profile</h1>
        <p className="text-ink-dim mb-10">
          Update the details Roop uses to contact you and label your bookings.
        </p>

        <EditProfileCard
          initialName={profileRow?.name ?? user.name}
          initialPhone={profileRow?.phone ?? null}
          email={profileRow?.email ?? user.email ?? ""}
        />

        {user.role === "artist" && (
          <div className="mt-8 rounded-3xl border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gold/15 border border-gold/30 text-gold flex items-center justify-center shrink-0">
                <Sparkles size={17} />
              </div>
              <div className="min-w-0">
                <div className="font-display text-xl mb-1">Looking for your studio details?</div>
                <p className="text-sm text-ink-dim leading-relaxed mb-3">
                  Studio name, tagline, bio, services, portfolio, availability, cancellation
                  policy and more live on the full artist dashboard.
                </p>
                <Link href="/artist/dashboard" className="btn-primary text-sm py-2 px-4 inline-flex">
                  Open your dashboard <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
