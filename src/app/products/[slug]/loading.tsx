import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-4 w-64" />
      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
        <div>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-3 h-10 w-3/4" />
          <Skeleton className="mt-4 h-4 w-40" />
          <Skeleton className="mt-6 h-8 w-32" />
          <Skeleton className="mt-6 h-20 w-full" />
          <div className="mt-6 flex gap-3">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
