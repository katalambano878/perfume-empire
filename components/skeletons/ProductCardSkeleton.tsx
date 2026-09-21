export default function ProductCardSkeleton() {
  return (
    <div className="flex h-full animate-pulse flex-col overflow-hidden rounded-2xl border border-black/10 bg-white">
      <div className="aspect-[4/5] bg-[#f7f7f7]" />
      <div className="space-y-2 px-3.5 py-3">
        <div className="h-4 w-3/4 rounded bg-black/10" />
        <div className="h-4 w-1/3 rounded bg-black/10" />
        <div className="h-9 w-full rounded-full bg-black/10" />
      </div>
    </div>
  );
}
