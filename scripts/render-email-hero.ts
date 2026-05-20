// Renders the /internal/email-hero animation into a looping GIF that
// the customer welcome email embeds inline.
//
// Usage:
//   1. Start the dev server in another shell:  npm run dev
//   2. Then run this script:                   npx tsx scripts/render-email-hero.ts
//
// Output: public/email-hero.gif (looping forever via -loop 0)

import puppeteer from "puppeteer";
import ffmpegPath from "ffmpeg-static";
import { spawnSync } from "child_process";
import { mkdirSync, rmSync, existsSync, writeFileSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const TMP = join(ROOT, ".tmp-render");
const OUT = join(ROOT, "public", "email-hero.gif");

const URL = "http://localhost:4001/internal/email-hero";
const VIEWPORT = { width: 600, height: 400 };
const DEVICE_SCALE = 2;
const FPS = 20;
const DURATION_SEC = 7;
const FRAMES = FPS * DURATION_SEC;
const FRAME_INTERVAL_MS = 1000 / FPS;

async function main() {
  if (!ffmpegPath) throw new Error("ffmpeg-static did not provide a binary path");

  if (existsSync(TMP)) rmSync(TMP, { recursive: true });
  mkdirSync(TMP, { recursive: true });

  console.log("→ Launching puppeteer...");
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { ...VIEWPORT, deviceScaleFactor: DEVICE_SCALE },
  });
  const page = await browser.newPage();

  console.log(`→ Loading ${URL}...`);
  await page.goto(URL, { waitUntil: "networkidle0", timeout: 30_000 });
  // Hide the Next.js dev-tools indicator so it doesn't appear in any frame.
  await page.addStyleTag({
    content: `
      nextjs-portal,
      [data-nextjs-toast],
      [data-next-mark-loading],
      #__next-route-announcer__ { display: none !important; }
    `,
  });
  // Let framer-motion settle into its initial frame before we start.
  await new Promise((r) => setTimeout(r, 600));

  console.log(`→ Capturing ${FRAMES} frames at ${FPS}fps over ${DURATION_SEC}s...`);
  const startTime = Date.now();
  for (let i = 0; i < FRAMES; i++) {
    const target = startTime + i * FRAME_INTERVAL_MS;
    const wait = target - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    const buf = await page.screenshot({
      type: "png",
      clip: { x: 0, y: 0, ...VIEWPORT },
      omitBackground: false,
    });
    writeFileSync(
      join(TMP, `frame_${String(i).padStart(3, "0")}.png`),
      buf as Buffer
    );
  }
  await browser.close();

  console.log("→ Assembling GIF via ffmpeg (lanczos + palette gen + bayer dither)...");
  const filter =
    "scale=600:-1:flags=lanczos,split[s0][s1];" +
    "[s0]palettegen=max_colors=128:stats_mode=full[p];" +
    "[s1][p]paletteuse=dither=bayer:bayer_scale=5";
  const args = [
    "-y",
    "-framerate", String(FPS),
    "-i", join(TMP, "frame_%03d.png"),
    "-vf", filter,
    "-loop", "0",
    OUT,
  ];
  const result = spawnSync(ffmpegPath, args, { stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`ffmpeg exited with status ${result.status}`);
  }

  rmSync(TMP, { recursive: true });
  const sizeKB = (statSync(OUT).size / 1024).toFixed(1);
  console.log(`✓ Wrote ${OUT} (${sizeKB} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
