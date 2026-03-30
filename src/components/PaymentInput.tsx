"use client";

import { useState, useEffect } from "react";

const PAYMENT_OPTIONS = [
  { key: "credit", label: "クレジットカード", hasDetail: true, detailLabel: "使える銘柄" },
  { key: "emoney", label: "電子マネー", hasDetail: true, detailLabel: "使える銘柄" },
  { key: "qr", label: "QRコード決済", hasDetail: true, detailLabel: "対応サービス" },
  { key: "dental_loan", label: "デンタルローン", hasDetail: false },
  { key: "insurance", label: "保険診療", hasDetail: false },
];

interface PaymentInputProps {
  value: string;
  onChange: (value: string) => void;
}

interface PaymentState {
  enabled: boolean;
  detail: string;
}

function parsePayment(value: string): Record<string, PaymentState> {
  const result: Record<string, PaymentState> = {};
  for (const opt of PAYMENT_OPTIONS) {
    result[opt.key] = { enabled: false, detail: "" };
  }
  if (!value) return result;

  for (const line of value.split("\n")) {
    for (const opt of PAYMENT_OPTIONS) {
      if (line.startsWith(opt.label)) {
        result[opt.key].enabled = true;
        const detailMatch = line.match(/[：:](.+)/);
        if (detailMatch) result[opt.key].detail = detailMatch[1].trim();
      }
    }
  }
  return result;
}

function serializePayment(data: Record<string, PaymentState>): string {
  return PAYMENT_OPTIONS
    .filter((opt) => data[opt.key].enabled)
    .map((opt) => {
      const d = data[opt.key];
      return d.detail ? `${opt.label}：${d.detail}` : opt.label;
    })
    .join("\n");
}

export default function PaymentInput({ value, onChange }: PaymentInputProps) {
  const [data, setData] = useState(() => parsePayment(value));

  useEffect(() => {
    onChange(serializePayment(data));
  }, [data]);

  function toggle(key: string) {
    setData((prev) => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }));
  }

  return (
    <div className="space-y-3">
      {PAYMENT_OPTIONS.map((opt) => (
        <div key={opt.key} className="space-y-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data[opt.key].enabled}
              onChange={() => toggle(opt.key)}
              className="rounded"
            />
            <span className="text-sm font-medium">{opt.label}</span>
          </label>
          {opt.hasDetail && data[opt.key].enabled && (
            <input
              type="text"
              className="ml-6 border rounded-lg px-3 py-1.5 text-sm w-full max-w-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder={opt.detailLabel}
              value={data[opt.key].detail}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  [opt.key]: { ...prev[opt.key], detail: e.target.value },
                }))
              }
            />
          )}
        </div>
      ))}
    </div>
  );
}
