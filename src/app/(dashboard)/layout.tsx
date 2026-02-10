import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/navigation/BottomNav";
import { Sidebar } from "@/components/navigation/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <Sidebar
        userName={session.user.name}
        userImage={session.user.image}
      />

      {/* Main content area */}
      <main className="flex-1 min-w-0 pb-24 md:pb-0">{children}</main>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
}
