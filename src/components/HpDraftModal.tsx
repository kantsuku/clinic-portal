"use client";

import { useState } from "react";
import { sections } from "@/lib/schema";

interface HpDraftModalProps {
  values: Record<string, string>;
  onClose: () => void;
}

interface HpPage {
  name: string;
  sections: { heading: string; content: string; source_fields: string[] }[];
  photos_needed: string[];
}

export default function HpDraftModal({ values, onClose }: HpDraftModalProps) {
  const [pages, setPages] = useState<HpPage[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true); setError("");
    try {
      const data: Record<string, string> = {};
      for (const s of sections) {
        for (const f of s.fields) {
          if (values[f.name]?.trim()) data[f.label] = values[f.name];
        }
      }
      const res = await fetch("/api/generate-hp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (!res.ok) throw new Error();
      const { result } = await res.json();
      setPages(result.pages || []);
    } catch {
      setError("生成に失敗しました。もう一度お試しください。");
    } finally { setLoading(false); }
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
              <h2 className="text-lg font-medium" style={{ color: "var(--md-on-surface)" }}>HP原稿案を生成</h2>
              <p className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>入力データからHP全ページの構成と原稿を作ります</p>
            </div>
          </div>

          {!pages && !loading && (
            <div className="text-center py-6">
              <button onClick={generate} className="px-6 py-3 text-sm font-medium" style={{ background: "var(--md-primary)", color: "var(--md-on-primary)", borderRadius: "100px", border: "none", cursor: "pointer" }}>
                生成を開始する
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <img src="/ponko.png" alt="" className="w-12 h-12 mx-auto mb-3 ponko-jump" />
              <p className="text-sm" style={{ color: "var(--md-on-surface-variant)" }}>ぽん子がHP原稿を作成中...</p>
            </div>
          )}

          {error && <p className="text-sm text-center py-4" style={{ color: "var(--md-error)" }}>{error}</p>}

          {pages && (
            <div className="space-y-4">
              {pages.map((page, pi) => (
                <div key={pi} className="p-4" style={{ background: "var(--md-surface-container-low)", borderRadius: "var(--md-shape-corner-lg)" }}>
                  <h3 className="text-sm font-medium mb-3" style={{ color: "var(--md-primary)" }}>{page.name}</h3>
                  <div className="space-y-3">
                    {page.sections.map((sec, si) => (
                      <div key={si}>
                        <p className="text-xs font-medium mb-1" style={{ color: "var(--md-on-surface)" }}>{sec.heading}</p>
                        <p className="text-xs leading-relaxed" style={{ color: "var(--md-on-surface-variant)" }}>{sec.content}</p>
                      </div>
                    ))}
                  </div>
                  {page.photos_needed.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {page.photos_needed.map((p, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5" style={{ background: "var(--md-secondary-container)", color: "var(--md-on-secondary-container)", borderRadius: "100px" }}>
                          📷 {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <button onClick={onClose} className="w-full mt-6 py-3 text-sm font-medium" style={{ background: pages ? "var(--md-primary)" : "var(--md-surface-container-high)", color: pages ? "var(--md-on-primary)" : "var(--md-on-surface-variant)", borderRadius: "100px", border: "none", cursor: "pointer" }}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
