"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = (await res.json()) as { error?: string; redirectUrl?: string };

      if (!res.ok) {
        setError(data.error || "بيانات الدخول غير صحيحة");
        setLoading(false);
        return;
      }

      router.push(data.redirectUrl || "/");
    } catch {
      setError("فشل الاتصال بالخادم، يرجى المحاولة مرة أخرى");
      setLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setIdentifier("admin@thamar-shefah.org");
    setPassword("Admin123456!");
  };

  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Choir Logo */}
        <Link href="/" className="inline-block group mb-3">
          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-gold shadow-md group-hover:scale-105 transition-transform bg-white relative">
            <Image
              src="/images/logo.jpg"
              alt="شعار كورال ثمر شفاه"
              fill
              className="object-contain p-1"
              priority
            />
          </div>
        </Link>

        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-burgundy">
          تسجيل الدخول لبوابة الكورال
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-charcoal-muted font-medium">
          كورال ثمر شفاه • ذبيحة تسبيح منذ 2000
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-surface-border shadow-card">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs sm:text-sm animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identifier (Email or Phone) */}
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">
                البريد الإلكتروني أو رقم الموبايل
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-charcoal-muted">
                  <User className="w-4 h-4 text-gold-700" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="name@example.com أو 01012345678"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 rounded-xl border border-surface-border bg-surface-canvas/50 text-sm text-charcoal focus:bg-white focus:border-gold focus:ring-2 focus:ring-gold-200 transition-all outline-none text-left"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-charcoal-muted">
                  <Lock className="w-4 h-4 text-gold-700" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10 pl-10 py-3 rounded-xl border border-surface-border bg-surface-canvas/50 text-sm text-charcoal focus:bg-white focus:border-gold focus:ring-2 focus:ring-gold-200 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-charcoal-muted hover:text-burgundy cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-full font-bold text-sm text-white bg-burgundy hover:bg-burgundy-hover shadow-burgundy hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري تسجيل الدخول...</span>
                </>
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Localhost Test Credentials Helper */}
          <div className="mt-6 pt-4 border-t border-surface-border/80">
            <div className="bg-gold-50/60 p-3 rounded-xl border border-gold-200 text-[11px] text-gold-950 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1 text-gold-800">
                  <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                  حساب المشرف العام للتجربة المحلية:
                </span>
                <button
                  type="button"
                  onClick={fillAdminCredentials}
                  className="text-[10px] font-bold text-burgundy underline hover:text-burgundy-hover cursor-pointer"
                >
                  ملء تلقائي
                </button>
              </div>
              <p className="font-mono text-[10px] text-charcoal">
                admin@thamar-shefah.org / Admin123456!
              </p>
            </div>
          </div>

          {/* New Member Registration Link */}
          <div className="mt-6 text-center text-xs text-charcoal-muted">
            <span>لست عضواً مسجلاً بعد؟ </span>
            <Link
              href="/register"
              className="font-bold text-burgundy hover:text-burgundy-hover hover:underline"
            >
              طلب انضمام جديد
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
