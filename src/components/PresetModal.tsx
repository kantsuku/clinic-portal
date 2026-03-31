"use client";

import { PRESETS } from "@/lib/presets";

interface PresetModalProps {
  onApply: (data: Record<string, string>) => void;
  onClose: () => void;
}

export default function PresetModal({ onApply, onClose }: PresetModalProps) {
  function handleApply(presetId: string) {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    if (!confirm(`「${preset.name}」のテンプレートを適用しますか？\n既存の入力がある項目は上書きされます。`)) return;
    onApply(preset.data);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4"
        style={{ background: "var(--md-surface-container)", borderRadius: "var(--md-shape-corner-xl) var(--md-shape-corner-xl) 0 0", boxShadow: "var(--md-elevation-2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-8 h-1 rounded-full" style={{ background: "var(--md-outline-variant)" }} />
        </div>
        <div className="px-4 sm:px-6 pb-8 pt-2">
          <div className="flex items-center gap-3 mb-5">
            <img src="/ponko.png" alt="ぽん子" className="w-10 h-10" />
            <div>
              <h2 className="text-lg font-medium" style={{ color: "var(--md-on-surface)" }}>テンプレートから始める</h2>
              <p className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>医院のタイプに合ったテンプレートを選んでください</p>
            </div>
          </div>

          <div className="space-y-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleApply(preset.id)}
                className="w-full text-left p-4 flex items-center gap-4 md-state-layer"
                style={{
                  background: "var(--md-surface-container-low)",
                  borderRadius: "var(--md-shape-corner-lg)",
                  border: "1px solid var(--md-outline-variant)",
                  cursor: "pointer",
                  transition: "box-shadow 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "var(--md-elevation-1)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                <span className="text-3xl">{preset.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: "var(--md-on-surface)" }}>{preset.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--md-on-surface-variant)" }}>{preset.description}</p>
                </div>
                <svg className="w-5 h-5 shrink-0" style={{ color: "var(--md-on-surface-variant)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>

          <p className="text-[11px] text-center mt-4" style={{ color: "var(--md-on-surface-variant)" }}>
            テンプレートを適用後、自由にカスタマイズできます
          </p>

          <button onClick={onClose} className="w-full mt-4 py-3 text-sm font-medium" style={{ background: "var(--md-surface-container-high)", color: "var(--md-on-surface-variant)", borderRadius: "100px", border: "none", cursor: "pointer" }}>
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
