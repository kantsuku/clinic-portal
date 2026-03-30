"use client";

import { useMemo } from "react";
import type { SectionDef } from "@/lib/schema";
import FormField from "./FormField";
import PrimaryInfoTips from "./PrimaryInfoTips";
import { analyzePrimaryInfo, getScoreLabel } from "@/lib/primary-info-analyzer";

interface SectionFormProps {
  section: SectionDef;
  values: Record<string, string>;
  onChange: (fieldName: string, value: string) => void;
  onBack: () => void;
}

export default function SectionForm({
  section,
  values,
  onChange,
  onBack,
}: SectionFormProps) {
  const filledCount = section.fields.filter(
    (f) => values[f.name]?.trim()
  ).length;
  const totalCount = section.fields.length;
  const progress = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;

  // セクション全体の一次情報スコア
  const sectionPrimaryScore = useMemo(() => {
    const texts = section.fields
      .filter((f) => f.type === "textarea" || f.type === "repeater")
      .map((f) => values[f.name] || "")
      .filter((t) => t.trim());
    if (texts.length === 0) return null;
    const allText = texts.join("\n\n");
    if (allText.trim().length < 20) return null;
    return analyzePrimaryInfo(allText);
  }, [section, values]);

  const primaryLabel = sectionPrimaryScore ? getScoreLabel(sectionPrimaryScore.score) : null;

  return (
    <div className="max-w-lg mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-4 text-sm flex items-center gap-1 py-2 px-1 md-state-layer"
        style={{
          color: "var(--md-primary)",
          borderRadius: "var(--md-shape-corner-sm)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontWeight: 500,
        }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        一覧に戻る
      </button>

      {/* Section header card */}
      <div
        className="p-5 mb-6"
        style={{
          background: "var(--md-surface-container)",
          borderRadius: "var(--md-shape-corner-xl)",
          boxShadow: "var(--md-elevation-1)",
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-11 h-11 flex items-center justify-center text-2xl"
            style={{
              background: "var(--md-primary-container)",
              borderRadius: "var(--md-shape-corner-md)",
            }}
          >
            {section.icon}
          </div>
          <div>
            <h2 className="text-lg font-medium" style={{ color: "var(--md-on-surface)" }}>
              {section.title}
            </h2>
            <p className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
              {section.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="flex-1 h-1.5 overflow-hidden"
            style={{
              background: "var(--md-outline-variant)",
              borderRadius: "100px",
            }}
          >
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: progress === 100 ? "var(--md-tertiary)" : "var(--md-primary)",
                borderRadius: "100px",
              }}
            />
          </div>
          <span
            className="text-xs font-medium whitespace-nowrap"
            style={{ color: "var(--md-on-surface-variant)" }}
          >
            {filledCount}/{totalCount}
          </span>
        </div>

        {/* Section primary info score */}
        {primaryLabel && sectionPrimaryScore && (
          <div
            className="flex items-center gap-3 mt-3 p-2.5"
            style={{
              background: primaryLabel.bgColor,
              borderRadius: "var(--md-shape-corner-md)",
            }}
          >
            <img src="/ponko.png" alt="ぽん子" className="w-6 h-6 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium" style={{ color: primaryLabel.color }}>
                  一次情報スコア
                </span>
                <span className="text-xs font-bold" style={{ color: primaryLabel.color }}>
                  {sectionPrimaryScore.score}%
                </span>
              </div>
              <div
                className="h-1 overflow-hidden"
                style={{ background: "rgba(0,0,0,0.08)", borderRadius: "100px" }}
              >
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${sectionPrimaryScore.score}%`,
                    background: primaryLabel.color,
                    borderRadius: "100px",
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Primary info tips */}
      <PrimaryInfoTips sectionId={section.id} />

      {/* Form fields */}
      <div className="space-y-4">
        {section.fields.map((field) => (
          <div
            key={field.name}
            className="p-5"
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
        ))}
      </div>
    </div>
  );
}
