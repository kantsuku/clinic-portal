"use client";

import { useState, useEffect, useRef } from "react";

const WEEKDAYS = ["月曜", "火曜", "水曜", "木曜", "金曜", "土曜", "日曜", "祝日"];

interface WeekdayHoursInputProps {
  value: string;
  onChange: (value: string) => void;
}

interface DaySchedule {
  closed: boolean;
  am_start: string;
  am_end: string;
  pm_start: string;
  pm_end: string;
}

function parseSchedule(value: string): Record<string, DaySchedule> {
  const schedule: Record<string, DaySchedule> = {};
  for (const day of WEEKDAYS) {
    schedule[day] = { closed: false, am_start: "", am_end: "", pm_start: "", pm_end: "" };
  }
  if (!value) return schedule;
  for (const line of value.split("\n")) {
    const match = line.match(/^(.+?)（午前）(.+?)-(.+?)（午後）(.+?)-(.+?)$/);
    if (match) {
      const day = match[1];
      if (schedule[day]) {
        schedule[day] = { closed: false, am_start: match[2].trim(), am_end: match[3].trim(), pm_start: match[4].trim(), pm_end: match[5].trim() };
      }
    } else if (line.includes("休診")) {
      const day = line.replace(/[：:].*/g, "").trim();
      if (schedule[day]) schedule[day].closed = true;
    }
  }
  return schedule;
}

function serializeSchedule(schedule: Record<string, DaySchedule>): string {
  return WEEKDAYS
    .map((day) => {
      const d = schedule[day];
      if (d.closed) return `${day}：休診`;
      if (!d.am_start && !d.pm_start) return "";
      return `${day}（午前）${d.am_start || "00:00"}-${d.am_end || "00:00"}（午後）${d.pm_start || "00:00"}-${d.pm_end || "00:00"}`;
    })
    .filter(Boolean)
    .join("\n");
}

export default function WeekdayHoursInput({ value, onChange }: WeekdayHoursInputProps) {
  const [schedule, setSchedule] = useState(() => parseSchedule(value));

  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return; }
    onChange(serializeSchedule(schedule));
  }, [schedule]);

  function updateDay(day: string, field: keyof DaySchedule, val: string | boolean) {
    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], [field]: val } }));
  }

  return (
    <div className="space-y-2">
      {WEEKDAYS.map((day) => (
        <div
          key={day}
          className="p-3"
          style={{
            borderRadius: "var(--md-shape-corner-sm)",
            background: schedule[day].closed ? "var(--md-surface-container-low)" : "var(--md-surface-container)",
            opacity: schedule[day].closed ? 0.6 : 1,
            border: "1px solid var(--md-outline-variant)",
          }}
        >
          {/* 曜日 + 休診チェック */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: "var(--md-on-surface)", fontWeight: 500 }}>
              {day}
            </span>
            <label className="flex items-center gap-2 cursor-pointer min-h-[44px] px-2">
              <input
                type="checkbox"
                checked={schedule[day].closed}
                onChange={(e) => updateDay(day, "closed", e.target.checked)}
                className="rounded"
              />
              <span className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>休診</span>
            </label>
          </div>

          {/* 時間入力（2行に分割） */}
          {!schedule[day].closed && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs shrink-0 w-8" style={{ color: "var(--md-on-surface-variant)" }}>午前</span>
                <input type="time" className="flex-1" value={schedule[day].am_start} onChange={(e) => updateDay(day, "am_start", e.target.value)} />
                <span className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>〜</span>
                <input type="time" className="flex-1" value={schedule[day].am_end} onChange={(e) => updateDay(day, "am_end", e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs shrink-0 w-8" style={{ color: "var(--md-on-surface-variant)" }}>午後</span>
                <input type="time" className="flex-1" value={schedule[day].pm_start} onChange={(e) => updateDay(day, "pm_start", e.target.value)} />
                <span className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>〜</span>
                <input type="time" className="flex-1" value={schedule[day].pm_end} onChange={(e) => updateDay(day, "pm_end", e.target.value)} />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
