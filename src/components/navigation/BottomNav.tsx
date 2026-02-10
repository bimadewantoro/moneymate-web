"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ArrowLeftRight,
  ScanLine,
  PiggyBank,
  UserCircle,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "__scan__", label: "Scan", icon: ScanLine }, // placeholder for center FAB
  { href: "/settings", label: "Budget", icon: PiggyBank },
  { href: "/settings#profile", label: "Profile", icon: UserCircle },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden">
      {/* Glassmorphism background */}
      <div className="bg-white/80 backdrop-blur-md border-t border-slate-200/60 pb-safe">
        <div className="flex items-end justify-around px-2 h-16">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href !== "__scan__" && pathname.startsWith(item.href);

            // ── Center FAB (Scan) ──
            if (item.href === "__scan__") {
              return (
                <Link
                  key={item.label}
                  href="/transactions"
                  className="relative -top-4 flex flex-col items-center"
                >
                  <span className="brand-gradient flex items-center justify-center w-14 h-14 rounded-full shadow-lg shadow-blue-700/30 active:scale-95 transition-transform">
                    <ScanLine className="w-6 h-6 text-white" />
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 mt-0.5">
                    {item.label}
                  </span>
                </Link>
              );
            }

            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 px-3 transition-colors ${
                  isActive
                    ? "text-blue-700"
                    : "text-slate-400 active:text-slate-600"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`}
                />
                <span
                  className={`text-[10px] ${
                    isActive ? "font-semibold" : "font-medium"
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute -bottom-0 w-1 h-1 rounded-full brand-gradient" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
