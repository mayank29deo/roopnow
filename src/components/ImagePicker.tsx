"use client";
import { useRef, useState } from "react";
import { Upload, Link2, Loader2, Image as ImageIcon, X, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CropModal } from "./CropModal";

type Aspect = "square" | "wide" | "portrait";

const aspectClasses: Record<Aspect, string> = {
  square: "aspect-square",
  wide: "aspect-[16/9]",
  portrait: "aspect-[4/5]",
};

// Numeric aspect (width/height) the CropModal locks to.
const aspectRatios: Record<Aspect, number> = {
  square: 1,
  wide: 16 / 9,
  portrait: 4 / 5,
};

// Drag-drop / browse file picker that uploads to a public Supabase Storage bucket
// and emits the resulting public URL via onChange. Falls back to a URL paste field
// (always available) so artists who already host their photos elsewhere aren't blocked.
export function ImagePicker({
  bucket,
  folder,
  value,
  onChange,
  aspect = "wide",
  label,
  helper,
  maxMB = 8,
}: {
  bucket: "portfolio" | "avatars";
  folder: string;
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  aspect?: Aspect;
  label?: string;
  helper?: string;
  maxMB?: number;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  // Picked file → object URL → CropModal → cropped Blob → uploaded.
  // We hold the source URL here so the modal can render it.
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  function pickFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please pick an image (JPG, PNG, or WebP).");
      return;
    }
    if (file.size > maxMB * 1024 * 1024) {
      setError(`File too large — max ${maxMB} MB.`);
      return;
    }
    // Hand off to the crop modal — the URL is revoked on confirm/cancel.
    setCropSrc(URL.createObjectURL(file));
  }

  function closeCrop() {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  }

  async function uploadBlob(blob: Blob) {
    setError(null);
    setUploading(true);
    try {
      const supabase = createClient();
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
      const { data, error: upErr } = await supabase.storage
        .from(bucket)
        .upload(path, blob, {
          cacheControl: "31536000",
          upsert: false,
          contentType: "image/jpeg",
        });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
      onChange(urlData.publicUrl);
      closeCrop();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      if (/bucket not found/i.test(msg)) {
        setError(`Storage bucket "${bucket}" isn't set up. Use Paste URL for now.`);
      } else if (/policy|row-level security|unauthorized/i.test(msg)) {
        setError("Storage permissions block this upload. Use Paste URL instead.");
      } else {
        setError(msg);
      }
    } finally {
      setUploading(false);
    }
  }

  function applyUrl() {
    const v = urlInput.trim();
    if (!v) return;
    onChange(v);
    setUrlInput("");
  }

  const ar = aspectClasses[aspect];

  if (value) {
    return (
      <div className="space-y-2">
        {label && <span className="text-xs uppercase tracking-widest text-ink-dim block">{label}</span>}
        <div className={`relative ${ar} max-h-72 rounded-2xl overflow-hidden border border-border-strong bg-surface`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove image"
            className="absolute top-2 right-2 w-9 h-9 rounded-full bg-rose/95 text-white flex items-center justify-center shadow-lg hover:bg-rose"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && <span className="text-xs uppercase tracking-widest text-ink-dim block">{label}</span>}

      <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-surface border border-border">
        {(["upload", "url"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError(null); }}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs transition-colors ${
              mode === m
                ? "bg-gradient-to-br from-gold to-amber text-wine-deep font-medium shadow-sm"
                : "text-ink-dim hover:text-ink"
            }`}
          >
            {m === "upload" ? <><Upload size={13} /> Upload</> : <><Link2 size={13} /> Paste URL</>}
          </button>
        ))}
      </div>

      {mode === "upload" ? (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) pickFile(f);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`w-full ${ar} max-h-64 rounded-2xl border-2 border-dashed border-border-strong bg-surface/40 hover:border-gold/60 hover:bg-surface/70 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer p-4 text-center ${uploading ? "opacity-60 pointer-events-none" : ""}`}
        >
          {uploading ? (
            <>
              <Loader2 className="animate-spin text-gold" size={22} />
              <span className="text-xs text-ink-dim">Uploading…</span>
            </>
          ) : (
            <>
              <ImageIcon size={22} className="text-gold" />
              <span className="text-sm">
                Drop image here or <span className="underline text-gold">browse</span>
              </span>
              <span className="text-[11px] text-ink-dim">PNG, JPG, WebP · up to {maxMB} MB</span>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) pickFile(f);
              e.target.value = "";
            }}
          />
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyUrl();
              }
            }}
            placeholder="https://…"
            className="dash-input flex-1"
          />
          <button
            type="button"
            onClick={applyUrl}
            disabled={!urlInput.trim()}
            className="btn-primary disabled:opacity-50 shrink-0"
          >
            <Check size={14} /> Use
          </button>
        </div>
      )}

      {helper && <p className="text-[11px] text-ink-dim italic">{helper}</p>}
      {error && <p className="text-xs text-rose">{error}</p>}

      {cropSrc && (
        <CropModal
          src={cropSrc}
          aspect={aspectRatios[aspect]}
          onCancel={closeCrop}
          onConfirm={uploadBlob}
        />
      )}
    </div>
  );
}
