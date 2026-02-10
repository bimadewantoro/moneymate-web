import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { PinSettings } from "@/features/security/components/PinSettings";
import { LogOut, Shield } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ═══ Mobile Header ═══ */}
      <header className="md:hidden sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-5 py-3">
        <h1 className="text-lg font-bold tracking-tight text-slate-900">
          Profile
        </h1>
        <p className="text-sm text-slate-500">
          Your account &amp; security settings
        </p>
      </header>

      {/* ═══ Desktop Header ═══ */}
      <header className="hidden md:flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Profile
          </h1>
          <p className="text-slate-500 text-sm">
            Your account &amp; security settings
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-4xl mx-auto">
        {/* ═══ User Info Card ═══ */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-4">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || "User"}
                className="w-16 h-16 rounded-full ring-2 ring-slate-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl">
                {user.name?.[0] || "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-slate-900 truncate">
                {user.name || "User"}
              </h2>
              {user.email && (
                <p className="text-sm text-slate-500 truncate">{user.email}</p>
              )}
              <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium">
                <Shield className="w-3 h-3" />
                Google Account
              </span>
            </div>
          </div>
        </div>

        {/* ═══ Security Section ═══ */}
        <PinSettings />

        {/* ═══ Sign Out ═══ */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Session
          </h3>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
