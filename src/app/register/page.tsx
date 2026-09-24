"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  Mail,
  Lock,
  Music2,
  Briefcase,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    voicePart: "TENOR",
    tier: "WORKING",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("كلمتا المرور غير متطابقتين، يرجى التأكد وإعادة المحاولة");
      return;
    }

    if (formData.password.length < 6) {
      setError("كلمة المرور يجب ألا تقل عن 6 أحرف أو أرقام");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
          voicePart: formData.voicePart,
          tier: formData.tier,
        }),
      });

      const data = (await res.json()) as { error?: string; redirectUrl?: string };

      if (!res.ok) {
        setError(data.error || "حدث خطأ أثناء التسجيل");
        setLoading(false);
        return;
      }

      // Success redirect to pending approval
      router.push(data.redirectUrl || "/pending-approval");
    } catch {
      setError("فشل الاتصال بالخادم، يرجى التحقق من اتصالك بالإنترنت");
      setLoading(false);
    }
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
          طلب انضمام لكورال ثمر شفاه
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-charcoal-muted font-medium">
          ذبيحة تسبيح منذ عام 2000 • تسجيل بيانات عضوية جديدة
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-surface-border shadow-card">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs sm:text-sm animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">
                الاسم ثلاثي أو رباعي <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-charcoal-muted">
                  <User className="w-4 h-4 text-gold-700" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="مثال: كيرلس ميخائيل جرجس"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pr-10 pl-4 py-3 rounded-xl border border-surface-border bg-surface-canvas/50 text-sm text-charcoal focus:bg-white focus:border-gold focus:ring-2 focus:ring-gold-200 transition-all outline-none"
                />
              </div>
            </div>

            {/* Mobile Phone & Email Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1.5">
                  رقم الموبايل (واتساب) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-charcoal-muted">
                    <Phone className="w-4 h-4 text-gold-700" />
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="01012345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pr-10 pl-4 py-3 rounded-xl border border-surface-border bg-surface-canvas/50 text-sm text-charcoal focus:bg-white focus:border-gold focus:ring-2 focus:ring-gold-200 transition-all outline-none text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1.5">
                  البريد الإلكتروني <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-charcoal-muted">
                    <Mail className="w-4 h-4 text-gold-700" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pr-10 pl-4 py-3 rounded-xl border border-surface-border bg-surface-canvas/50 text-sm text-charcoal focus:bg-white focus:border-gold focus:ring-2 focus:ring-gold-200 transition-all outline-none text-left"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Voice Part & Member Tier */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1.5">
                  طبقة الصوت <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-charcoal-muted">
                    <Music2 className="w-4 h-4 text-gold-700" />
                  </div>
                  <select
                    value={formData.voicePart}
                    onChange={(e) => setFormData({ ...formData, voicePart: e.target.value })}
                    className="w-full pr-10 pl-4 py-3 rounded-xl border border-surface-border bg-surface-canvas/50 text-sm text-charcoal focus:bg-white focus:border-gold focus:ring-2 focus:ring-gold-200 transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option value="SOPRANO">سوبرانو (Soprano)</option>
                    <option value="ALTO">آلتو (Alto)</option>
                    <option value="TENOR">تينور (Tenor)</option>
                    <option value="BASS">باص (Bass)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1.5">
                  الفئة <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-charcoal-muted">
                    <Briefcase className="w-4 h-4 text-gold-700" />
                  </div>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    className="w-full pr-10 pl-4 py-3 rounded-xl border border-surface-border bg-surface-canvas/50 text-sm text-charcoal focus:bg-white focus:border-gold focus:ring-2 focus:ring-gold-200 transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option value="STUDENT">طالب / طالبة</option>
                    <option value="WORKING">خريج / عامل</option>
                    <option value="OTHER">أخرى</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1.5">
                  كلمة المرور <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-charcoal-muted">
                    <Lock className="w-4 h-4 text-gold-700" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pr-10 pl-4 py-3 rounded-xl border border-surface-border bg-surface-canvas/50 text-sm text-charcoal focus:bg-white focus:border-gold focus:ring-2 focus:ring-gold-200 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1.5">
                  تأكيد كلمة المرور <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-charcoal-muted">
                    <Lock className="w-4 h-4 text-gold-700" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pr-10 pl-4 py-3 rounded-xl border border-surface-border bg-surface-canvas/50 text-sm text-charcoal focus:bg-white focus:border-gold focus:ring-2 focus:ring-gold-200 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Notice about approval workflow */}
            <div className="p-3.5 bg-gold-50/70 border border-gold-200 rounded-2xl text-xs text-gold-900 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-gold-700 shrink-0 mt-0.5" />
              <span>
                <strong>تنبيه هام:</strong> بعد إتمام التسجيل، سيكون حسابك بحالة{" "}
                <span className="font-bold underline">قيد المراجعة</span> حتى يعتمده خادم الكورال الإداري.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 px-4 rounded-full font-bold text-sm text-white bg-burgundy hover:bg-burgundy-hover shadow-burgundy hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري تسجيل الحساب...</span>
                </>
              ) : (
                <>
                  <span>إرسال طلب الانضمام</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Already have account */}
          <div className="mt-6 text-center text-xs text-charcoal-muted">
            <span>لديك حساب بالفعل؟ </span>
            <Link
              href="/login"
              className="font-bold text-burgundy hover:text-burgundy-hover hover:underline"
            >
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
