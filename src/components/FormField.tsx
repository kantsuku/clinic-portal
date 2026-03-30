"use client";

import type { FieldDef } from "@/lib/schema";
import WeekdayHoursInput from "./WeekdayHoursInput";
import SnsInput from "./SnsInput";
import PaymentInput from "./PaymentInput";
import RepeaterInput from "./RepeaterInput";

interface FormFieldProps {
  field: FieldDef;
  value: string;
  onChange: (value: string) => void;
}

export default function FormField({ field, value, onChange }: FormFieldProps) {
  const baseInputClass =
    "w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow";

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {field.hint && (
        <p className="text-xs text-gray-500">{field.hint}</p>
      )}

      {field.type === "text" && (
        <input
          type="text"
          className={baseInputClass}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === "textarea" && (
        <textarea
          className={`${baseInputClass} resize-none`}
          placeholder={field.placeholder}
          rows={5}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === "date" && (
        <input
          type="date"
          className={baseInputClass}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === "tel" && (
        <input
          type="tel"
          className={baseInputClass}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === "url" && (
        <input
          type="url"
          className={baseInputClass}
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

      {field.type === "repeater" && (
        <RepeaterInput
          value={value}
          onChange={onChange}
          placeholder={field.placeholder}
        />
      )}
    </div>
  );
}
