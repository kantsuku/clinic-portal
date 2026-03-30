"use client";

import { useState, useEffect } from "react";

interface RepeaterInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface RepeaterItem {
  title: string;
  description: string;
}

function parseItems(value: string): RepeaterItem[] {
  if (!value) return [{ title: "", description: "" }];

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

  return items.length > 0 ? items : [{ title: "", description: "" }];
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
}: RepeaterInputProps) {
  const [items, setItems] = useState(() => parseItems(value));

  useEffect(() => {
    onChange(serializeItems(items));
  }, [items]);

  function updateItem(index: number, field: keyof RepeaterItem, val: string) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
  }

  function addItem() {
    setItems((prev) => [...prev, { title: "", description: "" }]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="bg-white border rounded-lg p-3 space-y-2 relative group"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-mono w-6">
              {index + 1}.
            </span>
            <input
              type="text"
              className="flex-1 border rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder={placeholder || "タイトル"}
              value={item.title}
              onChange={(e) => updateItem(index, "title", e.target.value)}
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-gray-300 hover:text-red-500 transition-colors p-1"
                aria-label="削除"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <textarea
            className="w-full border rounded px-3 py-1.5 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="説明（任意）"
            rows={2}
            value={item.description}
            onChange={(e) => updateItem(index, "description", e.target.value)}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
      >
        + 追加
      </button>
    </div>
  );
}
