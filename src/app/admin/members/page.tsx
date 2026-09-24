"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Phone,
  Mail,
  Music2,
  Calendar,
  LogOut,
  RefreshCw,
  Home,
  Check,
  X,
  Sparkles,
} from "lucide-react";

interface MemberItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  voicePart?: string;
  tier?: string;
  createdAt: string;
  roles: string[];
}

export default function AdminMembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"PENDING" | "APPROVED" | "REJECTED" | "ALL">("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Role management modal state
  const [editingRolesMember, setEditingRolesMember] = useState<MemberItem | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/members");
      if (!res.ok) {
        if (res.status === 403 || res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to load");
      }
      const data = (await res.json()) as { members?: MemberItem[] };
      setMembers(data.members || []);
    } catch {
      setFeedback({ type: "error", text: "فشل تحميل بيانات الأعضاء" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleUpdateStatus = async (userId: string, newStatus: "APPROVED" | "REJECTED") => {
    setActionLoading(userId);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          status: newStatus,
          reason: newStatus === "APPROVED" ? "اعتماد العضوية من لوحة الإدارة" : "رفض طلب العضوية",
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setFeedback({ type: "error", text: data.error || "فشل تحديث الحالة" });
        return;
      }

      setFeedback({
        type: "success",
        text: newStatus === "APPROVED" ? "تم اعتماد العضو بنجاح وتفعيل حسابه" : "تم رفض طلب العضوية",
      });
      await fetchMembers();
    } catch {
      setFeedback({ type: "error", text: "حدث خطأ غير متوقع" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenRoleModal = (member: MemberItem) => {
    setEditingRolesMember(member);
    setSelectedRoles([...member.roles]);
  };

  const handleToggleRole = (roleName: string) => {
    if (selectedRoles.includes(roleName)) {
      if (selectedRoles.length === 1 && roleName === "MEMBER") {
        return; // Member must have at least one role
      }
      setSelectedRoles(selectedRoles.filter((r) => r !== roleName));
    } else {
      setSelectedRoles([...selectedRoles, roleName]);
    }
  };

  const handleSaveRoles = async () => {
    if (!editingRolesMember) return;
    setActionLoading(editingRolesMember.id);
    try {
      const res = await fetch("/api/admin/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingRolesMember.id,
          roles: selectedRoles,
          reason: "تعديل رتب العضو الإدارية",
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setFeedback({ type: "error", text: data.error || "فشل تحديث الرتب" });
        return;
      }

      setFeedback({ type: "success", text: "تم تحديث رتب العضو بنجاح" });
      setEditingRolesMember(null);
      await fetchMembers();
    } catch {
      setFeedback({ type: "error", text: "حدث خطأ أثناء حفظ الرتب" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  // Filtered members list
  const filtered = members.filter((m) => {
    const matchesTab = activeTab === "ALL" || m.status === activeTab;
    const matchesSearch =
      !searchQuery ||
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const pendingCount = members.filter((m) => m.status === "PENDING").length;
  const approvedCount = members.filter((m) => m.status === "APPROVED").length;
  const rejectedCount = members.filter((m) => m.status === "REJECTED").length;

  return (
    <div className="min-h-screen bg-surface-canvas text-charcoal font-sans pb-16">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Page Title Strip */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-100/80 border border-gold-300 text-burgundy text-xs font-bold mb-2 shadow-2xs">
              <Users className="w-3.5 h-3.5 text-gold" />
              <span>شؤون ورتب المرنمين</span>
            </div>
            <h1 className="font-display font-bold text-xl sm:text-2xl text-charcoal">
              سجل أعضاء الكورال والرتب الإدارية
            </h1>
            <p className="text-xs text-charcoal-muted mt-0.5">
              مراجعة واعتماد حسابات المرنمين الجدد، توزيع طبقات الصوت (Voice Parts)، ومنح الصلاحيات.
            </p>
          </div>
        </div>
        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mb-6 p-4 rounded-2xl text-xs sm:text-sm flex items-center justify-between animate-in fade-in duration-200 ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                : "bg-red-50 text-red-900 border border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-charcoal-muted hover:text-charcoal cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Control Bar: Search & Status Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <button
              onClick={() => setActiveTab("PENDING")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === "PENDING"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-white text-charcoal hover:bg-amber-50 border border-surface-border"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>طلبات قيد المراجعة</span>
              <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">
                {pendingCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("APPROVED")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === "APPROVED"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white text-charcoal hover:bg-emerald-50 border border-surface-border"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>أعضاء معتمدين</span>
              <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">
                {approvedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("REJECTED")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === "REJECTED"
                  ? "bg-red-700 text-white shadow-sm"
                  : "bg-white text-charcoal hover:bg-red-50 border border-surface-border"
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>مرفوضين</span>
              <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">
                {rejectedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === "ALL"
                  ? "bg-burgundy text-white shadow-sm"
                  : "bg-white text-charcoal hover:bg-burgundy-50 border border-surface-border"
              }`}
            >
              <span>الكل</span>
              <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">
                {members.length}
              </span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-charcoal-muted">
              <Search className="w-4 h-4 text-gold-700" />
            </div>
            <input
              type="text"
              placeholder="بحث بالاسم أو رقم الموبايل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 rounded-full border border-surface-border bg-white text-xs text-charcoal focus:border-gold focus:ring-2 focus:ring-gold-200 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Member Roster List */}
        {loading ? (
          <div className="py-20 text-center text-charcoal-muted">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gold-600 mb-2" />
            <p className="text-xs">جاري تحميل بيانات الأعضاء...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-surface-border shadow-sm">
            <Users className="w-12 h-12 text-gold-400 mx-auto mb-3" />
            <h3 className="font-bold text-base text-charcoal mb-1">
              لا توجد طلبات في هذا القسم حالياً
            </h3>
            <p className="text-xs text-charcoal-muted">
              {searchQuery ? "جرّب تغيير كلمات البحث" : "جميع الطلبات تم التعامل معها بنجاح"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((member) => {
              const isProcessing = actionLoading === member.id;
              const isPending = member.status === "PENDING";
              const isApproved = member.status === "APPROVED";

              return (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl border border-surface-border p-5 shadow-card hover:border-gold transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Top Status & Date */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          isPending
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : isApproved
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : "bg-red-100 text-red-900 border border-red-300"
                        }`}
                      >
                        {isPending ? (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>تحت المراجعة</span>
                          </>
                        ) : isApproved ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>معتمد نشط</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-red-600" />
                            <span>مرفوض</span>
                          </>
                        )}
                      </span>

                      <span className="text-[10px] text-charcoal-muted font-mono">
                        {new Date(member.createdAt).toLocaleDateString("ar-EG")}
                      </span>
                    </div>

                    {/* Name & Contact */}
                    <div>
                      <h3 className="font-bold text-base text-burgundy font-display">
                        {member.fullName}
                      </h3>
                      <div className="mt-1 space-y-0.5 text-xs text-charcoal-muted">
                        <p className="flex items-center gap-1.5" dir="ltr">
                          <Phone className="w-3 h-3 text-gold-600 shrink-0" />
                          <span>{member.phone}</span>
                        </p>
                        <p className="flex items-center gap-1.5" dir="ltr">
                          <Mail className="w-3 h-3 text-gold-600 shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </p>
                      </div>
                    </div>

                    {/* Badges: Voice Part & Tier */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {member.voicePart && (
                        <span className="text-[10px] font-semibold bg-burgundy-50 text-burgundy px-2 py-0.5 rounded-md border border-burgundy/20">
                          {member.voicePart}
                        </span>
                      )}
                      {member.tier && (
                        <span className="text-[10px] font-semibold bg-surface-canvas text-charcoal-muted px-2 py-0.5 rounded-md border border-surface-border">
                          {member.tier}
                        </span>
                      )}
                    </div>

                    {/* Assigned Roles Badges */}
                    <div className="pt-2 border-t border-surface-border/60">
                      <div className="text-[10px] font-bold text-charcoal-muted mb-1 flex items-center justify-between">
                        <span>الرتب الممنوحة:</span>
                        <button
                          onClick={() => handleOpenRoleModal(member)}
                          className="text-[10px] text-burgundy underline hover:text-burgundy-hover font-semibold cursor-pointer"
                        >
                          تعديل الرتب
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {member.roles.map((r, idx) => (
                          <span
                            key={idx}
                            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                              r === "SUPER_ADMIN"
                                ? "bg-red-700 text-white"
                                : r === "ADMIN"
                                ? "bg-burgundy text-white"
                                : r === "SUBSCRIPTION_MANAGER"
                                ? "bg-amber-600 text-white"
                                : "bg-gold-100 text-gold-900 border border-gold-300"
                            }`}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 mt-4 border-t border-surface-border flex items-center gap-2">
                    {isPending ? (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(member.id, "APPROVED")}
                          disabled={isProcessing}
                          className="flex-1 py-2 px-3 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>اعتماد</span>
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(member.id, "REJECTED")}
                          disabled={isProcessing}
                          className="py-2 px-3 rounded-full text-xs font-bold text-red-700 hover:bg-red-50 border border-red-200 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>رفض</span>
                        </button>
                      </>
                    ) : isApproved ? (
                      <button
                        onClick={() => handleUpdateStatus(member.id, "REJECTED")}
                        disabled={isProcessing}
                        className="w-full py-2 px-3 rounded-full text-xs font-bold text-charcoal hover:text-red-700 hover:bg-red-50 border border-surface-border transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>إلغاء الاعتماد (رفض)</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(member.id, "APPROVED")}
                        disabled={isProcessing}
                        className="w-full py-2 px-3 rounded-full text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>إعادة الاعتماد</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Roles Management Modal */}
        {editingRolesMember && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-surface-border animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-4">
                <div>
                  <h3 className="font-bold text-base text-burgundy font-display">
                    إدارة رتب العضو
                  </h3>
                  <p className="text-xs text-charcoal-muted">
                    {editingRolesMember.fullName}
                  </p>
                </div>
                <button
                  onClick={() => setEditingRolesMember(null)}
                  className="text-charcoal-muted hover:text-charcoal p-1 rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <p className="text-xs text-charcoal-muted mb-2">
                  اختر الرتب الممنوحة لهذا العضو (يمكن دمج أكثر من رتبة):
                </p>

                {/* Role MEMBER */}
                <label className="flex items-center justify-between p-3 rounded-xl border border-surface-border bg-surface-canvas cursor-pointer">
                  <div>
                    <span className="font-bold text-xs text-charcoal block">MEMBER (مرنم)</span>
                    <span className="text-[10px] text-charcoal-muted">رتبة العضوية الأساسية بالخدمة</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes("MEMBER")}
                    onChange={() => handleToggleRole("MEMBER")}
                    className="w-4 h-4 text-burgundy rounded accent-burgundy"
                  />
                </label>

                {/* Role ADMIN */}
                <label className="flex items-center justify-between p-3 rounded-xl border border-surface-border bg-surface-canvas cursor-pointer">
                  <div>
                    <span className="font-bold text-xs text-burgundy block">ADMIN (خادم إداري)</span>
                    <span className="text-[10px] text-charcoal-muted">إدارة البروفات، الحضور، واعتماد الأعذار</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes("ADMIN")}
                    onChange={() => handleToggleRole("ADMIN")}
                    className="w-4 h-4 text-burgundy rounded accent-burgundy"
                  />
                </label>

                {/* Role SUBSCRIPTION_MANAGER */}
                <label className="flex items-center justify-between p-3 rounded-xl border border-surface-border bg-surface-canvas cursor-pointer">
                  <div>
                    <span className="font-bold text-xs text-amber-800 block">SUBSCRIPTION_MANAGER (أمين الصندوق)</span>
                    <span className="text-[10px] text-charcoal-muted">إدارة الاشتراكات الشهرية وتسجيل الدفعات</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes("SUBSCRIPTION_MANAGER")}
                    onChange={() => handleToggleRole("SUBSCRIPTION_MANAGER")}
                    className="w-4 h-4 text-burgundy rounded accent-burgundy"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-border">
                <button
                  onClick={() => setEditingRolesMember(null)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-charcoal hover:bg-surface-canvas cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSaveRoles}
                  disabled={actionLoading === editingRolesMember.id}
                  className="px-5 py-2 rounded-full text-xs font-bold text-white bg-burgundy hover:bg-burgundy-hover shadow-sm cursor-pointer disabled:opacity-50"
                >
                  حفظ وتوثيق في سجل التدقيق
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
