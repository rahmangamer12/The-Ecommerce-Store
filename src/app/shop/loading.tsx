import { ProductGridSkeleton } from "@/components/product/product-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-12 w-72" />
      <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      <div className="mt-12">
        <ProductGridSkeleton count={9} />
      </div>
    </div>
  );
}
