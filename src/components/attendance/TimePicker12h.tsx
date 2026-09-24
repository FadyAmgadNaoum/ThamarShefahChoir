"use client";

import React, { useState, useEffect } from "react";
import { parse12hTime, to24hTime, formatTime12h } from "@/lib/attendance/time";
import { Clock } from "lucide-react";

interface TimePicker12hProps {
  label: string;
  value: string; // 24h format "HH:MM"
  onChange: (value24: string) => void;
  required?: boolean;
}

export default function TimePicker12h({
  label,
  value,
  onChange,
  required = false,
}: TimePicker12hProps) {
  const parsed = parse12hTime(value);

  const [hour, setHour] = useState<number>(parsed.hour);
  const [minute, setMinute] = useState<number>(parsed.minute);
  const [period, setPeriod] = useState<"AM" | "PM">(parsed.period);

  useEffect(() => {
    const p = parse12hTime(value);
    setHour(p.hour);
    setMinute(p.minute);
    setPeriod(p.period);
  }, [value]);

  const update = (newH: number, newM: number, newP: "AM" | "PM") => {
    setHour(newH);
    setMinute(newM);
    setPeriod(newP);
    const time24 = to24hTime(newH, newM, newP);
    onChange(time24);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-charcoal flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-gold-600" />
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </label>
        <span className="text-xs font-bold text-burgundy font-mono bg-burgundy-50 px-2 py-0.5 rounded-md border border-burgundy-100">
          {formatTime12h(value)}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {/* Hour Select (1-12) */}
        <div>
          <label className="text-[10px] text-charcoal-muted block mb-0.5">الساعة</label>
          <select
            value={hour}
            onChange={(e) => update(parseInt(e.target.value, 10), minute, period)}
            className="w-full px-2.5 py-2 rounded-xl bg-surface-canvas border border-surface-border text-xs font-semibold text-charcoal focus:border-gold outline-none cursor-pointer"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>

        {/* Minute Select (:00, :15, :30, :45, etc.) */}
        <div>
          <label className="text-[10px] text-charcoal-muted block mb-0.5">الدقيقة</label>
          <select
            value={minute}
            onChange={(e) => update(hour, parseInt(e.target.value, 10), period)}
            className="w-full px-2.5 py-2 rounded-xl bg-surface-canvas border border-surface-border text-xs font-semibold text-charcoal focus:border-gold outline-none cursor-pointer font-mono"
          >
            {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
              <option key={m} value={m}>
                {String(m).padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>

        {/* Period (PM / AM) */}
        <div>
          <label className="text-[10px] text-charcoal-muted block mb-0.5">الفترة</label>
          <div className="grid grid-cols-2 gap-1 bg-surface-canvas p-1 rounded-xl border border-surface-border">
            <button
              type="button"
              onClick={() => update(hour, minute, "PM")}
              className={`py-1 rounded-lg text-xs font-bold transition-colors ${
                period === "PM"
                  ? "bg-burgundy text-white shadow-xs"
                  : "text-charcoal-muted hover:text-charcoal"
              }`}
            >
              مساءً
            </button>
            <button
              type="button"
              onClick={() => update(hour, minute, "AM")}
              className={`py-1 rounded-lg text-xs font-bold transition-colors ${
                period === "AM"
                  ? "bg-burgundy text-white shadow-xs"
                  : "text-charcoal-muted hover:text-charcoal"
              }`}
            >
              صباحاً
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

