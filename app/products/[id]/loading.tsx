export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-transparent py-8">
      <div className="container mx-auto">
        {/* Breadcrumb skeleton */}
        <div className="mb-6">
          <div className="h-5 w-40 bg-white/10 rounded animate-pulse" />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image skeleton */}
          <div className="space-y-4">
            <div className="rounded-2xl aspect-square bg-white/5 animate-pulse" />
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-white/5 animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Info skeleton */}
          <div className="space-y-6">
            <div>
              <div className="h-10 w-3/4 bg-white/10 rounded animate-pulse mb-3" />
              <div className="h-5 w-full bg-white/5 rounded animate-pulse mb-2" />
              <div className="h-5 w-2/3 bg-white/5 rounded animate-pulse" />
            </div>

            <div className="border-y border-white/10 py-6 space-y-4">
              <div className="h-10 w-48 bg-white/10 rounded animate-pulse" />
              <div className="h-6 w-40 bg-white/5 rounded animate-pulse" />
              <div className="h-12 w-56 bg-white/10 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
