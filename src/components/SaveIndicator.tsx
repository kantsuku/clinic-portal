"use client";

interface SaveIndicatorProps {
  lastSaved: Date | null;
  isDirty: boolean;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function SaveIndicator({ lastSaved, isDirty }: SaveIndicatorProps) {
  return (
    <div
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2 px-3 py-2 text-xs font-medium"
      style={{
        background: isDirty ? "var(--md-secondary-container)" : "var(--md-surface-container)",
        color: isDirty ? "var(--md-on-secondary-container)" : "var(--md-on-surface-variant)",
        borderRadius: "100px",
        boxShadow: "var(--md-elevation-2)",
      }}
    >
      {isDirty ? (
        <>
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "var(--md-secondary)" }}
          />
          保存中...
        </>
      ) : lastSaved ? (
        <>
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: "var(--md-tertiary)" }}
          />
          {formatTime(lastSaved)} 保存済み
        </>
      ) : null}
    </div>
  );
}
