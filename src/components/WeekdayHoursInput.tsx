"use client";

import { useState, useEffect } from "react";

const WEEKDAYS = [
  "月曜",
  "火曜",
  "水曜",
  "木曜",
  "金曜",
  "土曜",
  "日曜",
  "祝日",
];

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
    schedule[day] = {
      closed: false,
      am_start: "",
      am_end: "",
      pm_start: "",
      pm_end: "",
    };
  }
  if (!value) return schedule;

  for (const line of value.split("\n")) {
    const match = line.match(
      /^(.+?)（午前）(.+?)-(.+?)（午後）(.+?)-(.+?)$/
    );
    if (match) {
      const day = match[1];
      if (schedule[day]) {
        schedule[day] = {
          closed: false,
          am_start: match[2].trim(),
          am_end: match[3].trim(),
          pm_start: match[4].trim(),
          pm_end: match[5].trim(),
        };
      }
    } else if (line.includes("休診")) {
      const day = line.replace(/[：:].*/g, "").trim();
      if (schedule[day]) {
        schedule[day].closed = true;
      }
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

export default function WeekdayHoursInput({
  value,
  onChange,
}: WeekdayHoursInputProps) {
  const [schedule, setSchedule] = useState(() => parseSchedule(value));

  useEffect(() => {
    onChange(serializeSchedule(schedule));
  }, [schedule]);

  function updateDay(day: string, field: keyof DaySchedule, val: string | boolean) {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: val },
    }));
  }

  return (
    <div className="space-y-2">
      <div className="hidden sm:grid grid-cols-[80px_1fr_1fr_1fr_1fr_60px] gap-2 text-xs text-gray-500 font-medium px-1">
        <div></div>
        <div>午前 開始</div>
        <div>午前 終了</div>
        <div>午後 開始</div>
        <div>午後 終了</div>
        <div>休診</div>
      </div>
      {WEEKDAYS.map((day) => (
        <div
          key={day}
          className={`grid grid-cols-2 sm:grid-cols-[80px_1fr_1fr_1fr_1fr_60px] gap-2 items-center p-2 rounded-lg ${
            schedule[day].closed ? "bg-gray-100 opacity-60" : "bg-white"
          }`}
        >
          <span className="font-medium text-sm col-span-2 sm:col-span-1">
            {day}
          </span>
          <input
            type="time"
            className="border rounded px-2 py-1 text-sm disabled:bg-gray-100"
            value={schedule[day].am_start}
            disabled={schedule[day].closed}
            onChange={(e) => updateDay(day, "am_start", e.target.value)}
          />
          <input
            type="time"
            className="border rounded px-2 py-1 text-sm disabled:bg-gray-100"
            value={schedule[day].am_end}
            disabled={schedule[day].closed}
            onChange={(e) => updateDay(day, "am_end", e.target.value)}
          />
          <input
            type="time"
            className="border rounded px-2 py-1 text-sm disabled:bg-gray-100"
            value={schedule[day].pm_start}
            disabled={schedule[day].closed}
            onChange={(e) => updateDay(day, "pm_start", e.target.value)}
          />
          <input
            type="time"
            className="border rounded px-2 py-1 text-sm disabled:bg-gray-100"
            value={schedule[day].pm_end}
            disabled={schedule[day].closed}
            onChange={(e) => updateDay(day, "pm_end", e.target.value)}
          />
          <label className="flex items-center gap-1 text-sm cursor-pointer justify-center">
            <input
              type="checkbox"
              checked={schedule[day].closed}
              onChange={(e) => updateDay(day, "closed", e.target.checked)}
              className="rounded"
            />
            <span className="hidden sm:inline">休</span>
          </label>
        </div>
      ))}
    </div>
  );
}
