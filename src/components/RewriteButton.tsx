"use client";

import { useState } from "react";
import { PenLine, Loader2 } from "lucide-react";

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
    setPreview("");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, text, context, stream: true }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "リライトに失敗しました");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("ストリーム取得に失敗しました");

      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const data = JSON.parse(line.slice(6));
              result += data.text;
              setPreview(result);
            } catch {}
          }
        }
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setError("タイムアウトしました。もう一度お試しください");
      } else {
        setError(e instanceof Error ? e.message : "エラーが発生しました");
      }
      setPreview((prev) => prev || null);
    } finally {
      clearTimeout(timeoutId);
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
      {(preview === null || preview === undefined) && !loading && (
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
              <Loader2 size={14} className="animate-spin" />
              AIがリライト中...
            </>
          ) : (
            <>
              <PenLine size={14} />
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
      {preview !== null && preview !== undefined && (preview || loading) && (
        <div
          className="p-4 space-y-3"
          style={{
            background: "var(--md-primary-container)",
            borderRadius: "var(--md-shape-corner-md)",
          }}
        >
          <div className="flex items-center gap-1.5">
            <PenLine size={16} style={{ color: "var(--md-primary)" }} />
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
