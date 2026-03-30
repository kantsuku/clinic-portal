"use client";

import { useState, useEffect } from "react";

const SNS_PLATFORMS = [
  { key: "line", label: "LINE", placeholder: "LINE公式アカウントURL" },
  { key: "instagram", label: "Instagram", placeholder: "@アカウント名 or URL" },
  { key: "facebook", label: "Facebook", placeholder: "ページURL" },
  { key: "x", label: "X (旧Twitter)", placeholder: "@アカウント名 or URL" },
  { key: "tiktok", label: "TikTok", placeholder: "@アカウント名 or URL" },
  { key: "youtube", label: "YouTube", placeholder: "チャンネルURL" },
];

interface SnsInputProps {
  value: string;
  onChange: (value: string) => void;
}

function parseSns(value: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const p of SNS_PLATFORMS) result[p.key] = "";
  if (!value) return result;

  for (const line of value.split("\n")) {
    const [label, ...rest] = line.split("：");
    const val = rest.join("：").trim();
    const platform = SNS_PLATFORMS.find(
      (p) => p.label === label?.trim() || p.key === label?.trim().toLowerCase()
    );
    if (platform && val) result[platform.key] = val;
  }
  return result;
}

function serializeSns(data: Record<string, string>): string {
  return SNS_PLATFORMS
    .filter((p) => data[p.key])
    .map((p) => `${p.label}：${data[p.key]}`)
    .join("\n");
}

export default function SnsInput({ value, onChange }: SnsInputProps) {
  const [data, setData] = useState(() => parseSns(value));

  useEffect(() => {
    onChange(serializeSns(data));
  }, [data]);

  return (
    <div className="space-y-2">
      {SNS_PLATFORMS.map((p) => (
        <div key={p.key} className="flex items-center gap-3">
          <label className="w-28 text-sm font-medium text-gray-600 shrink-0">
            {p.label}
          </label>
          <input
            type="text"
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder={p.placeholder}
            value={data[p.key]}
            onChange={(e) =>
              setData((prev) => ({ ...prev, [p.key]: e.target.value }))
            }
          />
        </div>
      ))}
    </div>
  );
}
