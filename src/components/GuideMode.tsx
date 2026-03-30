"use client";

import { useState } from "react";
import type { SectionDef } from "@/lib/schema";
import FormField from "./FormField";

interface GuideModeProps {
  section: SectionDef;
  values: Record<string, string>;
  onChange: (fieldName: string, value: string) => void;
  onExit: () => void;
}

export default function GuideMode({
  section,
  values,
  onChange,
  onExit,
}: GuideModeProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const field = section.fields[currentIdx];
  const total = section.fields.length;
  const filled = section.fields.filter((f) => values[f.name]?.trim()).length;

  function next() {
    if (currentIdx < total - 1) {
      setCurrentIdx((prev) => prev + 1);
      window.scrollTo(0, 0);
    } else {
      onExit();
    }
  }

  function prev() {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  }

  function skip() {
    next();
  }

  if (!field) return null;

  return (
    <div className="max-w-lg mx-auto" role="form" aria-label={`${section.title} ガイドモード`}>
      {/* Progress */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onExit}
          className="text-xs font-medium py-1.5 px-3"
          style={{
            color: "var(--md-on-surface-variant)",
            background: "transparent",
            border: "1px solid var(--md-outline-variant)",
            borderRadius: "100px",
            cursor: "pointer",
          }}
        >
          ガイド終了
        </button>
        <div className="flex-1">
          <div
            className="h-1.5 overflow-hidden"
            style={{ background: "var(--md-outline-variant)", borderRadius: "100px" }}
          >
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${((currentIdx + 1) / total) * 100}%`,
                background: "var(--md-primary)",
                borderRadius: "100px",
              }}
            />
          </div>
        </div>
        <span className="text-xs font-medium" style={{ color: "var(--md-on-surface-variant)" }}>
          {currentIdx + 1}/{total}
        </span>
      </div>

      {/* Ponko guide */}
      <div
        className="flex items-start gap-3 p-4 mb-4"
        style={{
          background: "var(--md-primary-container)",
          borderRadius: "var(--md-shape-corner-xl)",
        }}
      >
        <img src="/ponko.png" alt="ぽん子" className="w-10 h-10 shrink-0 ponko-jump" />
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--md-on-primary-container)" }}>
            {field.label}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--md-on-primary-container)", }}>
            {field.hint || "こちらを入力してください！"}
          </p>
        </div>
      </div>

      {/* Field */}
      <div
        className="p-5 mb-4"
        style={{
          background: "var(--md-surface-container)",
          borderRadius: "var(--md-shape-corner-lg)",
          boxShadow: "var(--md-elevation-1)",
        }}
      >
        <FormField
          field={field}
          value={values[field.name] || ""}
          onChange={(val) => onChange(field.name, val)}
        />
      </div>

      {/* Navigation */}
      <div className="flex gap-2">
        {currentIdx > 0 && (
          <button
            onClick={prev}
            className="flex-1 py-3 text-sm font-medium"
            style={{
              background: "var(--md-surface-container)",
              color: "var(--md-on-surface-variant)",
              borderRadius: "var(--md-shape-corner-md)",
              border: "1px solid var(--md-outline-variant)",
              cursor: "pointer",
            }}
          >
            前へ
          </button>
        )}
        <button
          onClick={skip}
          className="py-3 px-4 text-sm font-medium"
          style={{
            background: "transparent",
            color: "var(--md-on-surface-variant)",
            borderRadius: "var(--md-shape-corner-md)",
            border: "none",
            cursor: "pointer",
          }}
        >
          スキップ
        </button>
        <button
          onClick={next}
          className="flex-1 py-3 text-sm font-medium"
          style={{
            background: "var(--md-primary)",
            color: "var(--md-on-primary)",
            borderRadius: "var(--md-shape-corner-md)",
            border: "none",
            cursor: "pointer",
          }}
        >
          {currentIdx === total - 1 ? "完了！" : "次へ"}
        </button>
      </div>
    </div>
  );
}
