"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  ArrowLeftRight,
  PiggyBank,
  LogOut,
} from "lucide-react";
import { useTransactionDrawer } from "@/features/transactions/contexts/TransactionDrawerContext";

const SIDEBAR_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/budget", label: "Budget", icon: PiggyBank },
];

interface SidebarProps {
  userName?: string | null;
  userImage?: string | null;
}

export function Sidebar({ userName, userImage }: SidebarProps) {
  const pathname = usePathname();
  const { openDrawer } = useTransactionDrawer();

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 lg:w-72 border-r border-slate-200 bg-white h-screen sticky top-0">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
        <div className="brand-gradient w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-lg">M</span>
        </div>
        <span className="text-xl font-bold tracking-tight brand-gradient-text">
          MoneyMate
        </span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {/* Scan CTA */}
        <button
          type="button"
          onClick={openDrawer}
          className="brand-gradient flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white mt-4 shadow-md shadow-blue-700/20 hover:shadow-lg transition-shadow w-full"
        >
          <span className="w-5 h-5 flex items-center justify-center text-lg leading-none">+</span>
          Add Transaction
        </button>

        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.label + item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-slate-100 px-4 py-4 flex items-center gap-3">
        <Link href="/profile" className="flex items-center gap-3 flex-1 min-w-0 rounded-lg hover:bg-slate-50 transition-colors -m-1 p-1">
          {userImage ? (
            <Image
              src={userImage}
              alt={userName || "User"}
              width={36}
              height={36}
              className="w-9 h-9 rounded-full ring-2 ring-slate-200"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
              {userName?.[0] || "U"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {userName || "User"}
            </p>
          </div>
        </Link>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </form>
      </div>
    </aside>
  );
}
