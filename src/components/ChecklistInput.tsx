"use client";

import { useState, useEffect, useMemo } from "react";
import PrimaryInfoMeter from "./PrimaryInfoMeter";
import RewriteButton from "./RewriteButton";

export interface ChecklistCategory {
  name: string;
  items: string[];
}

interface ChecklistInputProps {
  value: string;
  onChange: (value: string) => void;
  categories: ChecklistCategory[];
}

type ItemStatus = "none" | "yes" | "strength";

interface ItemState {
  status: ItemStatus;
  detail: string;
}

function parseChecklist(value: string): Record<string, ItemState> {
  const result: Record<string, ItemState> = {};
  if (!value) return result;

  for (const block of value.split("\n\n")) {
    const lines = block.trim().split("\n");
    if (lines.length === 0) continue;
    const headerMatch = lines[0].match(/^【(.+?)】\s*(.+)/);
    if (headerMatch) {
      const item = headerMatch[1];
      const statusText = headerMatch[2];
      const status: ItemStatus = statusText.includes("こだわり") ? "strength" : "yes";
      const detail = lines.slice(1).join("\n").replace(/^>\s*/gm, "").trim();
      result[item] = { status, detail };
    }
  }
  return result;
}

function serializeChecklist(states: Record<string, ItemState>): string {
  return Object.entries(states)
    .filter(([, s]) => s.status !== "none")
    .map(([item, s]) => {
      const statusLabel = s.status === "strength" ? "こだわりあり" : "対応";
      const header = `【${item}】${statusLabel}`;
      return s.detail ? `${header}\n>${s.detail}` : header;
    })
    .join("\n\n");
}

const STATUS_OPTIONS: { value: ItemStatus; label: string; color: string; bg: string }[] = [
  { value: "none", label: "なし", color: "var(--md-on-surface-variant)", bg: "var(--md-surface-container-low)" },
  { value: "yes", label: "あり", color: "var(--md-primary)", bg: "var(--md-primary-container)" },
  { value: "strength", label: "こだわり", color: "var(--md-tertiary)", bg: "var(--md-tertiary-container)" },
];

export default function ChecklistInput({
  value,
  onChange,
  categories,
}: ChecklistInputProps) {
  const [states, setStates] = useState<Record<string, ItemState>>(() => {
    const parsed = parseChecklist(value);
    // 全アイテムの初期状態を設定
    const initial: Record<string, ItemState> = {};
    for (const cat of categories) {
      for (const item of cat.items) {
        initial[item] = parsed[item] || { status: "none", detail: "" };
      }
    }
    return initial;
  });

  const [activeTab, setActiveTab] = useState(0);
  const [customInput, setCustomInput] = useState("");

  function addCustomItem() {
    const name = customInput.trim();
    if (!name) return;
    // 既に存在するかチェック
    if (states[name]) {
      setCustomInput("");
      return;
    }
    setStates((prev) => ({
      ...prev,
      [name]: { status: "yes", detail: "" },
    }));
    setCustomInput("");
  }

  useEffect(() => {
    onChange(serializeChecklist(states));
  }, [states]);

  function setStatus(item: string, status: ItemStatus) {
    setStates((prev) => ({
      ...prev,
      [item]: { ...prev[item], status, detail: prev[item]?.detail || "" },
    }));
  }

  function setDetail(item: string, detail: string) {
    setStates((prev) => ({
      ...prev,
      [item]: { ...prev[item], detail },
    }));
  }

  const currentCat = categories[activeTab];
  const allDefinedItems = useMemo(() => new Set(categories.flatMap((c) => c.items)), [categories]);
  const customItems = useMemo(() => Object.keys(states).filter((k) => !allDefinedItems.has(k)), [states, allDefinedItems]);
  const yesCount = useMemo(() => Object.values(states).filter((s) => s.status === "yes" || s.status === "strength").length, [states]);
  const strengthCount = useMemo(() => Object.values(states).filter((s) => s.status === "strength").length, [states]);

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div
        className="flex items-center gap-3 px-3 py-2"
        style={{
          background: "var(--md-surface-container-low)",
          borderRadius: "var(--md-shape-corner-sm)",
        }}
      >
        <span className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
          <strong style={{ color: "var(--md-primary)" }}>{yesCount}</strong> 対応
        </span>
        <span className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
          <strong style={{ color: "var(--md-tertiary)" }}>{strengthCount}</strong> こだわり
        </span>
        <span className="text-xs ml-auto" style={{ color: "var(--md-on-surface-variant)" }}>
          / {Object.keys(states).length} 項目
        </span>
      </div>

      {/* Tabs (wrap) */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map((cat, i) => {
          const catYes = cat.items.filter(
            (item) => states[item]?.status === "yes" || states[item]?.status === "strength"
          ).length;
          return (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className="text-xs font-medium px-3 py-2 transition-colors"
              style={{
                background: i === activeTab ? "var(--md-primary)" : "var(--md-surface-container)",
                color: i === activeTab ? "var(--md-on-primary)" : "var(--md-on-surface-variant)",
                borderRadius: "100px",
                border: i === activeTab ? "none" : "1px solid var(--md-outline-variant)",
                cursor: "pointer",
              }}
            >
              {cat.name}
              {catYes > 0 && (
                <span className="ml-1 opacity-70">({catYes})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Items */}
      <div className="space-y-2">
        {currentCat.items.map((item) => {
          const state = states[item] || { status: "none", detail: "" };
          return (
            <div
              key={item}
              className="p-3"
              style={{
                background: state.status === "none"
                  ? "var(--md-surface-container-low)"
                  : state.status === "strength"
                    ? "var(--md-tertiary-container)"
                    : "var(--md-surface-container)",
                borderRadius: "var(--md-shape-corner-md)",
                border: state.status === "strength"
                  ? "1px solid var(--md-tertiary)"
                  : "1px solid var(--md-outline-variant)",
                transition: "all 0.2s",
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className="text-sm font-medium"
                  style={{
                    color: state.status === "none"
                      ? "var(--md-on-surface-variant)"
                      : "var(--md-on-surface)",
                  }}
                >
                  {item}
                </span>
                <div className="flex gap-1 shrink-0">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setStatus(item, opt.value)}
                      className="text-[11px] font-medium px-3 py-2 min-h-[36px] transition-all"
                      style={{
                        background: state.status === opt.value ? opt.bg : "transparent",
                        color: state.status === opt.value ? opt.color : "var(--md-on-surface-variant)",
                        borderRadius: "100px",
                        border: state.status === opt.value
                          ? `1px solid ${opt.color}`
                          : "1px solid transparent",
                        cursor: "pointer",
                        fontWeight: state.status === opt.value ? 600 : 400,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* こだわりの場合は詳細入力 */}
              {state.status === "strength" && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <img src="/ponko.png" alt="" className="w-4 h-4" />
                    <p className="text-[11px] font-medium" style={{ color: "var(--md-tertiary)" }}>
                      どんなこだわりがありますか？教えてください！
                    </p>
                  </div>
                  <textarea
                    className="w-full resize-y"
                    rows={3}
                    placeholder={`「${item}」へのこだわりや、具体的な取り組みを教えてください`}
                    value={state.detail}
                    onChange={(e) => setDetail(item, e.target.value)}
                  />
                  <RewriteButton
                    text={state.detail}
                    title={item}
                    onRewrite={(rewritten) => setDetail(item, rewritten)}
                  />
                  <PrimaryInfoMeter
                    text={`${item} ${state.detail}`}
                    onAppendText={(t) => setDetail(item, state.detail + t)}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* カスタム追加項目 */}
        {customItems.length > 0 && (
          <>
            <p
              className="text-[11px] font-medium mt-2 px-1"
              style={{ color: "var(--md-on-surface-variant)" }}
            >
              追加した項目
            </p>
            {customItems.map((item) => {
              const state = states[item] || { status: "yes", detail: "" };
              return (
                <div
                  key={item}
                  className="p-3"
                  style={{
                    background: state.status === "strength"
                      ? "var(--md-tertiary-container)"
                      : "var(--md-surface-container)",
                    borderRadius: "var(--md-shape-corner-md)",
                    border: state.status === "strength"
                      ? "1px solid var(--md-tertiary)"
                      : "1px solid var(--md-outline-variant)",
                    transition: "all 0.2s",
                  }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-sm font-medium" style={{ color: "var(--md-on-surface)" }}>
                      {item}
                    </span>
                    <div className="flex gap-1 shrink-0">
                      {STATUS_OPTIONS.filter((o) => o.value !== "none").map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setStatus(item, opt.value)}
                          className="text-[11px] font-medium px-3 py-2 min-h-[36px] transition-all"
                          style={{
                            background: state.status === opt.value ? opt.bg : "transparent",
                            color: state.status === opt.value ? opt.color : "var(--md-on-surface-variant)",
                            borderRadius: "100px",
                            border: state.status === opt.value ? `1px solid ${opt.color}` : "1px solid transparent",
                            cursor: "pointer",
                            fontWeight: state.status === opt.value ? 600 : 400,
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setStates((prev) => {
                            const next = { ...prev };
                            delete next[item];
                            return next;
                          });
                        }}
                        className="text-[11px] px-1.5 py-1 transition-colors"
                        style={{ color: "var(--md-on-surface-variant)", background: "none", border: "none", cursor: "pointer" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--md-error)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--md-on-surface-variant)")}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  {state.status === "strength" && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <img src="/ponko.png" alt="" className="w-4 h-4" />
                        <p className="text-[11px] font-medium" style={{ color: "var(--md-tertiary)" }}>
                          どんなこだわりがありますか？教えてください！
                        </p>
                      </div>
                      <textarea
                        className="w-full resize-y"
                        rows={3}
                        placeholder={`「${item}」へのこだわりや、具体的な取り組みを教えてください`}
                        value={state.detail}
                        onChange={(e) => setDetail(item, e.target.value)}
                      />
                      <RewriteButton text={state.detail} title={item} onRewrite={(r) => setDetail(item, r)} />
                      <PrimaryInfoMeter text={`${item} ${state.detail}`} onAppendText={(t) => setDetail(item, state.detail + t)} />
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* 自由入力追加 */}
        <div
          className="flex gap-2 p-2"
          style={{
            background: "var(--md-surface-container-low)",
            borderRadius: "var(--md-shape-corner-md)",
            border: "2px dashed var(--md-outline)",
          }}
        >
          <input
            type="text"
            className="flex-1"
            placeholder="リストにない項目を追加..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomItem();
              }
            }}
          />
          <button
            type="button"
            onClick={addCustomItem}
            disabled={!customInput.trim()}
            className="text-xs font-medium px-4 py-2 shrink-0 transition-colors"
            style={{
              background: customInput.trim() ? "var(--md-primary)" : "var(--md-surface-container-high)",
              color: customInput.trim() ? "var(--md-on-primary)" : "var(--md-on-surface-variant)",
              borderRadius: "100px",
              border: "none",
              cursor: customInput.trim() ? "pointer" : "default",
            }}
          >
            追加
          </button>
        </div>
      </div>
    </div>
  );
}
