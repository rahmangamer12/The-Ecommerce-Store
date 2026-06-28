"use client";

import { useState } from "react";
import Image from "next/image";
import { UploadCloud, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cloudinaryConfig } from "@/lib/cloudinary";

/**
 * Cloudinary image uploader for the admin.
 * - Uses an UNSIGNED preset if NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is set.
 * - Otherwise falls back to a SIGNED upload via /api/cloudinary/sign.
 * - Shows a clear message when Cloudinary isn't configured (still no crash).
 */
export function ImageUploader({
  onUploaded,
}: {
  onUploaded?: (url: string) => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { cloudName, uploadPreset } = cloudinaryConfig;
  const configured = Boolean(cloudName);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !cloudName) return;
    setLoading(true);

    try {
      const form = new FormData();
      form.append("file", file);

      if (uploadPreset) {
        // Unsigned upload
        form.append("upload_preset", uploadPreset);
      } else {
        // Signed upload — get a signature from our server
        const res = await fetch("/api/cloudinary/sign", { method: "POST" });
        if (!res.ok) {
          toast.error("Cloudinary not fully configured", {
            description: "Add an upload preset or API secret in .env.local.",
          });
          setLoading(false);
          return;
        }
        const sig = await res.json();
        form.append("api_key", sig.apiKey);
        form.append("timestamp", String(sig.timestamp));
        form.append("signature", sig.signature);
        form.append("folder", sig.folder);
      }

      const upload = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: form },
      );
      const data = await upload.json();
      if (data.secure_url) {
        setUrl(data.secure_url);
        onUploaded?.(data.secure_url);
        toast.success("Image uploaded");
      } else {
        toast.error("Upload failed", { description: data.error?.message });
      }
    } catch {
      toast.error("Upload failed. Check your Cloudinary settings.");
    } finally {
      setLoading(false);
    }
  }

  if (!configured) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-border p-4 text-sm text-ink-soft">
        <AlertCircle className="h-5 w-5 text-gold-strong" />
        <span>
          Add <code className="rounded bg-paper-2 px-1">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code>{" "}
          to <code className="rounded bg-paper-2 px-1">.env.local</code> to enable image uploads.
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <label className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-paper-2 text-center text-xs text-ink-soft transition-colors hover:border-gold">
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin text-gold-strong" />
        ) : (
          <UploadCloud className="h-6 w-6 text-gold-strong" />
        )}
        {loading ? "Uploading…" : "Upload image"}
        <input type="file" accept="image/*" onChange={handleFile} className="sr-only" disabled={loading} />
      </label>

      {url && (
        <div className="relative h-28 w-28 overflow-hidden rounded-xl border border-border">
          <Image src={url} alt="Uploaded" fill sizes="112px" className="object-cover" />
          <span className="absolute right-1 top-1 rounded-full bg-success p-0.5 text-white">
            <CheckCircle2 className="h-4 w-4" />
          </span>
        </div>
      )}
    </div>
  );
}
