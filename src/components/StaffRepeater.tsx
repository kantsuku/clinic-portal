"use client";

import { useState, useEffect } from "react";

interface StaffRepeaterProps {
  value: string;
  onChange: (value: string) => void;
}

interface StaffMember {
  name: string;
  job_type: string;
  position_title: string;
  career: string;
  qualifications: string;
  strength: string;
}

const JOB_TYPES = [
  "歯科衛生士",
  "歯科助手",
  "受付",
  "歯科医師（勤務医）",
  "歯科技工士",
  "マネージャー",
  "その他",
];

const EMPTY_STAFF: StaffMember = {
  name: "",
  job_type: "",
  position_title: "",
  career: "",
  qualifications: "",
  strength: "",
};

function parseStaff(value: string): StaffMember[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return [];
}

function serializeStaff(staff: StaffMember[]): string {
  const filled = staff.filter((s) => s.name || s.career || s.strength);
  return filled.length > 0 ? JSON.stringify(filled) : "";
}

export default function StaffRepeater({ value, onChange }: StaffRepeaterProps) {
  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const parsed = parseStaff(value);
    return parsed.length > 0 ? parsed : [];
  });
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  useEffect(() => {
    onChange(serializeStaff(staff));
  }, [staff]);

  function updateStaff(index: number, field: keyof StaffMember, val: string) {
    setStaff((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: val } : s))
    );
  }

  function addStaff() {
    setStaff((prev) => [...prev, { ...EMPTY_STAFF }]);
    setExpandedIdx(staff.length);
  }

  function removeStaff(index: number) {
    setStaff((prev) => prev.filter((_, i) => i !== index));
    if (expandedIdx === index) setExpandedIdx(null);
  }

  return (
    <div className="space-y-2">
      {staff.map((member, index) => (
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
              style={{
                background: "var(--md-secondary-container)",
                color: "var(--md-on-secondary-container)",
                borderRadius: "100%",
              }}
            >
              {member.name ? member.name[0] : "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--md-on-surface)" }}>
                {member.name || "未入力"}
              </p>
              <p className="text-[11px] truncate" style={{ color: "var(--md-on-surface-variant)" }}>
                {[member.position_title, member.job_type].filter(Boolean).join(" / ") || "職種未選択"}
              </p>
            </div>
            <svg
              className="w-5 h-5 shrink-0 transition-transform"
              style={{
                color: "var(--md-on-surface-variant)",
                transform: expandedIdx === index ? "rotate(180deg)" : "rotate(0)",
              }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Expanded form */}
          {expandedIdx === index && (
            <div className="px-3 pb-3 space-y-3">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--md-on-surface-variant)" }}>
                  お名前
                </label>
                <input
                  type="text"
                  className="w-full"
                  placeholder="例：佐藤 花子"
                  value={member.name}
                  onChange={(e) => updateStaff(index, "name", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--md-on-surface-variant)" }}>
                  肩書き
                </label>
                <input
                  type="text"
                  className="w-full"
                  placeholder="例：チーフ衛生士、副院長、受付リーダー"
                  value={member.position_title}
                  onChange={(e) => updateStaff(index, "position_title", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--md-on-surface-variant)" }}>
                  職種
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {JOB_TYPES.map((jt) => (
                    <button
                      key={jt}
                      type="button"
                      onClick={() => updateStaff(index, "job_type", jt)}
                      className="text-xs font-medium px-3 py-1.5"
                      style={{
                        background: member.job_type === jt ? "var(--md-primary)" : "var(--md-surface-container)",
                        color: member.job_type === jt ? "var(--md-on-primary)" : "var(--md-on-surface-variant)",
                        borderRadius: "100px",
                        border: member.job_type === jt ? "none" : "1px solid var(--md-outline)",
                        cursor: "pointer",
                      }}
                    >
                      {jt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--md-on-surface-variant)" }}>
                  経歴・略歴
                </label>
                <textarea
                  className="w-full resize-y"
                  rows={2}
                  placeholder="例：◯◯専門学校卒業、前職で5年の経験"
                  value={member.career}
                  onChange={(e) => updateStaff(index, "career", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--md-on-surface-variant)" }}>
                  資格・認定
                </label>
                <textarea
                  className="w-full resize-y"
                  rows={2}
                  placeholder="例：歯科衛生士免許、ホワイトニングコーディネーター"
                  value={member.qualifications}
                  onChange={(e) => updateStaff(index, "qualifications", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--md-on-surface-variant)" }}>
                  このスタッフの強み・特徴
                </label>
                <textarea
                  className="w-full resize-y"
                  rows={2}
                  placeholder="例：患者さんとの会話が得意で、緊張をほぐすのが上手です"
                  value={member.strength}
                  onChange={(e) => updateStaff(index, "strength", e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeStaff(index)}
                className="text-xs font-medium px-3 py-1.5"
                style={{
                  background: "transparent",
                  color: "var(--md-error)",
                  border: "1px solid var(--md-error)",
                  borderRadius: "100px",
                  cursor: "pointer",
                }}
              >
                このスタッフを削除
              </button>
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addStaff}
        className="w-full py-2.5 text-sm font-medium transition-colors"
        style={{
          border: "2px dashed var(--md-outline)",
          borderRadius: "var(--md-shape-corner-md)",
          color: "var(--md-primary)",
          background: "transparent",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--md-primary)";
          e.currentTarget.style.background = "var(--md-primary-container)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--md-outline)";
          e.currentTarget.style.background = "transparent";
        }}
      >
        + スタッフを追加
      </button>

      {staff.length === 0 && (
        <p className="text-xs text-center py-2" style={{ color: "var(--md-on-surface-variant)" }}>
          院長先生以外のスタッフ情報を追加できます
        </p>
      )}
    </div>
  );
}
