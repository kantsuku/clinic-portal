"use client";

import { useState } from "react";

interface RewriteButtonProps {
  text: string;
  title?: string;
  context?: string;
  onRewrite: (rewritten: string) => void;
  /** 最小文字数（これ以下ではボタンを非表示） */
  minLength?: number;
}

export default function RewriteButton({
  text,
  title,
  context,
  onRewrite,
  minLength = 10,
}: RewriteButtonProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!text || text.trim().length < minLength) return null;

  async function handleRewrite() {
    setLoading(true);
    setError(null);
    setPreview(null);

    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, text, context }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "リライトに失敗しました");
      }

      const data = await res.json();
      setPreview(data.rewritten);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  function applyRewrite() {
    if (preview) {
      onRewrite(preview);
      setPreview(null);
    }
  }

  function cancelRewrite() {
    setPreview(null);
  }

  return (
    <div className="mt-2">
      {/* リライトボタン */}
      {!preview && (
        <button
          type="button"
          onClick={handleRewrite}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 transition-all"
          style={{
            background: loading ? "var(--md-surface-container-high)" : "var(--md-surface-container)",
            color: loading ? "var(--md-on-surface-variant)" : "var(--md-primary)",
            borderRadius: "100px",
            border: "1px solid var(--md-outline)",
            cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.background = "var(--md-primary-container)";
              e.currentTarget.style.borderColor = "var(--md-primary)";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.background = "var(--md-surface-container)";
              e.currentTarget.style.borderColor = "var(--md-outline)";
            }
          }}
        >
          {loading ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              AIがリライト中...
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              文章をAIできれいにする
            </>
          )}
        </button>
      )}

      {/* エラー */}
      {error && (
        <p className="text-xs mt-1" style={{ color: "var(--md-error)" }}>
          {error}
        </p>
      )}

      {/* プレビュー */}
      {preview && (
        <div
          className="p-4 space-y-3"
          style={{
            background: "var(--md-primary-container)",
            borderRadius: "var(--md-shape-corner-md)",
          }}
        >
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" style={{ color: "var(--md-primary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span className="text-xs font-medium" style={{ color: "var(--md-primary)" }}>
              AIリライト結果
            </span>
          </div>
          <p
            className="text-sm leading-relaxed whitespace-pre-wrap"
            style={{ color: "var(--md-on-primary-container)" }}
          >
            {preview}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={applyRewrite}
              className="text-xs font-medium px-4 py-2 transition-colors"
              style={{
                background: "var(--md-primary)",
                color: "var(--md-on-primary)",
                borderRadius: "100px",
                border: "none",
                cursor: "pointer",
              }}
            >
              この文章を使う
            </button>
            <button
              type="button"
              onClick={cancelRewrite}
              className="text-xs font-medium px-4 py-2 transition-colors"
              style={{
                background: "transparent",
                color: "var(--md-primary)",
                borderRadius: "100px",
                border: "1px solid var(--md-outline)",
                cursor: "pointer",
              }}
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
