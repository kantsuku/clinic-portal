"use client";

import { useState, useEffect, useRef } from "react";
import RewriteButton from "./RewriteButton";

interface CaseStudyInputProps {
  value: string;
  onChange: (value: string) => void;
}

interface CasePhoto {
  id: string;
  label: string;
  /** 将来: Supabase Storage URL */
  url: string;
}

interface CaseStudy {
  title: string;
  chief_complaint: string;
  treatment: string;
  duration: string;
  cost: string;
  risk: string;
  // 一次情報
  why_this_plan: string;
  ingenuity: string;
  patient_reaction: string;
  // 写真
  photos_before: CasePhoto[];
  photos_during: CasePhoto[];
  photos_after: CasePhoto[];
}

const EMPTY_CASE: CaseStudy = {
  title: "", chief_complaint: "", treatment: "", duration: "", cost: "", risk: "",
  why_this_plan: "", ingenuity: "", patient_reaction: "",
  photos_before: [], photos_during: [], photos_after: [],
};

function parseCases(value: string): CaseStudy[] {
  if (!value) return [];
  try { const p = JSON.parse(value); if (Array.isArray(p)) return p; } catch {}
  return [];
}

function serializeCases(cases: CaseStudy[]): string {
  const filled = cases.filter((c) => c.title || c.chief_complaint || c.treatment);
  return filled.length > 0 ? JSON.stringify(filled) : "";
}

type CaseStudyTextField = Exclude<keyof CaseStudy, "photos_before" | "photos_during" | "photos_after">;

const FIELDS: { key: CaseStudyTextField; label: string; hint: string; rows: number; type: "basic" | "primary" }[] = [
  { key: "chief_complaint", label: "主訴（患者さんのお悩み）", hint: "どんな悩みで来院されましたか？", rows: 2, type: "basic" },
  { key: "treatment", label: "治療内容", hint: "実施した治療を教えてください", rows: 3, type: "basic" },
  { key: "duration", label: "治療期間", hint: "例：3ヶ月（通院5回）", rows: 1, type: "basic" },
  { key: "cost", label: "費用", hint: "例：¥330,000（税込）", rows: 1, type: "basic" },
  { key: "risk", label: "リスク・副作用", hint: "医療広告GL必須項目です！必ず記入してください", rows: 2, type: "basic" },
  { key: "why_this_plan", label: "なぜこの治療計画にしたか", hint: "他の選択肢もある中で、この方法を選んだ理由を教えてください！ここが一番差がつきます！", rows: 3, type: "primary" },
  { key: "ingenuity", label: "治療中に工夫したこと", hint: "先生ならではのテクニックや配慮があれば！", rows: 3, type: "primary" },
  { key: "patient_reaction", label: "患者さんの反応・その後", hint: "治療後の患者さんの声や変化を教えてください！", rows: 3, type: "primary" },
];

function PhotoSlot({ label, photos, onAdd }: { label: string; photos: CasePhoto[]; onAdd: () => void }) {
  return (
    <div>
      <p className="text-[11px] font-medium mb-1 text-center" style={{ color: "var(--md-on-surface-variant)" }}>
        {label}
      </p>
      {photos.length > 0 ? (
        <div className="space-y-1">
          {photos.map((p) => (
            <div
              key={p.id}
              className="aspect-square flex items-center justify-center text-[11px]"
              style={{
                background: "var(--md-surface-container)",
                borderRadius: "var(--md-shape-corner-sm)",
                border: "1px solid var(--md-outline-variant)",
                color: "var(--md-on-surface-variant)",
              }}
            >
              📷 {p.label || label}
            </div>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={onAdd}
          className="w-full aspect-square flex flex-col items-center justify-center gap-1"
          style={{
            background: "var(--md-surface-container-low)",
            borderRadius: "var(--md-shape-corner-sm)",
            border: "2px dashed var(--md-outline)",
            color: "var(--md-on-surface-variant)",
            cursor: "pointer",
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-[10px]">追加</span>
        </button>
      )}
    </div>
  );
}

export default function CaseStudyInput({ value, onChange }: CaseStudyInputProps) {
  const [cases, setCases] = useState<CaseStudy[]>(() => {
    const parsed = parseCases(value);
    return parsed.length > 0 ? parsed : [];
  });
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const mountedRef = useRef(false);
  useEffect(() => { if (!mountedRef.current) { mountedRef.current = true; return; } onChange(serializeCases(cases)); }, [cases]);

  function updateCase(index: number, field: keyof CaseStudy, val: string) {
    setCases((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: val } : c)));
  }

  function addPhotoSlot(index: number, category: "photos_before" | "photos_during" | "photos_after") {
    const labels = { photos_before: "治療前", photos_during: "治療途中", photos_after: "治療後" };
    const newPhoto: CasePhoto = {
      id: `photo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      label: labels[category],
      url: "", // Supabase連携後にURLが入る
    };
    setCases((prev) => prev.map((c, i) =>
      i === index ? { ...c, [category]: [...c[category], newPhoto] } : c
    ));
  }

  function addCase() {
    setCases((prev) => [...prev, { ...EMPTY_CASE }]);
    setExpandedIdx(cases.length);
  }

  function removeCase(index: number) {
    if (!confirm("この症例を削除しますか？")) return;
    setCases((prev) => prev.filter((_, i) => i !== index));
    if (expandedIdx === index) setExpandedIdx(null);
  }

  return (
    <div className="space-y-2">
      {cases.map((cs, index) => {
        const primaryText = `${cs.why_this_plan} ${cs.ingenuity} ${cs.patient_reaction}`;
        return (
          <div
            key={index}
            className="overflow-hidden"
            style={{
              background: "var(--md-surface-container-low)",
              borderRadius: "var(--md-shape-corner-md)",
              border: "1px solid var(--md-outline-variant)",
            }}
          >
            {/* Header */}
            <button
              onClick={() => setExpandedIdx(expandedIdx === index ? null : index)}
              className="w-full flex items-center gap-3 p-3 text-left"
              style={{ background: "transparent", border: "none", cursor: "pointer" }}
            >
              <div
                className="w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0"
                style={{ background: "var(--md-primary-container)", color: "var(--md-primary)", borderRadius: "var(--md-shape-corner-sm)" }}
              >
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--md-on-surface)" }}>
                  {cs.title || cs.chief_complaint || "未入力の症例"}
                </p>
                <p className="text-[11px]" style={{ color: "var(--md-on-surface-variant)" }}>
                  {cs.treatment ? `${cs.treatment.slice(0, 30)}...` : "タップして入力"}
                </p>
              </div>
              <svg className="w-5 h-5 shrink-0 transition-transform" style={{ color: "var(--md-on-surface-variant)", transform: expandedIdx === index ? "rotate(180deg)" : "" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Expanded form */}
            {expandedIdx === index && (
              <div className="px-3 pb-3 space-y-3">
                {/* 症例タイトル */}
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "var(--md-on-surface-variant)" }}>
                    症例タイトル
                  </label>
                  <input
                    type="text" className="w-full"
                    placeholder="例：前歯のセラミック修復（30代女性）"
                    value={cs.title}
                    onChange={(e) => updateCase(index, "title", e.target.value)}
                  />
                </div>

                {/* 基本情報 */}
                <p className="text-xs font-medium pt-1" style={{ color: "var(--md-on-surface-variant)" }}>基本情報</p>
                {FIELDS.filter((f) => f.type === "basic").map((field) => (
                  <div key={field.key}>
                    <label className="text-xs font-medium block mb-1" style={{ color: field.key === "risk" ? "var(--md-error)" : "var(--md-on-surface-variant)" }}>
                      {field.label} {field.key === "risk" && "⚠️"}
                    </label>
                    <p className="text-[11px] mb-1" style={{ color: "var(--md-on-surface-variant)" }}>{field.hint}</p>
                    <textarea
                      className="w-full resize-y"
                      rows={field.rows}
                      placeholder={field.hint}
                      value={cs[field.key]}
                      onChange={(e) => updateCase(index, field.key, e.target.value)}
                      style={field.key === "risk" ? { borderColor: "var(--md-error)" } : undefined}
                    />
                  </div>
                ))}

                {/* 症例写真 */}
                <div className="pt-2" style={{ borderTop: "1px solid var(--md-outline-variant)" }}>
                  <p className="text-xs font-medium mb-2" style={{ color: "var(--md-on-surface-variant)" }}>
                    症例写真
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {/* 治療前 */}
                    <PhotoSlot
                      label="治療前"
                      photos={cs.photos_before}
                      onAdd={() => addPhotoSlot(index, "photos_before")}
                    />
                    {/* 治療途中 */}
                    <div className="space-y-2">
                      <PhotoSlot
                        label="治療途中"
                        photos={cs.photos_during}
                        onAdd={() => addPhotoSlot(index, "photos_during")}
                      />
                      {cs.photos_during.length > 0 && (
                        <button
                          type="button"
                          onClick={() => addPhotoSlot(index, "photos_during")}
                          className="w-full text-[11px] py-1"
                          style={{ color: "var(--md-primary)", background: "none", border: "1px dashed var(--md-outline)", borderRadius: "var(--md-shape-corner-sm)", cursor: "pointer" }}
                        >
                          + 追加
                        </button>
                      )}
                    </div>
                    {/* 治療後 */}
                    <PhotoSlot
                      label="治療後"
                      photos={cs.photos_after}
                      onAdd={() => addPhotoSlot(index, "photos_after")}
                    />
                  </div>
                  <p className="text-[11px] mt-2" style={{ color: "var(--md-on-surface-variant)" }}>
                    ※ 写真アップロードは準備中です。Supabase連携後に有効になります
                  </p>
                </div>

                {/* 一次情報セクション */}
                <div className="pt-2" style={{ borderTop: "1px solid var(--md-outline-variant)" }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <img src="/ponko.png" alt="" className="w-5 h-5" />
                    <p className="text-xs font-medium" style={{ color: "var(--md-primary)" }}>
                      ここからが差別化ポイントです！
                    </p>
                  </div>

                  {FIELDS.filter((f) => f.type === "primary").map((field) => (
                    <div key={field.key} className="mb-3">
                      <label className="text-xs font-medium block mb-1" style={{ color: "var(--md-primary)" }}>
                        {field.label}
                      </label>
                      <p className="text-[11px] mb-1" style={{ color: "var(--md-on-surface-variant)" }}>{field.hint}</p>
                      <textarea
                        className="w-full resize-y"
                        rows={field.rows}
                        placeholder={field.hint}
                        value={cs[field.key]}
                        onChange={(e) => updateCase(index, field.key, e.target.value)}
                      />
                      <RewriteButton
                        text={cs[field.key]}
                        title={field.label}
                        onRewrite={(r) => updateCase(index, field.key, r)}
                      />
                    </div>
                  ))}

                </div>

                <button
                  type="button" onClick={() => removeCase(index)}
                  className="text-xs font-medium px-3 py-2 min-h-[36px]"
                  style={{ background: "transparent", color: "var(--md-error)", border: "1px solid var(--md-error)", borderRadius: "100px", cursor: "pointer" }}
                >
                  この症例を削除
                </button>
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button" onClick={addCase}
        className="w-full py-2.5 text-sm font-medium transition-colors"
        style={{ border: "2px dashed var(--md-outline)", borderRadius: "var(--md-shape-corner-md)", color: "var(--md-primary)", background: "transparent", cursor: "pointer" }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--md-primary)"; e.currentTarget.style.background = "var(--md-primary-container)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--md-outline)"; e.currentTarget.style.background = "transparent"; }}
      >
        + 症例を追加
      </button>

      {cases.length === 0 && (
        <div className="flex items-start gap-2 p-3" style={{ background: "var(--md-surface-container-low)", borderRadius: "var(--md-shape-corner-md)" }}>
          <img src="/ponko.png" alt="" className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
            症例があると患者さんの信頼度がグッと上がります！「なぜこの治療にしたか」まで書けると最強ですよ！
          </p>
        </div>
      )}
    </div>
  );
}
