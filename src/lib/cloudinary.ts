import crypto from "crypto";
import {
  cloudinaryCloudName,
  cloudinaryApiKey,
  cloudinaryApiSecret,
  cloudinaryUploadPreset,
  isCloudinaryConfigured,
} from "@/config/env";

export { isCloudinaryConfigured };

/**
 * Build an optimized Cloudinary delivery URL from a public id.
 * Returns the input untouched if it's already a full URL or Cloudinary
 * isn't configured (so the app keeps working with sample images).
 */
export function cloudinaryUrl(
  publicId: string,
  opts: { width?: number; height?: number; crop?: string; quality?: string } = {},
): string {
  if (!isCloudinaryConfigured || /^https?:\/\//.test(publicId)) return publicId;

  const t = [
    "f_auto",
    `q_${opts.quality ?? "auto"}`,
    opts.width && `w_${opts.width}`,
    opts.height && `h_${opts.height}`,
    opts.crop && `c_${opts.crop}`,
  ]
    .filter(Boolean)
    .join(",");

  return `https://res.cloudinary.com/${cloudinaryCloudName}/image/upload/${t}/${publicId}`;
}

/** True if direct UNSIGNED browser uploads are available (preset is set). */
export function canUnsignedUpload(): boolean {
  return Boolean(cloudinaryCloudName && cloudinaryUploadPreset);
}

/** True if SIGNED server-authorized uploads are available (api secret set). */
export function canSignedUpload(): boolean {
  return Boolean(cloudinaryCloudName && cloudinaryApiKey && cloudinaryApiSecret);
}

/**
 * Create a signature for a SIGNED Cloudinary upload (server-side only).
 * The browser then uploads directly to Cloudinary with this signature.
 */
export function signUpload(params: Record<string, string | number>) {
  if (!canSignedUpload()) return null;

  // Cloudinary signs the alphabetically-sorted params (excluding file/api_key).
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");

  const signature = crypto
    .createHash("sha1")
    .update(toSign + cloudinaryApiSecret)
    .digest("hex");

  return {
    signature,
    apiKey: cloudinaryApiKey,
    cloudName: cloudinaryCloudName,
  };
}

export const cloudinaryConfig = {
  cloudName: cloudinaryCloudName,
  uploadPreset: cloudinaryUploadPreset,
};
