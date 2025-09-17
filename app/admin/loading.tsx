export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-8 bg-muted rounded w-64 mb-2 animate-pulse" />
          <div className="h-4 bg-muted rounded w-96 animate-pulse" />
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border border-border rounded-lg p-6">
              <div className="h-4 bg-muted rounded w-24 mb-2 animate-pulse" />
              <div className="h-8 bg-muted rounded w-16 mb-1 animate-pulse" />
              <div className="h-3 bg-muted rounded w-20 animate-pulse" />
            </div>
          ))}
        </div>

        <div className="border border-border rounded-lg p-6">
          <div className="h-6 bg-muted rounded w-48 mb-4 animate-pulse" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-border rounded-lg p-4">
                <div className="h-5 bg-muted rounded w-32 mb-2 animate-pulse" />
                <div className="h-4 bg-muted rounded w-48 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
