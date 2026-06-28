import type { Metadata } from "next";
import { AuthShell, AuthLink } from "@/components/auth/auth-shell";
import { AuthForm } from "@/components/auth/auth-form";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Sign In",
  path: "/login",
  noindex: true,
});

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to access your orders, wishlist and account."
      footer={
        <>
          New to Luxora? <AuthLink href="/register">Create an account</AuthLink>
        </>
      }
    >
      <AuthForm mode="login" />
    </AuthShell>
  );
}
