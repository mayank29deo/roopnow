"use client";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

// The gold makeup briefcase opening animation, lifted out as a
// reusable primitive. Caller controls when (and whether) it plays
// and gets a callback when the exit animation has fully resolved.
//
// Used by:
//   • LandingIntro — once per session on first landing-page load
//   • /welcome — every time a new customer follows the email link
// Intro timings are tuned slow enough to read — feedback from
// users was that the original 2.7s flash went "very fast" (18-Jun
// tracker, item 6). All keyframe delays/durations below are scaled
// to fit comfortably inside this dismiss window.
export function BriefcaseOpen({
  onDone,
  autoDismissMs = 4500,
}: {
  onDone?: () => void;
  autoDismissMs?: number;
}) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (!autoDismissMs) return;
    const t = setTimeout(() => setShow(false), autoDismissMs);
    return () => clearTimeout(t);
  }, [autoDismissMs]);

  return (
    <AnimatePresence onExitComplete={() => onDone?.()}>
      {show && (
        <motion.div
          aria-hidden
          onClick={() => setShow(false)}
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden cursor-pointer"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: 80, scale: 0.96 }}
          transition={{ duration: 0.7, ease: [0.32, 0, 0.67, 0] }}
        >
          {/* Solid dark backdrop */}
          <motion.div
            className="absolute inset-0 bg-bg"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
          />
          {/* Soft gold glow */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 45% at center, rgba(201,169,126,0.30), transparent 65%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* Briefcase assembly */}
          <div className="relative w-[min(520px,88vw)] h-[300px]">
            {/* Top half — LID (clean gold finish) */}
            <motion.div
              className="absolute inset-x-0 top-0 h-1/2 rounded-t-[60px] overflow-hidden border border-gold/40"
              initial={{ y: 0, opacity: 0, scale: 0.92 }}
              animate={{ y: [0, 0, -135], opacity: [0, 1, 1], scale: [0.92, 1, 1] }}
              transition={{
                duration: 2.6,
                times: [0, 0.22, 1],
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                background:
                  "linear-gradient(180deg, #E8B86D 0%, #D4B586 55%, #A8875E 100%)",
                boxShadow:
                  "inset 0 -3px 10px rgba(74,24,40,0.30), inset 0 1px 0 rgba(255,255,255,0.5), 0 10px 36px rgba(201,169,126,0.45)",
              }}
            >
              {/* Engraved hairline along the inside edge */}
              <div className="absolute inset-3 rounded-t-[48px] border border-wine-deep/30 pointer-events-none" />
            </motion.div>

            {/* Bottom half — TRAY with makeup elements */}
            <motion.div
              className="absolute inset-x-0 bottom-0 h-1/2 rounded-b-[60px] overflow-hidden border border-gold/40"
              initial={{ y: 0, opacity: 0, scale: 0.92 }}
              animate={{ y: [0, 0, 135], opacity: [0, 1, 1], scale: [0.92, 1, 1] }}
              transition={{
                duration: 2.6,
                times: [0, 0.22, 1],
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                background:
                  "linear-gradient(180deg, #4A0E1E 0%, #2A0813 100%)",
                boxShadow:
                  "inset 0 3px 10px rgba(0,0,0,0.55), inset 0 -1px 0 rgba(201,169,126,0.2), 0 -8px 36px rgba(201,169,126,0.40)",
              }}
            >
              {/* Inset velvet "tray" frame */}
              <div className="absolute inset-3 rounded-b-[48px] border border-gold/15 pointer-events-none" />

              {/* Tray contents */}
              <div className="absolute inset-0 px-6 lg:px-8 py-4 flex flex-col gap-3 justify-center">
                {/* Eyeshadow palette — 8-pan strip */}
                <div className="flex gap-2 justify-center">
                  {SHADES.map((c, i) => (
                    <PowderPan key={i} color={c} delay={1.3 + i * 0.07} />
                  ))}
                </div>
                {/* Brushes + blush compacts */}
                <div className="flex gap-3 items-center justify-center">
                  {BRUSHES.map((b, i) => (
                    <HBrush key={`b${i}`} bristle={b.bristle} handle={b.handle} delay={1.85 + i * 0.1} />
                  ))}
                  {COMPACTS.map((c, i) => (
                    <CompactPan key={`c${i}`} color={c} delay={2.1 + i * 0.1} />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Roop logo — emerges in the gap between lid and tray */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0, scale: 0.5, filter: "blur(14px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ delay: 1.2, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src="/logo.png"
                alt="Roop"
                width={2400}
                height={1400}
                priority
                className="w-auto h-[150px] md:h-[180px] drop-shadow-[0_6px_28px_rgba(201,169,126,0.65)]"
              />
            </motion.div>
          </div>

          {/* Skip hint */}
          <motion.span
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[11px] uppercase tracking-[0.3em] text-ink-dim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 2.4, duration: 0.5 }}
          >
            Tap to skip
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Tray elements ────────────────────────────────────────────────

const SHADES = [
  "#F4D6C5", // soft cream
  "#E8B89A", // peach
  "#D89AAD", // rose
  "#B47F8F", // mauve
  "#8B4A6B", // plum
  "#C49066", // copper
  "#A66E4F", // bronze
  "#5C3A2E", // deep brown
];

const BRUSHES: { bristle: string; handle: string }[] = [
  { bristle: "#F5E9D7", handle: "#3A1220" }, // powder — cream tip, dark wood
  { bristle: "#E8B89A", handle: "#1A0710" }, // blush — peach tip, near-black
  { bristle: "#1A0710", handle: "#A8875E" }, // eye — black tip, gold handle
];

const COMPACTS = [
  "#C97D8E", // blush
  "#8B4A6B", // contour
];

function PowderPan({ color, delay }: { color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      className="w-7 h-7 lg:w-8 lg:h-8 rounded-full border border-black/40"
      style={{
        background: `radial-gradient(circle at 35% 30%, ${color} 0%, ${color}CC 60%, ${color}77 100%)`,
        boxShadow:
          "inset 0 -2px 5px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.25), 0 1px 2px rgba(0,0,0,0.5)",
      }}
    />
  );
}

function HBrush({ bristle, handle, delay }: { bristle: string; handle: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center"
    >
      {/* bristle tip */}
      <div
        className="w-3 h-3 rounded-l-full"
        style={{
          background: `linear-gradient(to right, ${bristle}, ${bristle}AA)`,
          boxShadow: "inset -1px 0 2px rgba(0,0,0,0.25)",
        }}
      />
      {/* gold ferrule */}
      <div
        className="w-1.5 h-3"
        style={{ background: "linear-gradient(to bottom, #E8B86D, #A8875E)" }}
      />
      {/* handle */}
      <div
        className="w-12 h-1.5 rounded-r-full"
        style={{
          background: `linear-gradient(to bottom, ${handle}, ${handle}DD)`,
          boxShadow: "0 1px 2px rgba(0,0,0,0.4)",
        }}
      />
    </motion.div>
  );
}

function CompactPan({ color, delay }: { color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="w-9 h-9 lg:w-11 lg:h-11 rounded-full border-2 border-gold/70"
      style={{
        background: `radial-gradient(circle at 35% 30%, ${color} 0%, ${color}AA 70%, ${color}55 100%)`,
        boxShadow:
          "inset 0 -3px 6px rgba(0,0,0,0.55), inset 0 1px 2px rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.5)",
      }}
    />
  );
}
