// Instant skeleton for the account overview so the post-sign-in navigation
// never shows a blank/janky wait while orders are fetched server-side.
export default function AccountLoading() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-3 sm:p-5"
          >
            <div className="h-5 w-5 animate-pulse rounded bg-paper-2" />
            <div className="mt-3 h-6 w-12 animate-pulse rounded bg-paper-2" />
            <div className="mt-2 h-3 w-16 animate-pulse rounded bg-paper-2" />
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <div className="h-6 w-40 animate-pulse rounded bg-paper-2" />
          <div className="h-4 w-16 animate-pulse rounded bg-paper-2" />
        </div>
        <div className="mt-4 space-y-3 rounded-2xl border border-border p-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 w-full animate-pulse rounded bg-paper-2" />
          ))}
        </div>
      </div>
    </div>
  );
}
