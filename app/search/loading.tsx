export default function SearchLoading() {
  return (
    <main className="min-h-screen animate-pulse bg-background" aria-label="Loading search results">
      <div className="h-20 border-b border-border bg-white" />
      <div className="h-32 border-b border-border bg-brand-sand" />
      <div className="mx-auto max-w-[1360px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 h-20 max-w-sm rounded-2xl bg-secondary" />
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="overflow-hidden rounded-2xl border border-border bg-white">
              <div className="aspect-[4/3] bg-secondary" />
              <div className="space-y-4 p-5">
                <div className="h-5 w-2/3 rounded bg-secondary" />
                <div className="h-4 w-1/2 rounded bg-secondary" />
                <div className="h-12 rounded-xl bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
