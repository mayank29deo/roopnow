"use client";
import { useRef, useState } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import { Check, Loader2, X } from "lucide-react";
import "react-image-crop/dist/ReactCrop.css";

// Aspect-ratio-locked image cropper. Used by ImagePicker — when an
// artist picks a file we route through this modal first, then upload
// the cropped output. Pasting a URL skips the crop (assume the artist
// already prepared that image).
//
// aspect is a number (width/height): 1 for square (DP), 16/9 for
// banner. Output is a JPEG Blob at the source image's resolution
// within the crop rectangle — no downscaling, so quality is preserved.
export function CropModal({
  src,
  aspect,
  onCancel,
  onConfirm,
}: {
  src: string;
  aspect: number;
  onCancel: () => void;
  onConfirm: (blob: Blob) => Promise<void> | void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completed, setCompleted] = useState<PixelCrop | null>(null);
  const [working, setWorking] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    // Default: largest centred crop matching the aspect, ~90% of the image.
    const initial = centerCrop(
      makeAspectCrop({ unit: "%", width: 90 }, aspect, w, h),
      w,
      h,
    );
    setCrop(initial);
  }

  async function apply() {
    if (!imgRef.current || !completed) return;
    setErr(null);
    setWorking(true);
    try {
      const blob = await canvasBlob(imgRef.current, completed);
      await onConfirm(blob);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Crop failed");
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-md">
      <div className="w-full max-w-3xl rounded-3xl border border-border-strong bg-bg-soft p-5 lg:p-7 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-2xl">Crop your image</h3>
            <p className="text-xs text-ink-dim mt-1">
              Drag the corners to frame the part that matters. Aspect is locked.
            </p>
          </div>
          <button
            onClick={onCancel}
            aria-label="Cancel"
            className="w-10 h-10 rounded-full border border-border hover:border-rose/40 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-auto rounded-2xl bg-surface/30 border border-border flex items-center justify-center min-h-[40vh]">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompleted(c)}
            aspect={aspect}
            keepSelection
            minWidth={50}
            minHeight={50}
            className="max-h-[60vh]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={src}
              alt=""
              onLoad={onImageLoad}
              style={{ maxHeight: "60vh", display: "block" }}
            />
          </ReactCrop>
        </div>

        {err && (
          <div className="mt-3 text-sm text-rose bg-rose/10 border border-rose/30 rounded-xl px-4 py-3">
            {err}
          </div>
        )}

        <div className="mt-5 flex gap-3">
          <button onClick={onCancel} className="btn-ghost flex-1">Cancel</button>
          <button
            onClick={apply}
            disabled={working || !completed || completed.width < 1}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {working ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <><Check size={14} /> Apply &amp; upload</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Render the crop rectangle onto a canvas at the source image's
// natural resolution within the rect, then export as a JPEG blob.
function canvasBlob(img: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(crop.width * scaleX));
    canvas.height = Math.max(1, Math.round(crop.height * scaleY));
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("Canvas 2D unsupported"));
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      img,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Failed to encode crop"));
        resolve(blob);
      },
      "image/jpeg",
      0.92,
    );
  });
}
