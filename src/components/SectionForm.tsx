"use client";

import type { SectionDef } from "@/lib/schema";
import FormField from "./FormField";

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

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="mb-4 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        一覧に戻る
      </button>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{section.icon}</span>
          <h2 className="text-xl font-bold">{section.title}</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">{section.description}</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
            {filledCount}/{totalCount} 入力済み
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {section.fields.map((field) => (
          <div key={field.name} className="bg-white rounded-xl shadow-sm border p-5">
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
