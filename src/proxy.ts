import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes that require the user to be signed in.
const isProtectedRoute = createRouteMatcher(["/account(.*)", "/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // Redirects to the sign-in page (NEXT_PUBLIC_CLERK_SIGN_IN_URL) if not signed in.
    await auth.protect();
  }

  // Affiliate attribution: if a ?ref= code is present, remember it for 30 days
  // so we can credit the affiliate when the visitor orders later.
  const ref = req.nextUrl.searchParams.get("ref");
  if (ref) {
    const res = NextResponse.next();
    res.cookies.set("luxora_ref", ref, {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
    });
    return res;
  }
});

export const config = {
  matcher: [
    // Run on everything except Next internals and static assets…
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|gif|svg|png|webp|ico|woff2?|ttf|map)).*)",
    // …and always run on API routes.
    "/(api|trpc)(.*)",
  ],
};
