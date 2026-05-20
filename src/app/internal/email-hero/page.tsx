"use client";
import { motion } from "framer-motion";

// Internal render target for scripts/render-email-hero.ts — puppeteer
// loads this page, captures 72 frames at 24fps over 3s, and ffmpeg
// stitches them into /public/email-hero.gif (looping forever).
//
// Designed for a 600x400 viewport. Every animated value starts and
// ends on the SAME state so the looped GIF reads as continuous motion
// with no jump between iterations.

const DURATION = 6;

export default function EmailHero() {
  return (
    <div
      style={{
        // Cover the entire viewport at top z-index so the site Nav/Footer
        // from the root layout don't leak into the puppeteer screenshot.
        position: "fixed",
        top: 0,
        left: 0,
        width: 600,
        height: 400,
        background: "#1A0710",
        overflow: "hidden",
        zIndex: 9999,
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}
    >
      {/* Ambient gold glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 55% 50% at 50% 55%, rgba(201,169,126,0.35), transparent 70%)",
        }}
      />

      {/* Sparkles — twinkle while envelope is open */}
      {SPARKLES.map((s, i) => (
        <motion.div
          key={i}
          animate={{
            opacity: [0, 0, 0.85, 0.85, 0, 0],
            scale: [0.4, 0.4, 1, 1, 0.4, 0.4],
          }}
          transition={{
            duration: DURATION,
            times: [0, 0.32, 0.42, 0.7, 0.82, 1],
            repeat: Infinity,
            delay: s.delay,
          }}
          style={{
            position: "absolute",
            left: s.x,
            top: s.y,
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#E8B86D",
            boxShadow: "0 0 10px rgba(232,184,109,0.9)",
          }}
        />
      ))}

      {/* Envelope assembly — anchored bottom so the open flap has headroom */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 200,
          transform: "translateX(-50%)",
          width: 320,
          height: 180,
          perspective: 1200,
        }}
      >
        {/* Back of the envelope (sits behind the letter) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 12,
            background:
              "linear-gradient(180deg,#C9A36E 0%,#A8875E 100%)",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
          }}
        />

        {/* Letter that rises out of the envelope. Holds fully extended
            for ~2s (cycle position 0.40 → 0.70) so the recipient has
            time to read "Welcome to Roop". */}
        <motion.div
          animate={{
            y: [50, 50, -110, -110, 50, 50],
            opacity: [0, 0, 1, 1, 0, 0],
          }}
          transition={{
            duration: DURATION,
            times: [0, 0.22, 0.40, 0.70, 0.82, 1],
            repeat: Infinity,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            position: "absolute",
            left: 22,
            right: 22,
            top: 10,
            height: 160,
            borderRadius: 8,
            background:
              "linear-gradient(180deg,#FAF1DE 0%,#F0E1C6 100%)",
            boxShadow:
              "0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.7)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 18px",
            color: "#1A0710",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: 9,
              letterSpacing: "0.32em",
              color: "#A8875E",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            You&apos;re Invited
          </div>
          <div
            style={{
              fontSize: 28,
              letterSpacing: "0.04em",
              color: "#6B1E2E",
              fontWeight: 500,
              lineHeight: 1.1,
              textAlign: "center",
            }}
          >
            Welcome to <span style={{ color: "#A8875E", fontStyle: "italic" }}>Roop</span>
          </div>
          <div
            style={{
              fontSize: 8,
              letterSpacing: "0.36em",
              color: "#8A6D5C",
              textTransform: "uppercase",
              marginTop: 12,
            }}
          >
            Where creation meets the moment
          </div>
        </motion.div>

        {/* Front pocket — gold trapezoid with V-notch at the top so the
            letter visibly slides UP through the opening. Sits above the
            letter so the letter only shows once it clears the notch. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 12,
            background:
              "linear-gradient(180deg,#E8B86D 0%,#D4B586 55%,#A8875E 100%)",
            boxShadow:
              "inset 0 -3px 8px rgba(74,24,40,0.30), 0 18px 40px rgba(201,169,126,0.35)",
            clipPath:
              "polygon(0% 0%, 50% 36%, 100% 0%, 100% 100%, 0% 100%)",
            zIndex: 2,
          }}
        />

        {/* Flap — triangle, hinged at top, rotates back to open the
            envelope. Opens by cycle position 0.20 (well before the
            letter starts rising at 0.22) and stays open until 0.82
            (just after the letter has retreated). */}
        <motion.div
          animate={{
            rotateX: [0, 0, -175, -175, 0, 0],
          }}
          transition={{
            duration: DURATION,
            times: [0, 0.06, 0.20, 0.82, 0.94, 1],
            repeat: Infinity,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 65,
            transformOrigin: "50% 0%",
            transformStyle: "preserve-3d",
            background:
              "linear-gradient(180deg,#F0C57E 0%,#D8AA70 100%)",
            clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)",
            boxShadow: "inset 0 -2px 6px rgba(74,24,40,0.25)",
            zIndex: 3,
          }}
        />

        {/* Wax seal — present when flap is down, vanishes as it opens */}
        <motion.div
          animate={{
            opacity: [1, 1, 0, 0, 1, 1],
            scale: [1, 1, 0.6, 0.6, 1, 1],
          }}
          transition={{
            duration: DURATION,
            times: [0, 0.08, 0.18, 0.84, 0.94, 1],
            repeat: Infinity,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            position: "absolute",
            top: 42,
            left: "50%",
            width: 48,
            height: 48,
            marginLeft: -24,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 35% 30%, #8E2A3D 0%, #581A26 70%, #3A1220 100%)",
            boxShadow:
              "inset 0 -3px 6px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.15), 0 4px 8px rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            color: "#E8B86D",
            fontWeight: 600,
            letterSpacing: "0.02em",
            zIndex: 4,
          }}
        >
          R
        </motion.div>
      </div>

      {/* ROOP wordmark below — only fully visible while letter is out */}
      <motion.div
        animate={{
          opacity: [0, 0, 1, 1, 0, 0],
        }}
        transition={{
          duration: DURATION,
          times: [0, 0.32, 0.42, 0.70, 0.82, 1],
          repeat: Infinity,
        }}
        style={{
          position: "absolute",
          bottom: 22,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 11,
          letterSpacing: "0.36em",
          color: "rgba(201,169,126,0.55)",
          textTransform: "uppercase",
        }}
      >
        roopnow.com
      </motion.div>
    </div>
  );
}

const SPARKLES = [
  { x: 90, y: 80, delay: 0 },
  { x: 500, y: 100, delay: 0.15 },
  { x: 110, y: 280, delay: 0.3 },
  { x: 480, y: 290, delay: 0.05 },
  { x: 50, y: 200, delay: 0.2 },
  { x: 540, y: 180, delay: 0.4 },
  { x: 200, y: 60, delay: 0.25 },
  { x: 400, y: 70, delay: 0.1 },
];
