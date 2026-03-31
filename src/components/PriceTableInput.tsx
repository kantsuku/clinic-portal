"use client";

import { useState, useEffect } from "react";

interface PriceTableInputProps {
  value: string;
  onChange: (value: string) => void;
}

interface PriceCategory {
  name: string;
  items: { name: string; price: string; note: string }[];
}

function parseTable(value: string): PriceCategory[] {
  if (!value) return [];
  try { const p = JSON.parse(value); if (Array.isArray(p)) return p; } catch {}
  return [];
}

function serializeTable(cats: PriceCategory[]): string {
  const filled = cats.filter((c) => c.name || c.items.some((i) => i.name));
  return filled.length > 0 ? JSON.stringify(filled) : "";
}

const DENTAL_PRESETS = [
  "審美歯科", "ホワイトニング", "矯正歯科", "インプラント",
  "義歯・入れ歯", "予防歯科", "口腔外科", "その他自費診療",
];

export default function PriceTableInput({ value, onChange }: PriceTableInputProps) {
  const [categories, setCategories] = useState<PriceCategory[]>(() => {
    const parsed = parseTable(value);
    return parsed.length > 0 ? parsed : [];
  });

  useEffect(() => { onChange(serializeTable(categories)); }, [categories]);

  function addCategory(name: string = "") {
    setCategories((prev) => [...prev, { name, items: [{ name: "", price: "", note: "" }] }]);
  }

  function updateCategoryName(catIdx: number, name: string) {
    setCategories((prev) => prev.map((c, i) => (i === catIdx ? { ...c, name } : c)));
  }

  function addItem(catIdx: number) {
    setCategories((prev) => prev.map((c, i) => (i === catIdx ? { ...c, items: [...c.items, { name: "", price: "", note: "" }] } : c)));
  }

  function updateItem(catIdx: number, itemIdx: number, field: "name" | "price" | "note", val: string) {
    setCategories((prev) => prev.map((c, ci) => (ci === catIdx ? {
      ...c, items: c.items.map((item, ii) => (ii === itemIdx ? { ...item, [field]: val } : item))
    } : c)));
  }

  function removeItem(catIdx: number, itemIdx: number) {
    setCategories((prev) => prev.map((c, ci) => (ci === catIdx ? {
      ...c, items: c.items.filter((_, ii) => ii !== itemIdx)
    } : c)));
  }

  function removeCategory(catIdx: number) {
    setCategories((prev) => prev.filter((_, i) => i !== catIdx));
  }

  const usedPresets = new Set(categories.map((c) => c.name));

  return (
    <div className="space-y-3">
      {/* Preset buttons */}
      {DENTAL_PRESETS.some((p) => !usedPresets.has(p)) && (
        <div className="p-3" style={{ background: "var(--md-surface-container-low)", borderRadius: "var(--md-shape-corner-md)" }}>
          <p className="text-xs font-medium mb-2" style={{ color: "var(--md-on-surface-variant)" }}>
            カテゴリを追加（タップ）
          </p>
          <div className="flex flex-wrap gap-1.5">
            {DENTAL_PRESETS.filter((p) => !usedPresets.has(p)).map((preset) => (
              <button key={preset} type="button" onClick={() => addCategory(preset)}
                className="text-xs font-medium px-3 py-1.5 transition-colors"
                style={{ background: "var(--md-surface-container)", color: "var(--md-primary)", borderRadius: "100px", border: "1px solid var(--md-outline)", cursor: "pointer" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--md-primary-container)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--md-surface-container)"; }}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      {categories.map((cat, catIdx) => (
        <div key={catIdx} className="p-3" style={{ background: "var(--md-surface-container-low)", borderRadius: "var(--md-shape-corner-md)", border: "1px solid var(--md-outline-variant)" }}>
          {/* Category header */}
          <div className="flex items-center gap-2 mb-3">
            <input type="text" className="flex-1 text-sm font-medium" placeholder="カテゴリ名" value={cat.name}
              onChange={(e) => updateCategoryName(catIdx, e.target.value)}
              style={{ fontWeight: 600 }}
            />
            <button onClick={() => removeCategory(catIdx)} className="text-xs px-2 py-1 min-h-[36px]"
              style={{ color: "var(--md-error)", background: "none", border: "none", cursor: "pointer" }}
            >✕</button>
          </div>

          {/* Items */}
          <div className="space-y-2">
            {cat.items.map((item, itemIdx) => (
              <div key={itemIdx} className="flex gap-2 items-start">
                <div className="flex-1 space-y-1">
                  <input type="text" className="w-full text-xs" placeholder="治療名" value={item.name}
                    onChange={(e) => updateItem(catIdx, itemIdx, "name", e.target.value)} style={{ padding: "8px 12px" }} />
                  <div className="flex gap-1">
                    <input type="text" className="flex-1 text-xs" placeholder="価格（例：¥55,000）" value={item.price}
                      onChange={(e) => updateItem(catIdx, itemIdx, "price", e.target.value)} style={{ padding: "8px 12px" }} />
                    <input type="text" className="flex-1 text-xs" placeholder="備考" value={item.note}
                      onChange={(e) => updateItem(catIdx, itemIdx, "note", e.target.value)} style={{ padding: "8px 12px" }} />
                  </div>
                </div>
                <button onClick={() => removeItem(catIdx, itemIdx)} className="text-xs p-2 min-w-[36px] min-h-[36px] flex items-center justify-center"
                  style={{ color: "var(--md-on-surface-variant)", background: "none", border: "none", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--md-error)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--md-on-surface-variant)")}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <button type="button" onClick={() => addItem(catIdx)}
            className="w-full mt-2 py-2 text-xs font-medium"
            style={{ color: "var(--md-primary)", background: "transparent", border: "1px dashed var(--md-outline)", borderRadius: "var(--md-shape-corner-sm)", cursor: "pointer" }}
          >
            + 項目を追加
          </button>
        </div>
      ))}

      {/* Add custom category */}
      <button type="button" onClick={() => addCategory()}
        className="w-full py-2.5 text-sm font-medium transition-colors"
        style={{ border: "2px dashed var(--md-outline)", borderRadius: "var(--md-shape-corner-md)", color: "var(--md-primary)", background: "transparent", cursor: "pointer" }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--md-primary)"; e.currentTarget.style.background = "var(--md-primary-container)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--md-outline)"; e.currentTarget.style.background = "transparent"; }}
      >
        + カテゴリを追加
      </button>
    </div>
  );
}
