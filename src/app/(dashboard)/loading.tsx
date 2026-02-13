import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ═══ Mobile Header Skeleton ═══ */}
      <header className="md:hidden sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-36" />
          </div>
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      </header>

      {/* ═══ Desktop Header Skeleton ═══ */}
      <header className="hidden md:flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-24 rounded-xl" />
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto">
        {/* ── Total Balance Card Skeleton ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-52" />
          <div className="flex gap-6 pt-2">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-28" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-28" />
            </div>
          </div>
        </div>

        {/* ── Quick Actions Skeleton ── */}
        <div className="flex items-center justify-center gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <Skeleton className="w-12 h-12 rounded-full" />
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>

        {/* ── Charts Grid Skeleton ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
            <div className="space-y-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>

          {/* Trend Analysis */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
            <div className="space-y-1">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>

        {/* ── Budget Progress Skeleton ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <Skeleton className="h-5 w-36" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* ── Accounts & Recent Transactions Skeleton ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Accounts */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div className="space-y-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="px-6 py-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div className="space-y-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="px-6 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-9 h-9 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
