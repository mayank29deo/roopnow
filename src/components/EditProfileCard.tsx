"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, User, Phone, Mail, Edit3 } from "lucide-react";

// 6-Oct tracker item 3: customer-side profile editor. Compact
// expand-on-tap card so the dashboard still leads with bookings
// but the user can nudge their name / phone in-place. Artists
// have the fuller /artist/dashboard Profile tab for everything
// else; this is the shared minimum both roles can use.
export function EditProfileCard({
  initialName, initialPhone, email,
}: {
  initialName: string;
  initialPhone: string | null;
  email: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dirty = name.trim() !== initialName || (phone.trim() || null) !== (initialPhone || null);

  async function save() {
    setSaving(true); setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSavedAt(Date.now());
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-3xl border border-border bg-surface/40 p-5 flex items-center justify-between gap-4 w-full text-left hover:border-gold/40 transition-colors"
      >
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-ink-dim mb-1">Profile</div>
          <div className="font-medium truncate">{initialName}</div>
          <div className="text-xs text-ink-dim truncate">
            {email}{initialPhone ? ` · ${initialPhone}` : ""}
          </div>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1.5 text-sm text-gold">
          <Edit3 size={14} /> Edit
        </span>
      </button>
    );
  }

  return (
    <div className="rounded-3xl border border-gold/30 bg-gradient-to-br from-gold/5 to-transparent p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-gold mb-1">Edit profile</div>
          <div className="text-sm text-ink-dim">Update your name and phone. Email + password are managed in your account settings.</div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="text-[10px] uppercase tracking-widest text-ink-dim mb-1 flex items-center gap-1.5">
            <User size={11} className="text-gold" /> Full name
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-gold/50 outline-none"
            placeholder="Your name"
          />
        </label>

        <label className="block">
          <span className="text-[10px] uppercase tracking-widest text-ink-dim mb-1 flex items-center gap-1.5">
            <Phone size={11} className="text-gold" /> Phone / WhatsApp
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-gold/50 outline-none"
            placeholder="+91 00000 00000"
          />
        </label>

        <div className="rounded-xl border border-border bg-surface/40 px-4 py-2.5 flex items-center gap-2 text-xs text-ink-dim">
          <Mail size={11} className="text-gold" /> {email}
          <span className="ml-auto">Email cannot be changed here.</span>
        </div>
      </div>

      {error && <div className="text-sm text-rose mt-3">{error}</div>}
      {savedAt && !error && !dirty && <div className="text-sm text-emerald mt-3">Saved.</div>}

      <div className="flex gap-3 justify-end mt-4">
        <button
          onClick={() => {
            setOpen(false);
            setName(initialName);
            setPhone(initialPhone ?? "");
            setError(null);
          }}
          className="btn-ghost text-sm py-2 px-4"
        >
          Close
        </button>
        <button
          onClick={save}
          disabled={!dirty || saving}
          className="btn-primary text-sm py-2 px-4 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={13} /> : <><Check size={13} /> Save changes</>}
        </button>
      </div>
    </div>
  );
}
