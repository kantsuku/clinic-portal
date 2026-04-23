"use client";

import type { SectionDef } from "@/lib/schema";
import { getSections } from "@/lib/schema";
type IndustryType = "dental" | "corporate";
import FormField from "./FormField";
import { ChevronLeft, ChevronRight, Loader2, MessageCircle, X } from "lucide-react";
import Icon from "./Icon";

interface SectionFormProps {
  section: SectionDef;
  values: Record<string, string>;
  onChange: (fieldName: string, value: string) => void;
  onBack: () => void;
  onNavigate?: (sectionId: string) => void;
  industry?: IndustryType;
  advice?: string;
  adviceLoading?: boolean;
  onRequestAdvice?: (sectionId: string, sectionTitle: string, fields: { label: string; value: string }[], allValues: Record<string, string>) => void;
  onClearAdvice?: (sectionId: string) => void;
  visibleCategories?: string[];
}

export default function SectionForm({
  section,
  values,
  onChange,
  onBack,
  onNavigate,
  industry,
  advice,
  adviceLoading,
  onRequestAdvice,
  onClearAdvice,
  visibleCategories,
}: SectionFormProps) {
  const filledCount = section.fields.filter(
    (f) => values[f.name]?.trim()
  ).length;
  const totalCount = section.fields.length;
  const progress = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;

  function handleRequestAdvice() {
    if (!onRequestAdvice || adviceLoading) return;
    const fields = section.fields.map((f) => ({
      label: f.label,
      value: values[f.name] || "",
    }));
    onRequestAdvice(section.id, section.title, fields, values);
  }

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
        <ChevronLeft size={20} />
        一覧に戻る
      </button>

      {/* Section header card */}
      <div
        className="p-5 mb-4"
        style={{
          background: "var(--md-surface-container)",
          borderRadius: "var(--md-shape-corner-xl)",
          boxShadow: "var(--md-elevation-1)",
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-11 h-11 flex items-center justify-center"
            style={{
              background: "var(--md-primary-container)",
              color: "var(--md-primary)",
              borderRadius: "var(--md-shape-corner-md)",
            }}
          >
            <Icon name={section.icon} size={22} />
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

        {/* Advice button */}
        {onRequestAdvice && (
          <button
            onClick={handleRequestAdvice}
            disabled={adviceLoading || filledCount === 0}
            className="w-full mt-3 py-2.5 text-xs font-medium flex items-center justify-center gap-2"
            style={{
              background: "var(--md-tertiary-container)",
              color: "var(--md-tertiary)",
              borderRadius: "100px",
              border: "none",
              cursor: adviceLoading || filledCount === 0 ? "not-allowed" : "pointer",
              opacity: filledCount === 0 ? 0.5 : 1,
            }}
          >
            {adviceLoading ? (
              <><Loader2 size={14} className="animate-spin" /> アドバイスを作成中...</>
            ) : (
              <><img src="/ponko.png" alt="" className="w-4 h-4" /> アドバイスをもらう</>
            )}
          </button>
        )}
      </div>

      {/* Advice display */}
      {advice && (
        <div
          className="mb-4 p-4"
          style={{
            background: "var(--md-tertiary-container)",
            borderRadius: "var(--md-shape-corner-lg)",
          }}
        >
          <div className="flex items-start gap-3 mb-2">
            <img src="/ponko.png" alt="" className="w-8 h-8 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium mb-0.5" style={{ color: "var(--md-tertiary)" }}>
                アドバイス
              </p>
            </div>
            {onClearAdvice && (
              <button
                onClick={() => onClearAdvice(section.id)}
                className="shrink-0 flex items-center gap-1 text-[11px] px-2 py-1"
                style={{
                  background: "transparent",
                  color: "var(--md-on-surface-variant)",
                  border: "1px solid var(--md-outline-variant)",
                  borderRadius: "100px",
                  cursor: "pointer",
                }}
              >
                <X size={10} /> クリア
              </button>
            )}
          </div>
          <div
            className="text-xs leading-relaxed whitespace-pre-wrap"
            style={{ color: "var(--md-on-surface)" }}
          >
            {advice}
          </div>
        </div>
      )}

      {/* Form fields */}
      <div className="space-y-4">
        {section.fields.map((field) => (
          <div
            key={field.name}
            className="p-4 sm:p-5"
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
              allValues={values}
              visibleCategories={visibleCategories}
            />
          </div>
        ))}
      </div>

      {/* Section navigation */}
      {onNavigate && (() => {
        const allSections = getSections(industry);
        // Navigate only within the same step
        const stepSections = allSections.filter((s) => s.step === section.step);
        const currentIdx = stepSections.findIndex((s) => s.id === section.id);
        const prevSection = currentIdx > 0 ? stepSections[currentIdx - 1] : null;
        const nextSection = currentIdx < stepSections.length - 1 ? stepSections[currentIdx + 1] : null;

        return (
          <div className="flex gap-2 mt-6">
            {prevSection && (
              <button
                onClick={() => { onNavigate(prevSection.id); window.scrollTo(0, 0); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium min-h-[48px]"
                style={{
                  background: "var(--md-surface-container)",
                  color: "var(--md-on-surface-variant)",
                  borderRadius: "var(--md-shape-corner-md)",
                  border: "1px solid var(--md-outline-variant)",
                  cursor: "pointer",
                }}
              >
                <ChevronLeft size={16} />
                {prevSection.title}
              </button>
            )}
            {nextSection && (
              <button
                onClick={() => { onNavigate(nextSection.id); window.scrollTo(0, 0); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium min-h-[48px]"
                style={{
                  background: "var(--md-primary)",
                  color: "var(--md-on-primary)",
                  borderRadius: "var(--md-shape-corner-md)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {nextSection.title}
                <ChevronRight size={16} />
              </button>
            )}
            {!nextSection && (
              <button
                onClick={() => { onBack(); window.scrollTo(0, 0); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium"
                style={{
                  background: "var(--md-tertiary)",
                  color: "var(--md-on-primary)",
                  borderRadius: "var(--md-shape-corner-md)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ダッシュボードに戻る
              </button>
            )}
          </div>
        );
      })()}
    </div>
  );
}
