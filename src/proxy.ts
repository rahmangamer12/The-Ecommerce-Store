import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Routes that require the user to be signed in.
const isProtectedRoute = createRouteMatcher(["/account(.*)", "/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // Redirects to the sign-in page (NEXT_PUBLIC_CLERK_SIGN_IN_URL) if not signed in.
    await auth.protect();
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
