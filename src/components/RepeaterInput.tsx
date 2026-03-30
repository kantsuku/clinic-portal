"use client";

import { useState, useEffect } from "react";
import { getEquipmentSuggestion } from "@/lib/suggestions";
import PrimaryInfoMeter from "./PrimaryInfoMeter";
import RewriteButton from "./RewriteButton";

interface RepeaterInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  defaultCount?: number;
  suggestions?: { title: string; description: string }[];
  enableAiSuggest?: boolean;
}

interface RepeaterItem {
  title: string;
  description: string;
}

function createEmptyItems(count: number): RepeaterItem[] {
  return Array.from({ length: count }, () => ({ title: "", description: "" }));
}

function parseItems(value: string, defaultCount: number): RepeaterItem[] {
  if (!value) return createEmptyItems(defaultCount);

  const items: RepeaterItem[] = [];
  const blocks = value.split(/■/).filter(Boolean);

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    const title = lines[0]?.replace(/^[\d.]+\s*/, "").trim() || "";
    const desc = lines
      .slice(1)
      .map((l) => l.replace(/^>\s*/, "").trim())
      .filter(Boolean)
      .join("\n");
    items.push({ title, description: desc });
  }

  // デフォルト件数に満たなければ空枠を追加
  while (items.length < defaultCount) {
    items.push({ title: "", description: "" });
  }

  return items;
}

function serializeItems(items: RepeaterItem[]): string {
  return items
    .filter((item) => item.title || item.description)
    .map((item) => {
      const desc = item.description ? `\n>${item.description}` : "";
      return `■${item.title}${desc}`;
    })
    .join("\n\n");
}

export default function RepeaterInput({
  value,
  onChange,
  placeholder,
  defaultCount = 1,
  suggestions,
  enableAiSuggest = false,
}: RepeaterInputProps) {
  const [items, setItems] = useState(() => parseItems(value, defaultCount));
  const [activeSuggest, setActiveSuggest] = useState<number | null>(null);
  const [titleLoading, setTitleLoading] = useState<number | null>(null);
  const [titleCandidates, setTitleCandidates] = useState<{ index: number; titles: string[] } | null>(null);

  useEffect(() => {
    onChange(serializeItems(items));
  }, [items]);

  function updateItem(
    index: number,
    field: keyof RepeaterItem,
    val: string
  ) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );

    // AIサジェスト: タイトル入力時に説明文を提案
    if (enableAiSuggest && field === "title" && val.length >= 2) {
      const suggestion = getEquipmentSuggestion(val);
      if (suggestion) {
        setActiveSuggest(index);
      } else {
        if (activeSuggest === index) setActiveSuggest(null);
      }
    }
  }

  function applySuggestion(index: number, desc: string) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, description: desc } : item
      )
    );
    setActiveSuggest(null);
  }

  function applyTemplateSuggestion(s: { title: string; description: string }) {
    // 最初の空枠に入れる
    const emptyIdx = items.findIndex((it) => !it.title && !it.description);
    if (emptyIdx !== -1) {
      setItems((prev) =>
        prev.map((item, i) =>
          i === emptyIdx ? { title: s.title, description: s.description } : item
        )
      );
    } else {
      setItems((prev) => [
        ...prev,
        { title: s.title, description: s.description },
      ]);
    }
  }

  async function generateTitle(index: number) {
    const item = items[index];
    if (!item.description || item.description.trim().length < 10) return;

    setTitleLoading(index);
    setTitleCandidates(null);
    try {
      const res = await fetch("/api/generate-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: item.description }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTitleCandidates({ index, titles: data.titles });
    } catch {
      // エラーは静かに無視
    } finally {
      setTitleLoading(null);
    }
  }

  function applyTitle(index: number, title: string) {
    updateItem(index, "title", title);
    setTitleCandidates(null);
  }

  function addItem() {
    setItems((prev) => [...prev, { title: "", description: "" }]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
    if (activeSuggest === index) setActiveSuggest(null);
  }

  return (
    <div className="space-y-3">
      {/* テンプレートサジェスション（上部に配置） */}
      {suggestions && suggestions.length > 0 && (
        <div
          className="p-3"
          style={{
            background: "var(--md-surface-container-low)",
            borderRadius: "var(--md-shape-corner-md)",
          }}
        >
          <p
            className="text-xs font-medium mb-2 flex items-center gap-1.5"
            style={{ color: "var(--md-on-surface-variant)" }}
          >
            <svg className="w-4 h-4" style={{ color: "var(--md-primary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            よくある例（タップで挿入）
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyTemplateSuggestion(s)}
                className="text-xs px-2.5 py-1.5 font-medium transition-colors"
                style={{
                  background: "var(--md-surface-container)",
                  color: "var(--md-primary)",
                  borderRadius: "100px",
                  border: "1px solid var(--md-outline)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--md-primary-container)";
                  e.currentTarget.style.borderColor = "var(--md-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--md-surface-container)";
                  e.currentTarget.style.borderColor = "var(--md-outline)";
                }}
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {items.map((item, index) => {
        const aiSuggestion =
          enableAiSuggest && item.title.length >= 2
            ? getEquipmentSuggestion(item.title)
            : null;

        return (
          <div
            key={index}
            className="p-3 space-y-2 relative group"
            style={{
              background: "var(--md-surface-container-low)",
              borderRadius: "var(--md-shape-corner-md)",
              border: "1px solid var(--md-outline-variant)",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono w-6" style={{ color: "var(--md-on-surface-variant)" }}>
                {index + 1}.
              </span>
              <input
                type="text"
                className="flex-1"
                placeholder={placeholder || "タイトル"}
                value={item.title}
                onChange={(e) => updateItem(index, "title", e.target.value)}
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="transition-colors p-2 min-w-[36px] min-h-[36px] flex items-center justify-center"
                style={{ color: "var(--md-on-surface-variant)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--md-error)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--md-on-surface-variant)")}
                  aria-label="削除"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* キャッチコピー生成ボタン（説明文がある場合に表示） */}
            {item.description && item.description.trim().length >= 10 && !item.title && (
              <div className="ml-6">
                <button
                  type="button"
                  onClick={() => generateTitle(index)}
                  disabled={titleLoading === index}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 transition-all"
                  style={{
                    background: "var(--md-tertiary-container)",
                    color: "var(--md-tertiary)",
                    borderRadius: "100px",
                    border: "none",
                    cursor: titleLoading === index ? "wait" : "pointer",
                    opacity: titleLoading === index ? 0.7 : 1,
                  }}
                >
                  {titleLoading === index ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      生成中...
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      本文からキャッチコピーを生成
                    </>
                  )}
                </button>
              </div>
            )}

            {/* キャッチコピー候補 */}
            {titleCandidates && titleCandidates.index === index && (
              <div
                className="ml-6 p-3 space-y-2"
                style={{
                  background: "var(--md-tertiary-container)",
                  borderRadius: "var(--md-shape-corner-md)",
                }}
              >
                <p className="text-xs font-medium" style={{ color: "var(--md-tertiary)" }}>
                  キャッチコピー候補（タップで選択）
                </p>
                <div className="space-y-1.5">
                  {titleCandidates.titles.map((t, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => applyTitle(index, t)}
                      className="w-full text-left text-sm font-medium px-3 py-2 transition-colors"
                      style={{
                        background: "var(--md-surface-container)",
                        color: "var(--md-on-surface)",
                        borderRadius: "var(--md-shape-corner-sm)",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--md-surface-container-low)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "var(--md-surface-container)";
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setTitleCandidates(null)}
                  className="text-xs"
                  style={{ color: "var(--md-tertiary)", background: "none", border: "none", cursor: "pointer" }}
                >
                  閉じる
                </button>
              </div>
            )}

            {/* AIサジェスト表示 */}
            {aiSuggestion && !item.description && (
              <div
                className="ml-6 p-3 space-y-2"
                style={{
                  background: "var(--md-primary-container)",
                  borderRadius: "var(--md-shape-corner-md)",
                }}
              >
                <div
                  className="flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: "var(--md-primary)" }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  説明文の提案
                </div>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "var(--md-on-primary-container)" }}
                >
                  {aiSuggestion}
                </p>
                <button
                  type="button"
                  onClick={() => applySuggestion(index, aiSuggestion)}
                  className="text-xs px-4 py-1.5 font-medium transition-colors"
                  style={{
                    background: "var(--md-primary)",
                    color: "var(--md-on-primary)",
                    borderRadius: "100px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  この説明文を使う
                </button>
              </div>
            )}

            <textarea
              className="w-full resize-y"
              placeholder="説明（任意）"
              rows={3}
              value={item.description}
              onChange={(e) => updateItem(index, "description", e.target.value)}
            />
            <RewriteButton
              text={item.description}
              title={item.title}
              onRewrite={(rewritten) => updateItem(index, "description", rewritten)}
            />
            <PrimaryInfoMeter
              text={`${item.title} ${item.description}`}
              onAppendText={(appendText) =>
                updateItem(index, "description", item.description + appendText)
              }
            />
          </div>
        );
      })}

      <button
        type="button"
        onClick={addItem}
        className="w-full py-2.5 text-sm font-medium transition-colors"
        style={{
          border: "2px dashed var(--md-outline)",
          borderRadius: "var(--md-shape-corner-md)",
          color: "var(--md-primary)",
          background: "transparent",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--md-primary)";
          e.currentTarget.style.background = "var(--md-primary-container)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--md-outline)";
          e.currentTarget.style.background = "transparent";
        }}
      >
        + 追加
      </button>

    </div>
  );
}
