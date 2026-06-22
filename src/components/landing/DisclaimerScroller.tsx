// Homepage disclaimer marquee (Sheet 1 — OTHER #2).
//
// Client text: "Roop is not accountable for the final outcome of
// the booking." Renders as a slow, horizontal scrolling band. Pure
// CSS animation — no JS, no framer-motion overhead.

const PHRASE =
  "ROOP is a beauty booking management platform and we do not take any responsibility of the quality of the output by any Makeup Artist";
const SEPARATOR = "·";

// Repeated enough times that the inner row is wider than any
// realistic viewport, so the -50% translate loop reads as continuous.
// The phrase itself is long, so we need fewer copies than before.
const REPEAT = 4;

export function DisclaimerScroller() {
  const items = Array.from({ length: REPEAT }, (_, i) => i);
  return (
    <div
      aria-label="Disclaimer"
      className="relative overflow-hidden border-y border-border bg-bg/60 backdrop-blur-sm"
    >
      <div className="flex w-fit animate-disclaimer-scroll whitespace-nowrap py-3">
        {/* Two identical halves so the -50% loop has no visible seam */}
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0 items-center gap-8 pr-8">
            {items.map((i) => (
              <span
                key={`${half}-${i}`}
                className="flex items-center gap-8 text-[11px] uppercase tracking-[0.32em] text-ink-dim"
              >
                <span>{PHRASE}</span>
                <span className="text-gold/60">{SEPARATOR}</span>
              </span>
            ))}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes disclaimer-scroll {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-50%, 0, 0); }
        }
        .animate-disclaimer-scroll {
          animation: disclaimer-scroll 120s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-disclaimer-scroll { animation: none; }
        }
      `}</style>
    </div>
  );
}
