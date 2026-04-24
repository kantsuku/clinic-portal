"use client";

import { useState, useEffect, useRef } from "react";

export interface ToneCategory {
  name: string;
  key: string;
  options: string[];
  multiple?: boolean;
  custom?: boolean;
}

interface ToneMannerInputProps {
  value: string;
  onChange: (value: string) => void;
  categories: ToneCategory[];
}

function parseTone(value: string): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  if (!value) return result;
  for (const line of value.split("\n")) {
    const match = line.match(/^【(.+?)】(.+)/);
    if (match) {
      result[match[1]] = match[2].split("、").map((s) => s.trim()).filter(Boolean);
    }
  }
  return result;
}

function serializeTone(data: Record<string, string[]>): string {
  return Object.entries(data)
    .filter(([, vals]) => vals.length > 0)
    .map(([key, vals]) => `【${key}】${vals.join("、")}`)
    .join("\n");
}

export default function ToneMannerInput({
  value,
  onChange,
  categories,
}: ToneMannerInputProps) {
  const [data, setData] = useState<Record<string, string[]>>(() => {
    const parsed = parseTone(value);
    const initial: Record<string, string[]> = {};
    for (const cat of categories) {
      initial[cat.key] = parsed[cat.key] || [];
    }
    return initial;
  });
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});

  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return; }
    onChange(serializeTone(data));
  }, [data]);

  function toggleOption(key: string, option: string, multiple: boolean) {
    setData((prev) => {
      const current = prev[key] || [];
      if (multiple) {
        return {
          ...prev,
          [key]: current.includes(option)
            ? current.filter((o) => o !== option)
            : [...current, option],
        };
      }
      return {
        ...prev,
        [key]: current.includes(option) ? [] : [option],
      };
    });
  }

  function addCustom(key: string) {
    const val = (customInputs[key] || "").trim();
    if (!val) return;
    setData((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), val],
    }));
    setCustomInputs((prev) => ({ ...prev, [key]: "" }));
  }

  function removeCustom(key: string, option: string) {
    setData((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((o) => o !== option),
    }));
  }

  return (
    <div className="space-y-4">
      {categories.map((cat) => {
        const selected = data[cat.key] || [];
        const customValues = selected.filter((s) => !cat.options.includes(s));

        return (
          <div key={cat.key}>
            <p
              className="text-xs font-medium mb-2"
              style={{ color: "var(--md-on-surface)" }}
            >
              {cat.name}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {cat.options.map((opt) => {
                const isSelected = selected.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleOption(cat.key, opt, !!cat.multiple)}
                    className="text-xs font-medium px-3 py-1.5 transition-all"
                    style={{
                      background: isSelected ? "var(--md-primary)" : "var(--md-surface-container)",
                      color: isSelected ? "var(--md-on-primary)" : "var(--md-on-surface-variant)",
                      borderRadius: "100px",
                      border: isSelected ? "none" : "1px solid var(--md-outline)",
                      cursor: "pointer",
                    }}
                  >
                    {opt}
                  </button>
                );
              })}

              {/* カスタム追加された値 */}
              {customValues.map((cv) => (
                <button
                  key={cv}
                  type="button"
                  onClick={() => removeCustom(cat.key, cv)}
                  className="text-xs font-medium px-3 py-1.5 flex items-center gap-1"
                  style={{
                    background: "var(--md-primary)",
                    color: "var(--md-on-primary)",
                    borderRadius: "100px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {cv}
                  <span className="opacity-60">✕</span>
                </button>
              ))}
            </div>

            {/* カスタム追加フィールド */}
            {cat.custom && (
              <div className="flex gap-1.5 mt-2">
                <input
                  type="text"
                  className="flex-1 text-xs"
                  placeholder="その他を追加..."
                  value={customInputs[cat.key] || ""}
                  onChange={(e) =>
                    setCustomInputs((prev) => ({ ...prev, [cat.key]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustom(cat.key);
                    }
                  }}
                  style={{ padding: "6px 12px" }}
                />
                <button
                  type="button"
                  onClick={() => addCustom(cat.key)}
                  className="text-[11px] font-medium px-3 py-1 shrink-0"
                  style={{
                    background: "var(--md-surface-container-high)",
                    color: "var(--md-on-surface-variant)",
                    borderRadius: "100px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  追加
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
