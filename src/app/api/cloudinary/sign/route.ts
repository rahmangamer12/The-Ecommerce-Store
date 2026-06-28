import { NextResponse } from "next/server";
import { signUpload, canSignedUpload } from "@/lib/cloudinary";

/**
 * POST /api/cloudinary/sign
 * Returns a short-lived signature so the browser can upload an image
 * directly to Cloudinary (signed mode). 503 if Cloudinary isn't set up.
 */
export async function POST() {
  if (!canSignedUpload()) {
    return NextResponse.json(
      { ok: false, error: "Cloudinary signed uploads are not configured." },
      { status: 503 },
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "luxora/products";
  const signed = signUpload({ timestamp, folder });

  if (!signed) {
    return NextResponse.json({ ok: false, error: "Could not sign upload." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, timestamp, folder, ...signed });
}
