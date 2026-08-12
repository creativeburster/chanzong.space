export default function Loading() {
  return (
    <div className="min-h-screen flex bg-[#FAF9F6]">
      <div className="w-64 bg-slate-900 animate-pulse" />
      <div className="flex-1 flex flex-col">
        <div className="h-14 bg-white border-b border-zinc-200 animate-pulse" />
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-6 md:py-12 space-y-6">
          <div className="h-8 w-64 bg-zinc-200 rounded animate-pulse" />
          <div className="h-4 w-96 bg-zinc-200 rounded animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-white border border-zinc-200 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-white border border-zinc-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
