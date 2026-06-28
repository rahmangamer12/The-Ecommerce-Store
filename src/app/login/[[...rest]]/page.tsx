import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { AuthFrame, clerkAppearance } from "@/components/auth/auth-frame";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Sign In",
  path: "/login",
  noindex: true,
});

export default function LoginPage() {
  return (
    <AuthFrame>
      <SignIn appearance={clerkAppearance} signUpUrl="/register" />
    </AuthFrame>
  );
}
