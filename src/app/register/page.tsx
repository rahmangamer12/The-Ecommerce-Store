import type { Metadata } from "next";
import { AuthShell, AuthLink } from "@/components/auth/auth-shell";
import { AuthForm } from "@/components/auth/auth-form";
import { SocialAuth } from "@/components/auth/social-auth";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Create Account",
  path: "/register",
  noindex: true,
});

export default function RegisterPage() {
  return (
    <AuthShell
      title="Join Luxora"
      subtitle="Create an account for faster checkout and exclusive access."
      footer={
        <>
          Already have an account? <AuthLink href="/login">Sign in</AuthLink>
        </>
      }
    >
      <SocialAuth next="/account" />
      <AuthForm mode="register" />
    </AuthShell>
  );
}
