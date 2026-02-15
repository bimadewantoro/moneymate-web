import { signIn } from "@/auth";
import Link from "next/link";
import { Shield, Zap, BarChart3, ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-white flex relative">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 mesh-gradient opacity-50 pointer-events-none" />

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-between p-12">
        <div>
          <Link href="/" className="inline-flex items-center gap-3 group">
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
            <span className="text-2xl font-bold text-slate-900 tracking-tight">MoneyMate</span>
          </Link>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl xl:text-5xl font-bold text-slate-900 leading-tight tracking-tight mb-4">
              Take control of your{" "}
              <span className="brand-gradient-text">
                financial journey
              </span>
            </h1>
            <p className="text-lg text-slate-500 max-w-md">
              Join thousands of users who are already managing their finances smarter with MoneyMate.
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: Zap, label: "Free Forever" },
              { icon: Shield, label: "Secure Login" },
              { icon: BarChart3, label: "Real-time Tracking" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full shadow-sm"
              >
                <item.icon className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="p-6 glass-card rounded-2xl">
            <p className="text-slate-600 italic mb-4">
              &ldquo;MoneyMate helped me save 30% more every month by showing me exactly where my money was going.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 brand-gradient rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">JD</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Happy User</p>
                <p className="text-xs text-slate-500">Using MoneyMate since 2025</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-400">© 2026 MoneyMate. All rights reserved.</p>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-12 h-12 brand-gradient rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">MoneyMate</span>
            </Link>
          </div>

          {/* Sign In Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                Welcome!
              </h2>
              <p className="text-slate-500">
                Sign in to continue to your dashboard
              </p>
            </div>

            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/dashboard" });
              }}
              className="space-y-6"
            >
              <button
                type="submit"
                className="group w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 hover:bg-slate-800 rounded-2xl font-medium text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Shield className="w-4 h-4 text-green-500" />
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Privacy First</span>
              </div>
            </div>

            <p className="mt-8 text-xs text-center text-slate-400">
              By signing in, you agree to our{" "}
              <a href="#" className="text-blue-600 hover:text-blue-500 transition-colors">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:text-blue-500 transition-colors">
                Privacy Policy
              </a>
            </p>
          </div>

          {/* Back to Home Link */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          {/* Mobile Footer */}
          <p className="lg:hidden mt-8 text-center text-sm text-slate-400">
            © 2026 MoneyMate. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
