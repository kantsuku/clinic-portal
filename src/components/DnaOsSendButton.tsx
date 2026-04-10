"use client"

import { useState } from "react"
import { getSections } from "@/lib/schema"
type IndustryType = "dental" | "corporate"

interface DnaOsSendButtonProps {
  onSubmit: () => Promise<boolean>
  values: Record<string, string>
  industry: IndustryType
}

export default function DnaOsSendButton({ onSubmit, values, industry }: DnaOsSendButtonProps) {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Calculate filled field count
  const sections = getSections(industry)
  const totalFields = sections.reduce((sum, s) => sum + s.fields.length, 0)
  const filledFields = sections.reduce(
    (sum, s) => sum + s.fields.filter((f) => values[f.name]?.trim()).length,
    0
  )
  const progressPct = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0

  async function handleSend() {
    setSending(true)
    try {
      const success = await onSubmit()
      if (success) setSent(true)
    } finally {
      setSending(false)
      setShowConfirm(false)
    }
  }

  if (sent) {
    return (
      <div className="max-w-lg mx-auto mt-6 p-4 text-center" style={{
        background: "var(--md-tertiary-container)",
        borderRadius: "var(--md-shape-corner-lg)",
      }}>
        <p className="text-sm font-medium" style={{ color: "var(--md-on-tertiary-container)" }}>
          DNA OS Lite に送信済み
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--md-on-tertiary-container)", opacity: 0.8 }}>
          データはDNA OS Liteで確認・編集できます
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-lg mx-auto mt-6">
        <button
          onClick={() => setShowConfirm(true)}
          disabled={filledFields === 0}
          className="w-full py-4 text-sm font-medium flex items-center justify-center gap-2"
          style={{
            background: filledFields === 0 ? "var(--md-surface-container-highest)" : "var(--md-primary)",
            color: filledFields === 0 ? "var(--md-on-surface-variant)" : "var(--md-on-primary)",
            borderRadius: "var(--md-shape-corner-lg)",
            border: "none",
            cursor: filledFields === 0 ? "not-allowed" : "pointer",
            opacity: filledFields === 0 ? 0.5 : 1,
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
          DNA OS Lite に送信
        </button>
        <p className="text-xs text-center mt-2" style={{ color: "var(--md-on-surface-variant)" }}>
          入力済み: {filledFields}/{totalFields} 項目（{progressPct}%）
        </p>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => !sending && setShowConfirm(false)}
        >
          <div
            className="w-full max-w-sm p-6"
            style={{
              background: "var(--md-surface-container-high)",
              borderRadius: "var(--md-shape-corner-xl)",
              boxShadow: "var(--md-elevation-3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-medium mb-2" style={{ color: "var(--md-on-surface)" }}>
              DNA OS Lite に送信
            </h2>
            <p className="text-sm mb-4" style={{ color: "var(--md-on-surface-variant)" }}>
              入力済みの {filledFields} 項目を DNA OS Lite に送信します。
              送信後もこちらで編集を続けられます。
            </p>

            {progressPct < 30 && (
              <div className="p-3 mb-4" style={{
                background: "var(--md-error-container)",
                borderRadius: "var(--md-shape-corner-md)",
              }}>
                <p className="text-xs" style={{ color: "var(--md-on-error-container)" }}>
                  まだ入力が {progressPct}% です。もう少し入力してから送信することをおすすめします。
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={sending}
                className="flex-1 py-3 text-sm font-medium"
                style={{
                  background: "transparent",
                  color: "var(--md-primary)",
                  borderRadius: "100px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                キャンセル
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex-1 py-3 text-sm font-medium"
                style={{
                  background: "var(--md-primary)",
                  color: "var(--md-on-primary)",
                  borderRadius: "100px",
                  border: "none",
                  cursor: sending ? "wait" : "pointer",
                  opacity: sending ? 0.7 : 1,
                }}
              >
                {sending ? "送信中..." : "送信する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
