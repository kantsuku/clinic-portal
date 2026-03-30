"use client";

import type { FieldDef } from "@/lib/schema";
import WeekdayHoursInput from "./WeekdayHoursInput";
import SnsInput from "./SnsInput";
import PaymentInput from "./PaymentInput";
import RepeaterInput from "./RepeaterInput";
import ChecklistInput from "./ChecklistInput";
import ToneMannerInput from "./ToneMannerInput";
import PrimaryInfoMeter from "./PrimaryInfoMeter";
import RewriteButton from "./RewriteButton";

interface FormFieldProps {
  field: FieldDef;
  value: string;
  onChange: (value: string) => void;
}

export default function FormField({ field, value, onChange }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label
        className="block text-sm font-medium"
        style={{ color: "var(--md-on-surface)" }}
      >
        {field.label}
        {field.required && (
          <span style={{ color: "var(--md-error)" }} className="ml-1">*</span>
        )}
      </label>
      {field.hint && (
        <p className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
          {field.hint}
        </p>
      )}

      {field.type === "text" && (
        <input
          type="text"
          className="w-full"
          placeholder={field.placeholder}
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
                <svg className="w-4 h-4" style={{ color: "var(--md-primary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
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
            placeholder={field.placeholder}
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
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === "url" && (
        <input
          type="url"
          className="w-full"
          placeholder={field.placeholder}
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
          placeholder={field.placeholder}
          defaultCount={field.defaultCount}
          suggestions={field.suggestions}
          enableAiSuggest={field.enableAiSuggest}
        />
      )}
    </div>
  );
}
