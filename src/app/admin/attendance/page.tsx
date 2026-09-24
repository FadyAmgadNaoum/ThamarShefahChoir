"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Home,
  RefreshCw,
  Search,
  Filter,
  Layers,
  Radio,
  Download,
  Inbox,
} from "lucide-react";
import { formatTime12h } from "@/lib/attendance/time";

interface RehearsalItem {
  id: string;
  quarterId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  locationName: string;
  radiusMeters: number;
}

interface Attendee {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  voicePart: string;
  tier: string;
  photoUrl?: string | null;
  checkInTime: string;
  checkOutTime?: string | null;
  distanceMeters: number;
  status: string;
  meta: {
    labelAr: string;
    descriptionAr?: string;
    badgeClass: string;
    textClass: string;
  };
  notes?: string | null;
}

interface RosterStats {
  total: number;
  present: number;
  late: number;
  veryLate: number;
  extremeLate: number;
}

const VOICE_PARTS_AR: Record<string, string> = {
  SOPRANO: "سوبرانو (Soprano)",
  ALTO: "ألتو (Alto)",
  TENOR: "تينور (Tenor)",
  BASS: "باص (Bass)",
  UNASSIGNED: "غير محدد",
};

export default function AdminAttendanceRosterPage() {
  const router = useRouter();
  const [rehearsals, setRehearsals] = useState<RehearsalItem[]>([]);
  const [selectedRehearsalId, setSelectedRehearsalId] = useState<string>("");
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [stats, setStats] = useState<RosterStats>({
    total: 0,
    present: 0,
    late: 0,
    veryLate: 0,
    extremeLate: 0,
  });

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [voicePartFilter, setVoicePartFilter] = useState("ALL");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 1. Fetch rehearsals list
  const fetchRehearsals = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/rehearsals");
      if (!res.ok) {
        if (res.status === 403 || res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to load");
      }
      const data = (await res.json()) as { rehearsals?: RehearsalItem[] };
      const list = data.rehearsals || [];
      setRehearsals(list);

      if (list.length > 0 && !selectedRehearsalId) {
        setSelectedRehearsalId(list[0].id);
        await fetchRoster(list[0].id);
      }
    } catch {
      setFeedback({ type: "error", text: "فشل تحميل قائمة البروفات" });
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch roster for selected rehearsal
  const fetchRoster = async (rehId: string) => {
    if (!rehId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/attendance/roster?rehearsalId=${rehId}`);
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as {
        attendees?: Attendee[];
        stats?: RosterStats;
      };
      setAttendees(data.attendees || []);
      if (data.stats) setStats(data.stats);
    } catch {
      setFeedback({ type: "error", text: "فشل تحميل سجل الحضور للبروفة المحددة" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRehearsals();
  }, []);

  const handleRehearsalChange = (rehId: string) => {
    setSelectedRehearsalId(rehId);
    fetchRoster(rehId);
  };

  // Filter attendees
  const filteredAttendees = attendees.filter((a) => {
    const matchesSearch =
      a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.phone.includes(searchQuery) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVoice = voicePartFilter === "ALL" || a.voicePart === voicePartFilter;
    return matchesSearch && matchesVoice;
  });

  const selectedRehearsal = rehearsals.find((r) => r.id === selectedRehearsalId);

  return (
    <div className="min-h-screen bg-surface-canvas text-charcoal font-sans pb-16">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-6">
        {/* Page Title Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-100/80 border border-gold-300 text-burgundy text-xs font-bold mb-2 shadow-2xs">
              <Radio className="w-3.5 h-3.5 text-gold" />
              <span>رادار الحضور اللحظي</span>
            </div>
            <h1 className="font-display font-bold text-xl sm:text-2xl text-charcoal">
              متابعة الحضور المباشر (Live Attendance)
            </h1>
            <p className="text-xs text-charcoal-muted mt-0.5">
              سجل الحضور اللحظي بالـ GPS، واعتماد الانصراف، ومتابعة نسبة اكتمال البروفة.
            </p>
          </div>
        </div>
        {/* Rehearsal Selector Strip */}
        <div className="bg-white rounded-3xl border border-surface-border p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 w-full sm:w-auto">
            <label className="block text-xs font-bold text-charcoal-muted mb-1.5">
              اختر البروفة لعرض سجل حضورها اللحظي:
            </label>
            <select
              value={selectedRehearsalId}
              onChange={(e) => handleRehearsalChange(e.target.value)}
              className="w-full max-w-md px-4 py-2.5 rounded-2xl bg-surface-canvas border border-surface-border text-sm font-semibold text-charcoal focus:ring-2 focus:ring-gold outline-none"
            >
              {rehearsals.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} — ({r.date} من {formatTime12h(r.startTime)} إلى {formatTime12h(r.endTime)})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchRoster(selectedRehearsalId)}
              className="px-4 py-2 rounded-full text-xs font-semibold bg-surface-canvas border border-surface-border text-charcoal hover:bg-gray-100 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-burgundy" : ""}`} />
              <span>تحديث السجل</span>
            </button>
            <Link
              href="/attendance"
              className="px-4 py-2 rounded-full text-xs font-bold bg-burgundy text-white hover:bg-burgundy-900 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Radio className="w-3.5 h-3.5 text-gold" />
              <span>شاشة تسجيل حضور العضو</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-surface-border shadow-xs">
            <span className="text-[11px] text-charcoal-muted font-medium">إجمالي الحضور</span>
            <div className="text-2xl font-display font-black text-burgundy mt-1">{stats.total}</div>
          </div>
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 shadow-xs">
            <span className="text-[11px] text-emerald-800 font-medium">حاضر في ميعادك</span>
            <div className="text-2xl font-display font-black text-emerald-700 mt-1">{stats.present}</div>
          </div>
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 shadow-xs">
            <span className="text-[11px] text-amber-800 font-medium">متأخر (LATE)</span>
            <div className="text-2xl font-display font-black text-amber-700 mt-1">{stats.late}</div>
          </div>
          <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 shadow-xs">
            <span className="text-[11px] text-orange-800 font-medium">تأخير كبير</span>
            <div className="text-2xl font-display font-black text-orange-700 mt-1">{stats.veryLate}</div>
          </div>
          <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100 shadow-xs col-span-2 sm:col-span-1">
            <span className="text-[11px] text-red-800 font-medium">تأخير حرج (&gt;60د)</span>
            <div className="text-2xl font-display font-black text-red-700 mt-1">{stats.extremeLate}</div>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="bg-white rounded-3xl border border-surface-border p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-charcoal-muted absolute right-3.5 top-3" />
              <input
                type="text"
                placeholder="بحث بالاسم أو الهاتف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 text-xs rounded-full bg-surface-canvas border border-surface-border focus:ring-2 focus:ring-gold outline-none"
              />
            </div>

            {/* Voice Part Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <span className="text-xs text-charcoal-muted shrink-0 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                الصوت:
              </span>
              {["ALL", "SOPRANO", "ALTO", "TENOR", "BASS"].map((vp) => (
                <button
                  key={vp}
                  onClick={() => setVoicePartFilter(vp)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    voicePartFilter === vp
                      ? "bg-burgundy text-white"
                      : "bg-surface-canvas text-charcoal hover:bg-gray-200"
                  }`}
                >
                  {vp === "ALL" ? "الكل" : VOICE_PARTS_AR[vp] || vp}
                </button>
              ))}
            </div>
          </div>

          {/* Attendees Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-surface-canvas text-charcoal-muted uppercase text-[11px] border-y border-surface-border">
                <tr>
                  <th className="py-3 px-4">العضو</th>
                  <th className="py-3 px-4">طبقة الصوت</th>
                  <th className="py-3 px-4">وقت الحضور</th>
                  <th className="py-3 px-4">دليل الـ GPS</th>
                  <th className="py-3 px-4">الحالة المسندة</th>
                  <th className="py-3 px-4">الانصراف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filteredAttendees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-charcoal-muted">
                      {loading ? "جاري تحميل السجل..." : "لم يتم تسجيل أي حضور لهذه البروفة حتى الآن."}
                    </td>
                  </tr>
                ) : (
                  filteredAttendees.map((att) => (
                    <tr key={att.id} className="hover:bg-surface-canvas/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-charcoal">{att.fullName}</div>
                        <div className="text-[11px] text-charcoal-muted font-mono">{att.phone || att.email}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-surface-canvas border border-surface-border text-charcoal">
                          {VOICE_PARTS_AR[att.voicePart] || att.voicePart}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium">
                        {att.checkInTime ? new Date(att.checkInTime).toLocaleTimeString("ar-EG") : "-"}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-mono font-bold text-emerald-700">
                          <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                          <span>{att.distanceMeters} م</span>
                        </div>
                        <span className="text-[10px] text-charcoal-muted">ضمن الـ 100م</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${att.meta.badgeClass}`}
                        >
                          {att.meta.labelAr}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-charcoal-muted">
                        {att.checkOutTime ? (
                          <span className="text-emerald-700 font-semibold">
                            {new Date(att.checkOutTime).toLocaleTimeString("ar-EG")}
                          </span>
                        ) : (
                          <span className="text-charcoal-muted/60">مستمر</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

