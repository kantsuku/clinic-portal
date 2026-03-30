"use client";

import { useState } from "react";
import { sections } from "@/lib/schema";

interface AnalysisReportProps {
  values: Record<string, string>;
  onClose: () => void;
}

interface Report {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  seo_keywords: string[];
  persona: string;
  differentiator: string;
}

export default function AnalysisReport({ values, onClose }: AnalysisReportProps) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runAnalysis() {
    setLoading(true);
    setError("");
    try {
      const data: Record<string, string> = {};
      for (const section of sections) {
        for (const field of section.fields) {
          if (values[field.name]?.trim()) {
            data[field.label] = values[field.name];
          }
        }
      }
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (!res.ok) throw new Error();
      const result = await res.json();
      setReport(result.report);
    } catch {
      setError("分析に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4"
        style={{
          background: "var(--md-surface-container)",
          borderRadius: "var(--md-shape-corner-xl) var(--md-shape-corner-xl) 0 0",
          boxShadow: "var(--md-elevation-2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-8 h-1 rounded-full" style={{ background: "var(--md-outline-variant)" }} />
        </div>

        <div className="px-6 pb-8 pt-2">
          <div className="flex items-center gap-3 mb-5">
            <img src="/ponko.png" alt="ぽん子" className="w-10 h-10" />
            <div>
              <h2 className="text-lg font-medium" style={{ color: "var(--md-on-surface)" }}>
                AI総合診断
              </h2>
              <p className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
                入力データを分析してレポートを出します
              </p>
            </div>
          </div>

          {!report && !loading && (
            <div className="text-center py-8">
              <p className="text-sm mb-4" style={{ color: "var(--md-on-surface-variant)" }}>
                入力した全データをAIが分析し、強み・弱み・改善提案をレポートにします
              </p>
              <button
                onClick={runAnalysis}
                className="px-6 py-3 text-sm font-medium"
                style={{
                  background: "var(--md-primary)",
                  color: "var(--md-on-primary)",
                  borderRadius: "100px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                診断を開始する
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <img src="/ponko.png" alt="" className="w-12 h-12 mx-auto mb-3 ponko-jump" />
              <p className="text-sm" style={{ color: "var(--md-on-surface-variant)" }}>
                ぽん子が分析中です...
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-center py-4" style={{ color: "var(--md-error)" }}>{error}</p>
          )}

          {report && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="p-4" style={{ background: "var(--md-primary-container)", borderRadius: "var(--md-shape-corner-lg)" }}>
                <p className="text-sm leading-relaxed" style={{ color: "var(--md-on-primary-container)" }}>
                  {report.summary}
                </p>
              </div>

              {/* Differentiator */}
              {report.differentiator && (
                <div className="p-4" style={{ background: "var(--md-tertiary-container)", borderRadius: "var(--md-shape-corner-lg)" }}>
                  <p className="text-xs font-medium mb-1" style={{ color: "var(--md-tertiary)" }}>最大の差別化ポイント</p>
                  <p className="text-sm font-medium" style={{ color: "var(--md-on-surface)" }}>{report.differentiator}</p>
                </div>
              )}

              {/* Strengths */}
              {report.strengths.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: "var(--md-tertiary)" }}>強み</p>
                  <div className="space-y-1">
                    {report.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span style={{ color: "var(--md-tertiary)" }}>+</span>
                        <span style={{ color: "var(--md-on-surface)" }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weaknesses */}
              {report.weaknesses.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: "var(--md-error)" }}>改善余地</p>
                  <div className="space-y-1">
                    {report.weaknesses.map((w, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span style={{ color: "var(--md-error)" }}>-</span>
                        <span style={{ color: "var(--md-on-surface)" }}>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {report.suggestions.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: "var(--md-primary)" }}>改善提案</p>
                  <div className="space-y-1">
                    {report.suggestions.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span style={{ color: "var(--md-primary)" }}>{i + 1}.</span>
                        <span style={{ color: "var(--md-on-surface)" }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SEO Keywords */}
              {report.seo_keywords.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: "var(--md-on-surface-variant)" }}>推奨SEOキーワード</p>
                  <div className="flex flex-wrap gap-1.5">
                    {report.seo_keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="text-xs px-3 py-1"
                        style={{
                          background: "var(--md-surface-container-low)",
                          color: "var(--md-on-surface)",
                          borderRadius: "100px",
                          border: "1px solid var(--md-outline-variant)",
                        }}
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Persona */}
              {report.persona && (
                <div className="p-3" style={{ background: "var(--md-surface-container-low)", borderRadius: "var(--md-shape-corner-md)" }}>
                  <p className="text-xs font-medium mb-1" style={{ color: "var(--md-on-surface-variant)" }}>想定患者像</p>
                  <p className="text-sm" style={{ color: "var(--md-on-surface)" }}>{report.persona}</p>
                </div>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full mt-6 py-3 text-sm font-medium"
            style={{
              background: report ? "var(--md-primary)" : "var(--md-surface-container-high)",
              color: report ? "var(--md-on-primary)" : "var(--md-on-surface-variant)",
              borderRadius: "100px",
              border: "none",
              cursor: "pointer",
            }}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
