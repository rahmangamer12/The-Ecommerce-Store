import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { AuthFrame, clerkAppearance } from "@/components/auth/auth-frame";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Create Account",
  path: "/register",
  noindex: true,
});

export default function RegisterPage() {
  return (
    <AuthFrame>
      <SignUp appearance={clerkAppearance} signInUrl="/login" />
    </AuthFrame>
  );
}
