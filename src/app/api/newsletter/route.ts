import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/email/send";
import { welcomeEmail } from "@/lib/email/templates";

const schema = z.object({ email: z.string().email() });

// POST /api/newsletter — subscribe an email + send a welcome message.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 422 });
  }

  // Fire-and-forget welcome email (no-op if email isn't configured).
  const { subject, html } = welcomeEmail();
  await sendEmail({ to: parsed.data.email, subject, html });

  // In production you'd also store the subscriber (Supabase / Mailchimp).
  return NextResponse.json({ ok: true });
}
