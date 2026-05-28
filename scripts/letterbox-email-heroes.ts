// Center-crops every JPG/PNG in /public/email-images/ to a 600x338
// (16:9) letterbox so the email hero never overruns the card height.
//
// Usage:  npx tsx scripts/letterbox-email-heroes.ts
//
// Why 16:9: portrait source images render extremely tall when scaled
// to the 600 px email card (e.g. a 675x1200 source becomes 600x1067).
// 16:9 is the standard hero aspect — it sits cleanly above the
// headline + body without forcing the recipient to scroll past a
// poster before they see any copy.
//
// The script overwrites the originals in place; previous bytes live
// in the prior git commit if rollback is needed.

import ffmpegPath from "ffmpeg-static";
import { spawnSync } from "child_process";
import { readdirSync, renameSync, unlinkSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, "..", "public", "email-images");
const TARGET_W = 600;
const TARGET_H = 338; // 16:9 of 600

// Per-file vertical crop bias. Center works for most heroes, but some
// images have their subject anchored to the top (e.g. the wax-seal
// frame, where the seal sits at the very top of the source) and a
// center crop would lose it.
type Bias = "top" | "center" | "bottom";
const CROP_BIAS: Record<string, Bias> = {
  "confirmed.jpg": "top", // wax-seal anchor lives at the top
};
const DEFAULT_BIAS: Bias = "center";

function yOffset(bias: Bias): string {
  switch (bias) {
    case "top":    return "0";
    case "bottom": return "ih-iw*9/16";
    default:       return "(ih-iw*9/16)/2";
  }
}

if (!ffmpegPath) {
  console.error("ffmpeg-static did not provide a binary path");
  process.exit(1);
}

const files = readdirSync(DIR).filter((f) => /\.(jpe?g|png)$/i.test(f));
if (files.length === 0) {
  console.log("No images found in", DIR);
  process.exit(0);
}

let ok = 0;
let skipped = 0;

for (const f of files) {
  const src = join(DIR, f);
  const tmp = join(DIR, `_letterbox_tmp_${f}`);
  const bias = CROP_BIAS[f] ?? DEFAULT_BIAS;
  const y = yOffset(bias);

  const result = spawnSync(
    ffmpegPath,
    [
      "-y",
      "-i", src,
      // Crop a horizontal strip of width=full and height=(width*9/16),
      // anchored vertically per the bias config above, then scale down
      // to the target letterbox dimensions.
      "-vf", `crop=iw:iw*9/16:0:${y},scale=${TARGET_W}:${TARGET_H}:flags=lanczos`,
      "-q:v", "2", // high JPEG quality (2 = "visually lossless" baseline)
      tmp,
    ],
    { stdio: "pipe" },
  );

  if (result.status !== 0) {
    console.error(`✗ ${f} — ffmpeg failed`);
    console.error(result.stderr?.toString());
    if (existsSafe(tmp)) unlinkSync(tmp);
    skipped++;
    continue;
  }

  renameSync(tmp, src);
  const sizeKB = (statSync(src).size / 1024).toFixed(1);
  console.log(`✓ ${f} (${bias}) → ${TARGET_W}×${TARGET_H} (${sizeKB} KB)`);
  ok++;
}

console.log(`\n${ok} cropped, ${skipped} skipped.`);

function existsSafe(p: string): boolean {
  try {
    statSync(p);
    return true;
  } catch {
    return false;
  }
}
