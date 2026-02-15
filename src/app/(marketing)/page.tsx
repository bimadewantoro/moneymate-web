import { auth } from "@/auth";
import Link from "next/link";
import Image from "next/image";
import {
  BarChart3,
  Wallet,
  TrendingUp,
  ShieldCheck,
  PiggyBank,
  ScanLine,
  ArrowUpRight,
  ArrowDownLeft,
  Target,
  Globe,
  CircleDollarSign,
  ClipboardList,
  Sparkles,
} from "lucide-react";

const FEATURES = [
  {
    icon: ScanLine,
    title: "AI Receipt Scanner",
    description:
      "Snap a photo of any receipt and let Google AI auto-extract merchant, amount, and category instantly.",
  },
  {
    icon: BarChart3,
    title: "Expense Tracking",
    description:
      "Monitor every transaction in real-time. Categorize spending and see exactly where your money goes.",
  },
  {
    icon: PiggyBank,
    title: "Smart Budgeting",
    description:
      "Set monthly limits per category. Visual progress bars & alerts keep you from overspending.",
  },
  {
    icon: TrendingUp,
    title: "Visual Insights",
    description:
      "Beautiful charts and analytics reveal spending patterns so you make informed decisions.",
  },
  {
    icon: Wallet,
    title: "Multiple Accounts",
    description:
      "Manage bank accounts, e-wallets, cash, and investments all in one unified dashboard.",
  },
  {
    icon: Target,
    title: "Savings Goals",
    description:
      "Set targets for vacations, gadgets, or emergency funds. Track your progress with visual milestones.",
  },
  {
    icon: CircleDollarSign,
    title: "Easy Setup",
    description:
      "Simple and quick setup process. Just focus on your expenses and let MoneyMate handle the rest.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Private",
    description:
      "Sign in with Google OAuth, SSL-encrypted data, and privacy-first design. Your finances stay yours.",
  },
];

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* ═══════ NAV ═══════ */}
      <nav className="relative z-20 px-5 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative w-10 h-10 flex items-center justify-center">
               <Image
                src="/moneymate-logo.png"
                alt="MoneyMate Icon"
                width={40}
                height={40}
                className="rounded-xl object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold tracking-tight brand-gradient-text">
              MoneyMate
            </span>
          </div>

          {session ? (
            <Link
              href="/dashboard"
              className="brand-gradient px-5 py-2.5 text-white rounded-full text-sm font-semibold shadow-md shadow-blue-700/20 hover:shadow-lg transition-shadow"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/signin"
              className="brand-gradient px-5 py-2.5 text-white rounded-full text-sm font-semibold shadow-md shadow-blue-700/20 hover:shadow-lg transition-shadow"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* ═══════ HERO ═══════ */}
      <section className="relative mesh-gradient px-5 pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-0 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-green-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Copy */}
            <div className="flex-1 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 border border-green-200 rounded-full mb-6">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse-soft" />
                <span className="text-xs font-medium text-green-700">
                  Free &amp; open-source
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-5 leading-[1.1]">
                Master Your{" "}
                <span className="brand-gradient-text">Money, Mate.</span>
              </h1>

              <p className="text-lg text-slate-500 leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8">
                Track expenses, set budgets, and gain powerful insights into
                your spending habits — all from your pocket.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                {session ? (
                  <Link
                    href="/dashboard"
                    className="group brand-gradient px-8 py-4 text-white rounded-full font-semibold text-lg shadow-lg shadow-blue-700/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    Go to Dashboard
                    <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/signin"
                      className="group brand-gradient px-8 py-4 text-white rounded-full font-semibold text-lg shadow-lg shadow-blue-700/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                      Get Started Free
                      <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </Link>
                    <a
                      href="#features"
                      className="px-8 py-4 bg-white/60 backdrop-blur-sm text-slate-700 rounded-full font-semibold text-lg hover:bg-white transition-all border border-slate-200"
                    >
                      Learn More
                    </a>
                  </>
                )}
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mt-10">
                <div className="flex items-center gap-2 text-slate-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-medium">Easy to Use</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-medium">Real-time Tracking</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Wallet className="w-4 h-4" />
                  <span className="text-xs font-medium">100 % Free</span>
                </div>
              </div>
            </div>

            {/* ── Phone Mock-up ── */}
            <div className="shrink-0 relative w-70 sm:w-75">
              <div className="animate-float">
                {/* Phone frame */}
                <div className="relative bg-white rounded-[2.5rem] shadow-2xl shadow-slate-300/50 border border-slate-200 p-3 overflow-hidden">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-white rounded-b-2xl z-10" />

                  {/* Screen content */}
                  <div className="rounded-4xl overflow-hidden bg-slate-50">
                    {/* Status bar */}
                    <div className="brand-gradient px-5 pt-8 pb-6 text-white">
                      <p className="text-xs text-white/70 mb-1">
                        Total Balance
                      </p>
                      <p className="text-2xl font-bold tracking-tight">
                        Rp 12.450.000
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="flex items-center gap-1 text-xs text-green-300">
                          <ArrowUpRight className="w-3 h-3" /> Rp 8.200.000
                        </span>
                        <span className="flex items-center gap-1 text-xs text-red-300">
                          <ArrowDownLeft className="w-3 h-3" /> Rp 3.150.000
                        </span>
                      </div>
                    </div>

                    {/* Mini transaction list */}
                    <div className="px-4 py-3 space-y-3">
                      {[
                        {
                          label: "Salary",
                          amount: "+ Rp 8.200.000",
                          color: "text-green-600",
                          bg: "bg-green-50",
                          icon: ArrowUpRight,
                        },
                        {
                          label: "Groceries",
                          amount: "- Rp 450.000",
                          color: "text-red-500",
                          bg: "bg-red-50",
                          icon: ArrowDownLeft,
                        },
                        {
                          label: "Freelance",
                          amount: "+ Rp 1.500.000",
                          color: "text-green-600",
                          bg: "bg-green-50",
                          icon: ArrowUpRight,
                        },
                      ].map((tx) => (
                        <div
                          key={tx.label}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 ${tx.bg} rounded-xl flex items-center justify-center`}
                            >
                              <tx.icon
                                className={`w-3.5 h-3.5 ${tx.color}`}
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-700">
                              {tx.label}
                            </span>
                          </div>
                          <span
                            className={`text-xs font-semibold ${tx.color}`}
                          >
                            {tx.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section
        id="features"
        className="px-5 py-16 sm:py-24 max-w-7xl mx-auto"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3">
            Everything you need to{" "}
            <span className="brand-gradient-text">grow your wealth</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Powerful features wrapped in a beautiful, mobile-first experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group glass-card rounded-2xl p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-slate-100"
            >
              <div className="w-12 h-12 brand-gradient rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2 tracking-tight">
                {f.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section className="px-5 py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3">
              Get started in{" "}
              <span className="brand-gradient-text">three easy steps</span>
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              From sign-up to financial clarity in under a minute.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: CircleDollarSign,
                title: "Create Your Accounts",
                description:
                  "Add your bank accounts, e-wallets, and cash stashes. Set the currency and opening balance for each.",
              },
              {
                step: "02",
                icon: ClipboardList,
                title: "Track Transactions",
                description:
                  "Log income, expenses, and transfers — or snap a receipt and let AI do the heavy lifting.",
              },
              {
                step: "03",
                icon: Sparkles,
                title: "Watch Your Wealth Grow",
                description:
                  "Set savings goals, review spending charts, and gain insights that help you save more every month.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative text-center p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <span className="absolute top-4 right-5 text-5xl font-black text-slate-100 select-none">
                  {item.step}
                </span>
                <div className="w-14 h-14 brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="px-5 pb-20">
        <div className="max-w-3xl mx-auto brand-gradient rounded-3xl p-10 sm:p-14 text-center text-white relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Ready to master your money?
            </h2>
            <p className="text-white/70 mb-8 max-w-md mx-auto">
              Join thousands who&apos;ve taken control of their finances with
              MoneyMate.
            </p>
            {!session && (
              <Link
                href="/signin"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Start Your Journey
                <TrendingUp className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="border-t border-slate-100 py-8 px-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">© 2026 MoneyMate. All rights reserved.</span>
          </div>
          <p className="text-sm text-slate-400">
            Built with ❤️ for your financial wellness
          </p>
        </div>
      </footer>
    </div>
  );
}
