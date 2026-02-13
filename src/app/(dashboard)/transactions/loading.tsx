import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionsLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ═══ Mobile Header Skeleton ═══ */}
      <header className="md:hidden sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-5 py-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-52 mt-1" />
      </header>

      {/* ═══ Desktop Header Skeleton ═══ */}
      <header className="hidden md:flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">
        {/* ── Add Transaction Form Skeleton (desktop only) ── */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <Skeleton className="h-5 w-36" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl col-span-2" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>

        {/* ── Transaction History Skeleton ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="px-6 py-4 border-b border-slate-100">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-24 mt-1" />
          </div>

          {/* Filter Row */}
          <div className="px-6 py-3 border-b border-slate-100 flex flex-wrap items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-22 rounded-full" />
            <Skeleton className="h-8 w-26 rounded-full" />
            <div className="flex-1" />
            <Skeleton className="h-9 w-48 rounded-xl" />
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="px-6 py-3.5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="w-9 h-9 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-24 hidden sm:block" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
