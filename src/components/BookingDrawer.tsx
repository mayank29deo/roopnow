"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronLeft, ChevronRight, Check, Clock, Calendar,
  Sparkles, Loader2, MapPin, LogIn, IndianRupee, PartyPopper, Phone,
} from "lucide-react";
import { formatPrice, formatDateLong } from "@/lib/utils";
import { format } from "date-fns";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import type { AvailabilityInput } from "@/lib/availability";

type Service = {
  id: string; name: string; description: string;
  duration: number; price: number; category: string;
};
type Artist = {
  id: string; displayName: string; avatarUrl: string;
  city: string; area: string; services: Service[];
};

const slots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

export function BookingDrawer({
  artist, user, service, availability, onClose, onChangeService,
}: {
  artist: Artist;
  user: { id: string; name: string; role: string } | null;
  service: Service | null;
  availability: AvailabilityInput;
  onClose: () => void;
  onChangeService: (s: Service) => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [date, setDate] = useState<Date | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [eventName, setEventName] = useState("");
  const [budget, setBudget] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setStep(1);
    setDate(null);
    setSlot(null);
    setEventName("");
    setBudget("");
    setAddress("");
    setPhone("");
    setNotes("");
    setError(null);
    onClose();
  }

  async function confirm() {
    if (!service || !date || !slot || !eventName || !address || !phone) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId: artist.id,
          serviceId: service.id,
          date: date.toISOString(),
          timeSlot: slot,
          eventName,
          budget: budget ? Number(budget) : undefined,
          address,
          phone,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      router.refresh();
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const open = service !== null;
  const canContinueStep2 = date && slot;
  const canSubmit = !!(address && eventName && phone);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={reset}
            className="fixed inset-0 bg-bg/70 backdrop-blur-md z-[99]"
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[520px] bg-bg-soft border-l border-border-strong z-[100] flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <img src={artist.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="font-semibold">{artist.displayName}</div>
                  <div className="text-xs text-ink-dim">Step {Math.min(step, 3)} of 3 · Request a booking</div>
                </div>
              </div>
              <button onClick={reset} className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center">
                <X size={16} />
              </button>
            </div>

            <div className="px-5 py-2 border-b border-border shrink-0">
              <div className="flex gap-1.5">
                {[1, 2, 3].map((n) => (
                  <div key={n} className={`flex-1 h-1 rounded-full transition-colors ${
                    step >= n ? "bg-gradient-to-r from-gold-bright to-gold-deep" : "bg-surface-2"
                  }`} />
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {!user && step < 4 && (
                <div className="glass rounded-2xl p-5 mb-5 border-gold/30">
                  <div className="flex gap-3 items-start">
                    <LogIn size={20} className="text-gold mt-0.5" />
                    <div>
                      <div className="font-semibold mb-1">Sign in to send this request</div>
                      <div className="text-sm text-ink-dim mb-3">
                        The Artist needs your verified contact details.
                      </div>
                      <div className="flex gap-2">
                        <Link href="/login" className="btn-ghost text-xs py-2 px-3">Log in</Link>
                        <Link href="/signup" className="btn-primary text-xs py-2 px-3">Sign up</Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && service && (
                <div>
                  <h3 className="font-display text-2xl mb-1">Choose a service</h3>
                  <p className="text-sm text-ink-dim mb-5">Pick what you&apos;d like this Artist to do.</p>
                  <div className="space-y-3">
                    {artist.services.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => onChangeService(s)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all ${
                          service.id === s.id
                            ? "border-gold bg-gradient-to-br from-gold/10 to-transparent"
                            : "border-border bg-surface/50 hover:border-gold/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-[10px] uppercase tracking-widest text-gold mb-1">{s.category}</div>
                            <div className="font-semibold truncate">{s.name}</div>
                            <div className="text-xs text-ink-dim line-clamp-2 mt-1">{s.description}</div>
                            <div className="text-xs text-ink-dim mt-2 flex items-center gap-1">
                              <Clock size={10} /> {s.duration} min
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-display text-xl text-gradient-rose">{formatPrice(s.price)}</div>
                            {service.id === s.id && (
                              <div className="mt-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-gold text-wine-deep">
                                <Check size={14} />
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && service && (
                <div>
                  <h3 className="font-display text-2xl mb-1">Pick date & time</h3>
                  <p className="text-sm text-ink-dim mb-5">
                    Unavailable dates are shown in red. Pick a free or partially-booked day.
                  </p>

                  <div className="mb-6 p-4 rounded-2xl bg-surface/50 border border-border">
                    <AvailabilityCalendar
                      availability={availability}
                      value={date}
                      onPick={(d) => { setDate(d); setSlot(null); }}
                      compact
                    />
                  </div>

                  {date && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="text-xs uppercase tracking-widest text-ink-dim mb-3 flex items-center gap-1.5">
                        <Clock size={12} className="text-gold" /> Time slot · {format(date, "EEE, d MMM")}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {slots.map((s) => (
                          <button
                            key={s}
                            onClick={() => setSlot(s)}
                            className={`p-2.5 rounded-xl text-sm border transition-all ${
                              slot === s
                                ? "border-gold bg-gradient-to-br from-gold/20 to-transparent"
                                : "border-border bg-surface/50 hover:border-gold/40"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {step === 3 && service && (
                <div>
                  <h3 className="font-display text-2xl mb-1">Event details</h3>
                  <p className="text-sm text-ink-dim mb-5">Help the Artist prep for your day.</p>

                  <label className="block mb-4">
                    <span className="text-xs uppercase tracking-widest text-ink-dim mb-2 block flex items-center gap-1.5">
                      <PartyPopper size={12} className="text-gold" /> Event name
                    </span>
                    <input
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      placeholder="Wedding · Reception · Birthday · Haldi…"
                      className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-gold/50 outline-none"
                    />
                  </label>

                  <label className="block mb-4">
                    <span className="text-xs uppercase tracking-widest text-ink-dim mb-2 block flex items-center gap-1.5">
                      <MapPin size={12} className="text-gold" /> Location where Artist should arrive
                    </span>
                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Your home, venue, or studio address"
                      className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-gold/50 outline-none"
                    />
                  </label>

                  <label className="block mb-4">
                    <span className="text-xs uppercase tracking-widest text-ink-dim mb-2 block flex items-center gap-1.5">
                      <Phone size={12} className="text-gold" /> Mobile / WhatsApp number
                    </span>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98XXX XXXXX"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-gold/50 outline-none"
                    />
                    <span className="text-[11px] text-ink-dim mt-1.5 block">
                      The Artist will use this to confirm logistics and reach you on the day.
                    </span>
                  </label>

                  <label className="block mb-4">
                    <span className="text-xs uppercase tracking-widest text-ink-dim mb-2 block flex items-center gap-1.5">
                      <IndianRupee size={12} className="text-gold" /> Budget (optional)
                    </span>
                    <input
                      value={budget}
                      onChange={(e) => setBudget(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="e.g. 15000"
                      inputMode="numeric"
                      className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-gold/50 outline-none"
                    />
                  </label>

                  <label className="block mb-6">
                    <span className="text-xs uppercase tracking-widest text-ink-dim mb-2 block">Notes (optional)</span>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any allergies, preferences, or look references to share?"
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-gold/50 outline-none resize-none"
                    />
                  </label>

                  <div className="glass rounded-2xl p-5">
                    <div className="text-xs uppercase tracking-widest text-gold mb-3">Request summary</div>
                    <div className="space-y-2 text-sm">
                      <Row label="Service" value={service.name} />
                      <Row label="Date" value={date ? formatDateLong(date) : "—"} />
                      <Row label="Time" value={slot || "—"} />
                      <div className="h-px bg-border my-2" />
                      <Row label="Quoted price" value={formatPrice(service.price)} big />
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 text-sm text-rose bg-rose/10 border border-rose/30 rounded-xl px-4 py-3">
                      {error}
                    </div>
                  )}
                </div>
              )}

              {step === 4 && service && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="py-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-gold-bright to-gold-deep flex items-center justify-center mb-6"
                  >
                    <Check size={40} className="text-wine-deep" strokeWidth={3} />
                  </motion.div>
                  <h3 className="font-display text-4xl mb-3">Request sent!</h3>
                  <p className="text-ink-dim mb-8">
                    {artist.displayName} will review your request and get back with an accept or reject.
                    You&apos;ll be notified by email the moment they respond.
                  </p>
                  <div className="glass rounded-2xl p-5 mb-6 text-left">
                    <Row label="Event" value={eventName} />
                    <Row label="Artist" value={artist.displayName} />
                    <Row label="When" value={`${date ? formatDateLong(date) : ""} at ${slot}`} />
                    <Row label="Status" value="Pending" big />
                  </div>
                  <Link href="/dashboard" onClick={reset} className="btn-primary w-full">
                    Track my requests
                  </Link>
                </motion.div>
              )}
            </div>

            {step < 4 && (
              <div className="p-5 border-t border-border shrink-0 flex gap-3">
                {step > 1 && (
                  <button onClick={() => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s))} className="btn-ghost">
                    <ChevronLeft size={16} /> Back
                  </button>
                )}
                {step < 3 ? (
                  <button
                    onClick={() => {
                      if (step === 1 && service) setStep(2);
                      else if (step === 2 && canContinueStep2) setStep(3);
                    }}
                    disabled={step === 2 && !canContinueStep2}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={confirm}
                    disabled={loading || !user || !canSubmit}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <><Sparkles size={14} /> Send request</>}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-dim text-xs uppercase tracking-wider">{label}</span>
      <span className={big ? "font-display text-xl text-gradient-rose" : "text-ink font-medium"}>{value}</span>
    </div>
  );
}
