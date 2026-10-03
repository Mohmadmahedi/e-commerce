export function ProductCardSkeleton() {
  return (
    <div className="bg-surface-card rounded-xl border border-[#E5E0D8] overflow-hidden shadow-subtle flex flex-col animate-pulse">
      {/* Image Aspect Box Skeleton */}
      <div className="aspect-[3/4] bg-surface-warm w-full relative">
        <div className="absolute top-3 left-3 w-16 h-4 bg-stone-200 rounded" />
      </div>

      {/* Content Skeleton */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="w-20 h-3 bg-stone-200 rounded" />
            <div className="w-10 h-3 bg-stone-200 rounded" />
          </div>
          <div className="w-3/4 h-4 bg-stone-200 rounded mb-1" />
          <div className="w-1/2 h-3 bg-stone-200 rounded" />
        </div>

        <div className="pt-3 border-t border-[#F0EBE1] flex items-center justify-between">
          <div className="w-24 h-5 bg-stone-200 rounded" />
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-stone-200" />
            <div className="w-3 h-3 rounded-full bg-stone-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCardSkeleton;
