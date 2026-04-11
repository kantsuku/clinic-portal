"use client";

import type { FieldDef } from "@/lib/schema";
import { Copy, Zap } from "lucide-react";
import WeekdayHoursInput from "./WeekdayHoursInput";
import SnsInput from "./SnsInput";
import PaymentInput from "./PaymentInput";
import RepeaterInput from "./RepeaterInput";
import ChecklistInput from "./ChecklistInput";
import ToneMannerInput from "./ToneMannerInput";
import StaffRepeater from "./StaffRepeater";
import PriceTableInput from "./PriceTableInput";
import CaseStudyInput from "./CaseStudyInput";
import PrimaryInfoMeter from "./PrimaryInfoMeter";
import RewriteButton from "./RewriteButton";
import { showToast } from "./Toast";

interface FormFieldProps {
  field: FieldDef;
  value: string;
  onChange: (value: string) => void;
  /** 他フィールドの値を参照するため */
  allValues?: Record<string, string>;
}

export default function FormField({ field, value, onChange, allValues }: FormFieldProps) {
  // 動的プレースホルダー: {{clinic_name}} を実際の医院名に置換
  const placeholder = field.placeholder?.replace(
    /{{(\w+)}}/g,
    (_, key) => allValues?.[key]?.trim() || "〇〇"
  );
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          className="block text-sm font-medium"
          style={{ color: "var(--md-on-surface)" }}
        >
          {field.label}
          {field.required && (
            <span style={{ color: "var(--md-error)" }} className="ml-1">*</span>
          )}
        </label>
        {value?.trim() && (
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(value);
              showToast("コピーしました");
            }}
            className="text-[11px] px-2 py-1"
            style={{
              color: "var(--md-on-surface-variant)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
            aria-label="コピー"
          >
            <Copy size={16} />
          </button>
        )}
      </div>
      {field.hint && (
        <p className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
          {field.hint}
        </p>
      )}

      {field.type === "text" && (
        <input
          type="text"
          className="w-full"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === "textarea" && (
        <>
          {field.textSuggestions && field.textSuggestions.length > 0 && (
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
                <Zap size={16} style={{ color: "var(--md-primary)" }} />
                テンプレートから選ぶ
              </p>
              <div className="flex flex-wrap gap-1.5">
                {field.textSuggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onChange(s.text)}
                    className="text-xs px-3 py-1.5 font-medium transition-colors"
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
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <textarea
            className="w-full resize-y"
            placeholder={placeholder}
            rows={field.rows || 5}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <RewriteButton
            text={value}
            title={field.label}
            onRewrite={onChange}
          />
          <PrimaryInfoMeter
            text={value}
            onAppendText={(appendText) => onChange(value + appendText)}
          />
        </>
      )}

      {field.type === "date" && (
        <input
          type="date"
          className="w-full"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === "tel" && (
        <input
          type="tel"
          className="w-full"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === "url" && (
        <input
          type="url"
          className="w-full"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === "weekday-hours" && (
        <WeekdayHoursInput value={value} onChange={onChange} />
      )}

      {field.type === "sns" && (
        <SnsInput value={value} onChange={onChange} />
      )}

      {field.type === "payment" && (
        <PaymentInput value={value} onChange={onChange} />
      )}

      {field.type === "staff-repeater" && (
        <StaffRepeater value={value} onChange={onChange} />
      )}

      {field.type === "price-table" && (
        <PriceTableInput value={value} onChange={onChange} />
      )}

      {field.type === "case-study" && (
        <CaseStudyInput value={value} onChange={onChange} />
      )}

      {field.type === "tone-manner" && field.toneCategories && (
        <ToneMannerInput
          value={value}
          onChange={onChange}
          categories={field.toneCategories}
        />
      )}

      {field.type === "checklist" && field.checklistCategories && (
        <ChecklistInput
          value={value}
          onChange={onChange}
          categories={field.checklistCategories}
        />
      )}

      {field.type === "repeater" && (
        <RepeaterInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          defaultCount={field.defaultCount}
          suggestions={field.suggestions}
          enableAiSuggest={field.enableAiSuggest}
        />
      )}
    </div>
  );
}
