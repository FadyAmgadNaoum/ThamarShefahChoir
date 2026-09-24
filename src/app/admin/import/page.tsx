"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  UploadCloud,
  FileSpreadsheet,
  FileText,
  FileCode,
  Users,
  Calendar,
  Music,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Trash2,
  ArrowRight,
  Layers,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import {
  AIClassificationResult,
  ExtractedMember,
  ExtractedRehearsal,
  ExtractedSong,
  ExtractedPayment,
} from "@/lib/ai/classifier";

export default function SmartAIImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [classification, setClassification] = useState<AIClassificationResult | null>(null);
  const [activeTab, setActiveTab] = useState<"members" | "rehearsals" | "songs" | "payments">("members");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (selected: File) => {
    setFile(selected);
    setClassification(null);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) return;
    try {
      setAnalyzing(true);
      setErrorMessage(null);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/ai/import", {
        method: "POST",
        body: formData,
      });

      const data: any = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل تحليل الملف");
      }

      setClassification(data.classification);
      // Auto switch to tab with items
      if (data.classification.members.length > 0) setActiveTab("members");
      else if (data.classification.rehearsals.length > 0) setActiveTab("rehearsals");
      else if (data.classification.songs.length > 0) setActiveTab("songs");
      else if (data.classification.payments.length > 0) setActiveTab("payments");
    } catch (err: any) {
      setErrorMessage(err.message || "حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCommit = async () => {
    if (!classification) return;
    try {
      setCommitting(true);
      setErrorMessage(null);

      const res = await fetch("/api/admin/ai/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "commit",
          payload: classification,
        }),
      });

      const data: any = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل حفظ البيانات");
      }

      setSuccessMessage(data.message);
      setClassification(null);
      setFile(null);
    } catch (err: any) {
      setErrorMessage(err.message || "حدث خطأ أثناء اعتماد البيانات");
    } finally {
      setCommitting(false);
    }
  };

  // Row removal helpers
  const removeMember = (index: number) => {
    if (!classification) return;
    const updated = [...classification.members];
    updated.splice(index, 1);
    setClassification({ ...classification, members: updated });
  };

  const removeRehearsal = (index: number) => {
    if (!classification) return;
    const updated = [...classification.rehearsals];
    updated.splice(index, 1);
    setClassification({ ...classification, rehearsals: updated });
  };

  const removeSong = (index: number) => {
    if (!classification) return;
    const updated = [...classification.songs];
    updated.splice(index, 1);
    setClassification({ ...classification, songs: updated });
  };

  const removePayment = (index: number) => {
    if (!classification) return;
    const updated = [...classification.payments];
    updated.splice(index, 1);
    setClassification({ ...classification, payments: updated });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1C1917] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-[#EADBB6] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#DCA40C]/15 flex items-center justify-center text-[#640810] border border-[#DCA40C]/30">
              <Sparkles className="w-6 h-6 text-[#DCA40C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#640810]">المعالجة والجدولة الذكية بالذكاء الاصطناعي</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#640810]/10 text-[#640810] border border-[#640810]/20">
                  AI Auto-Classifier
                </span>
              </div>
              <p className="text-sm text-[#78716C] mt-0.5">
                ارفع ملفات Word أو Excel أو PDF، وسيقوم الذكاء الاصطناعي باستخراجها وتصنيفها وجدولتها في أقسام السيستم فوراً
              </p>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <strong className="block font-bold">تم اعتماد البيانات بنجاح!</strong>
                <span className="text-sm">{successMessage}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/members"
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100"
              >
                دليل الأعضاء
              </Link>
              <Link
                href="/admin/rehearsals"
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100"
              >
                البروفات
              </Link>
              <Link
                href="/admin/songs"
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100"
              >
                الترانيم
              </Link>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Upload Zone Card */}
        {!classification && (
          <div className="bg-white p-8 rounded-3xl border border-[#EADBB6] shadow-sm space-y-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
              }}
              className="border-2 border-dashed border-[#DCA40C]/60 hover:border-[#640810] bg-[#FDFBF7] rounded-3xl p-10 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.docx,.doc,.pdf,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                }}
              />
              <div className="w-16 h-16 rounded-3xl bg-[#DCA40C]/15 flex items-center justify-center text-[#640810]">
                <UploadCloud className="w-8 h-8 text-[#DCA40C]" />
              </div>
              <h3 className="text-lg font-bold text-[#640810]">
                {file ? file.name : "اضغط هنا لاختيار ملف أو اسحبه وأفلته هنا"}
              </h3>
              <p className="text-xs text-[#78716C] max-w-md">
                يدعم السيستم ملفات Excel (شيتات الحضور، قوائم المرنمين)، ملفات Word (أوراق العمل، الكلمات)، وملفات PDF
              </p>

              {file && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAF0CC] rounded-full text-xs font-semibold text-[#640810]">
                  حجم الملف: {(file.size / 1024).toFixed(1)} ك.ب
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs text-[#78716C]">
                <span className="font-semibold text-stone-900">الصيغ المدعومة:</span>
                <span className="px-2 py-0.5 rounded-md bg-stone-100">Excel (.xlsx, .csv)</span>
                <span className="px-2 py-0.5 rounded-md bg-stone-100">Word (.docx)</span>
                <span className="px-2 py-0.5 rounded-md bg-stone-100">PDF (.pdf)</span>
              </div>

              <button
                onClick={handleUploadAndAnalyze}
                disabled={!file || analyzing}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#640810] text-white font-bold text-sm hover:bg-[#4A070D] transition shadow-md disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    جاري التحليل بالذكاء الاصطناعي...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#DCA40C]" />
                    تحليل الملف وتصنيفه بالـ AI
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* AI Classification & Review Stage */}
        {classification && (
          <div className="bg-white rounded-3xl border border-[#EADBB6] shadow-sm overflow-hidden space-y-6 p-6">
            {/* Summary Strip */}
            <div className="p-4 rounded-2xl bg-[#FAF0CC]/50 border border-[#DCA40C]/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#640810]/10 flex items-center justify-center text-[#640810]">
                  <Sparkles className="w-5 h-5 text-[#DCA40C]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#640810] text-sm">نتائج المعالجة الذكية للملف ({classification.fileName})</h3>
                  <p className="text-xs text-stone-700 mt-0.5">{classification.summary}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setClassification(null)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-[#EADBB6] text-stone-700 hover:bg-[#FAF7F2]"
                >
                  رفع ملف آخر
                </button>
                <button
                  onClick={handleCommit}
                  disabled={committing}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#640810] text-white font-bold text-xs hover:bg-[#4A070D] transition shadow-sm disabled:opacity-50"
                >
                  {committing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      جاري الاعتماد...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-[#DCA40C]" />
                      جدولة واعتماد البيانات في السيستم (1-Click)
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-[#FAF0CC] pb-2">
              <button
                onClick={() => setActiveTab("members")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === "members"
                    ? "bg-[#640810] text-white shadow-xs"
                    : "bg-[#FAF7F2] text-stone-700 hover:bg-[#FAF0CC]"
                }`}
              >
                <Users className="w-4 h-4" />
                أعضاء الكورال ({classification.members.length})
              </button>

              <button
                onClick={() => setActiveTab("rehearsals")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === "rehearsals"
                    ? "bg-[#640810] text-white shadow-xs"
                    : "bg-[#FAF7F2] text-stone-700 hover:bg-[#FAF0CC]"
                }`}
              >
                <Calendar className="w-4 h-4" />
                البروفات والمواعيد ({classification.rehearsals.length})
              </button>

              <button
                onClick={() => setActiveTab("songs")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === "songs"
                    ? "bg-[#640810] text-white shadow-xs"
                    : "bg-[#FAF7F2] text-stone-700 hover:bg-[#FAF0CC]"
                }`}
              >
                <Music className="w-4 h-4" />
                الترانيم والكلمات ({classification.songs.length})
              </button>

              <button
                onClick={() => setActiveTab("payments")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === "payments"
                    ? "bg-[#640810] text-white shadow-xs"
                    : "bg-[#FAF7F2] text-stone-700 hover:bg-[#FAF0CC]"
                }`}
              >
                <DollarSign className="w-4 h-4" />
                المدفوعات والاشتراكات ({classification.payments.length})
              </button>
            </div>

            {/* Tab 1: Members Review */}
            {activeTab === "members" && (
              <div className="space-y-3">
                {classification.members.length === 0 ? (
                  <p className="p-8 text-center text-xs text-stone-500">لم يتم اكتشاف بيانات أعضاء في هذا الملف</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="bg-[#FAF7F2] border-b border-[#EADBB6] text-[#78716C]">
                          <th className="py-2.5 px-3">اسم المرنم</th>
                          <th className="py-2.5 px-3">رقم التليفون</th>
                          <th className="py-2.5 px-3">القسم الصوتي</th>
                          <th className="py-2.5 px-3">الفئة</th>
                          <th className="py-2.5 px-3 text-center">إجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#FAF0CC]">
                        {classification.members.map((m, idx) => (
                          <tr key={idx} className="hover:bg-[#FDFBF7]">
                            <td className="py-2.5 px-3 font-semibold text-stone-900">{m.fullName}</td>
                            <td className="py-2.5 px-3 font-mono text-stone-600">{m.phone || "توليد تلقائي"}</td>
                            <td className="py-2.5 px-3 font-bold text-[#640810]">{m.voicePart || "TENOR"}</td>
                            <td className="py-2.5 px-3 text-stone-600">
                              {m.tier === "STUDENT" ? "طالب" : "خريج / عامل"}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                onClick={() => removeMember(idx)}
                                className="text-rose-600 hover:text-rose-800 p-1"
                                title="استبعاد هذا الصف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Rehearsals Review */}
            {activeTab === "rehearsals" && (
              <div className="space-y-3">
                {classification.rehearsals.length === 0 ? (
                  <p className="p-8 text-center text-xs text-stone-500">لم يتم اكتشاف بروفات في هذا الملف</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {classification.rehearsals.map((r, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#EADBB6] flex items-start justify-between"
                      >
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-[#640810]">{r.title}</h4>
                          <div className="text-xs text-stone-600">
                            📅 التاريخ: <strong>{r.date}</strong> | ⏰ {r.startTime} إلى {r.endTime}
                          </div>
                          <div className="text-[11px] text-stone-500">📍 المكان: {r.locationName}</div>
                        </div>
                        <button
                          onClick={() => removeRehearsal(idx)}
                          className="text-rose-600 hover:text-rose-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Songs Review */}
            {activeTab === "songs" && (
              <div className="space-y-3">
                {classification.songs.length === 0 ? (
                  <p className="p-8 text-center text-xs text-stone-500">لم يتم اكتشاف ترانيم في هذا الملف</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {classification.songs.map((s, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#EADBB6] flex items-start justify-between"
                      >
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-[#640810]">{s.title}</h4>
                          <div className="text-xs text-stone-600">
                            القسم: <strong className="text-stone-900">{s.category || "عام"}</strong>
                          </div>
                        </div>
                        <button
                          onClick={() => removeSong(idx)}
                          className="text-rose-600 hover:text-rose-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Payments Review */}
            {activeTab === "payments" && (
              <div className="space-y-3">
                {classification.payments.length === 0 ? (
                  <p className="p-8 text-center text-xs text-stone-500">لم يتم اكتشاف مدفوعات مالية في هذا الملف</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="bg-[#FAF7F2] border-b border-[#EADBB6] text-[#78716C]">
                          <th className="py-2.5 px-3">المرنم</th>
                          <th className="py-2.5 px-3">المبلغ المسدد</th>
                          <th className="py-2.5 px-3">تاريخ السداد</th>
                          <th className="py-2.5 px-3 text-center">إجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#FAF0CC]">
                        {classification.payments.map((p, idx) => (
                          <tr key={idx} className="hover:bg-[#FDFBF7]">
                            <td className="py-2.5 px-3 font-semibold text-stone-900">{p.memberName}</td>
                            <td className="py-2.5 px-3 font-bold text-emerald-700">{p.amount} ج.م</td>
                            <td className="py-2.5 px-3 font-mono text-stone-600">{p.paymentDate}</td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                onClick={() => removePayment(idx)}
                                className="text-rose-600 hover:text-rose-800 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
