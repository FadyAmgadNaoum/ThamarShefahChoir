"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, ShieldAlert, LogOut, RefreshCw, PhoneCall } from "lucide-react";

export default function PendingApprovalPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const checkStatus = async () => {
    setChecking(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/me");
      const data = (await res.json()) as { authenticated?: boolean; user?: { status?: string } };
      if (data.authenticated && data.user) {
        if (data.user.status === "APPROVED") {
          router.push("/");
          return;
        }
      }
      setMessage("الحساب ما زال تحت المراجعة والاعتماد من قبل خُدام الكورال.");
    } catch {
      setMessage("تعذر التحقق من الخادم، يرجى المحاولة لاحقاً.");
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Choir Logo */}
        <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-gold shadow-md bg-white relative mb-4">
          <Image
            src="/images/logo.jpg"
            alt="شعار كورال ثمر شفاه"
            fill
            className="object-contain p-1"
            priority
          />
        </div>

        {/* Pending Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold mb-4">
          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          <span>حالة الحساب: قيد الانتظار (PENDING)</span>
        </div>

        {/* Headline message requested in specification */}
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-burgundy mb-3">
          حسابك لسه تحت المراجعة
        </h1>

        <p className="text-xs sm:text-sm text-charcoal-muted max-w-sm mx-auto leading-relaxed">
          شكراً لتسجيلك في منظومة كورال ثمر شفاه. تم استلام طلب عضويتك وجاري مراجعته من قبل خُدام الكورال الإداريين.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 rounded-3xl border border-surface-border shadow-card space-y-6">
          <div className="p-4 rounded-2xl bg-surface-canvas border border-surface-border space-y-2 text-xs text-charcoal-muted leading-relaxed">
            <h3 className="font-bold text-burgundy flex items-center gap-1.5 text-sm">
              <ShieldAlert className="w-4 h-4 text-gold-700" />
              <span>ماذا بعد إرسال الطلب؟</span>
            </h3>
            <p>
              • سيقوم الخادم المسؤول بمراجعة بياناتك واعتماد رتبتك الصوتية (Soprano, Alto, Tenor, Bass).
            </p>
            <p>
              • بمجرد الاعتماد، ستتمكن فوراً من تسجيل حضور البروفات عبر الـ GPS، والاطلاع على رصيد النقاط الفصلي ومكتبة الألحان.
            </p>
          </div>

          {message && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 text-center animate-in fade-in">
              {message}
            </div>
          )}

          <div className="space-y-3 pt-2">
            {/* Check Status Button */}
            <button
              onClick={checkStatus}
              disabled={checking}
              className="w-full py-3 px-4 rounded-full font-bold text-sm text-burgundy bg-gold hover:bg-gold-light shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
              <span>التحقق من حالة الاعتماد الآن</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full py-3 px-4 rounded-full font-bold text-xs text-charcoal hover:text-red-700 hover:bg-red-50 border border-surface-border transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>

          <div className="text-center pt-2 border-t border-surface-border">
            <Link
              href="/"
              className="text-xs text-charcoal-muted hover:text-burgundy font-semibold"
            >
              العودة إلى الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
