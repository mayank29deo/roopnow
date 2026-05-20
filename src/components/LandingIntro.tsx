"use client";
import { useEffect, useState } from "react";
import { BriefcaseOpen } from "./BriefcaseOpen";

// First-load brand intro: the gold makeup briefcase opens, the Roop
// logo blooms in the gap, then the whole kit slides away to reveal the
// landing page. Plays once per browser session, skips for
// prefers-reduced-motion users.
//
// The actual animation lives in <BriefcaseOpen /> so /welcome can
// replay it on demand.
export function LandingIntro() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("roop_intro_seen") === "1") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sessionStorage.setItem("roop_intro_seen", "1");
      return;
    }
    sessionStorage.setItem("roop_intro_seen", "1");
    setShow(true);
  }, []);

  if (!show) return null;
  return <BriefcaseOpen onDone={() => setShow(false)} />;
}
