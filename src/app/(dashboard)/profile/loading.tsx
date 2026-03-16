import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ═══ Mobile Header Skeleton ═══ */}
      <header className="md:hidden sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-5 py-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-52 mt-1" />
      </header>

      {/* ═══ Desktop Header Skeleton ═══ */}
      <header className="hidden md:flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white">
        <div className="space-y-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-56" />
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-4xl mx-auto">
        {/* User Info Card Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-6 w-32 rounded-md" />
            </div>
          </div>
        </div>

        {/* Security Section Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>

        {/* Sign Out Card Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </main>
    </div>
  );
}