"use client";

import { useMemo, useState, useEffect } from "react";
import {
  analyzePrimaryInfo,
  getScoreLabel,
  type AnalysisResult,
} from "@/lib/primary-info-analyzer";
import { WRITING_STARTERS } from "@/lib/writing-starters";

interface PrimaryInfoMeterProps {
  text: string;
  minLength?: number;
  /** テキストを追記するコールバック */
  onAppendText?: (appendText: string) => void;
}

function getPonkoReaction(score: number): string {
  if (score >= 90) return "え〜〜っ！先生すごすぎます！！これ最高の文章じゃないですか！！";
  if (score >= 80) return "わあっ！めちゃくちゃ良いです！先生の想いがしっかり伝わってきます！";
  if (score >= 60) return "いい感じです！あとちょっと深掘りしたらもっと良くなりますよ！";
  if (score >= 40) return "ありがとうございます！もう少し先生ならではのお話聞かせてください！";
  return "";
}

export default function PrimaryInfoMeter({
  text,
  minLength = 5,
  onAppendText,
}: PrimaryInfoMeterProps) {
  // デバウンス: 入力中は500ms待ってから分析
  const [debouncedText, setDebouncedText] = useState(text);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedText(text), 500);
    return () => clearTimeout(timer);
  }, [text]);

  const analysis: AnalysisResult = useMemo(
    () => analyzePrimaryInfo(debouncedText),
    [debouncedText]
  );

  if (!text || text.trim().length < minLength) return null;

  const { label, color, bgColor } = getScoreLabel(analysis.score);
  const ponkoReaction = getPonkoReaction(analysis.score);

  const highPriorityMissing = analysis.missing.filter(
    (m) => m.priority === "high"
  );

  return (
    <div className="mt-3 space-y-2">
      {/* Score meter */}
      <div
        className="p-3"
        style={{
          background: bgColor,
          borderRadius: "var(--md-shape-corner-md)",
        }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium flex items-center gap-1.5" style={{ color }}>
            <img src="/ponko.png" alt="ぽん子" className="w-5 h-5 rounded-full" />
            一次情報チェック
          </span>
          <span className="text-xs font-bold" style={{ color }}>
            {label}
          </span>
        </div>
        <div
          className="h-1.5 overflow-hidden"
          style={{
            background: "var(--md-outline-variant)",
            borderRadius: "100px",
          }}
        >
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${analysis.score}%`,
              background: color,
              borderRadius: "100px",
            }}
          />
        </div>

        {analysis.detected.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {analysis.detected.map((d, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 font-medium"
                style={{
                  background: "var(--md-surface-container)",
                  color,
                  borderRadius: "100px",
                }}
              >
                {d.label}
              </span>
            ))}
          </div>
        )}

        {ponkoReaction && (
          <div className="flex items-start gap-2 mt-2">
            <img src="/ponko.png" alt="ぽん子" className="w-6 h-6 rounded-full shrink-0" />
            <p className="text-xs leading-relaxed font-medium" style={{ color }}>
              {ponkoReaction}
            </p>
          </div>
        )}
      </div>

      {/* Missing feedback with writing starters */}
      {highPriorityMissing.map((m, i) => (
        <div key={i} className="space-y-1.5">
          <div
            className="flex items-start gap-2 px-3 py-2"
            style={{
              background: "var(--md-error-container)",
              borderRadius: "var(--md-shape-corner-sm)",
            }}
          >
            <img src="/ponko.png" alt="ぽん子" className="w-5 h-5 rounded-full shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed" style={{ color: "var(--md-error)" }}>
              {m.question}
            </p>
          </div>

          {/* Writing starters */}
          {onAppendText && WRITING_STARTERS[m.type] && (
            <div className="pl-7">
              <p
                className="text-[10px] font-medium mb-1"
                style={{ color: "var(--md-on-surface-variant)" }}
              >
                例えば...（タップで追記）
              </p>
              <div className="flex flex-wrap gap-1">
                {WRITING_STARTERS[m.type].map((starter, j) => (
                  <button
                    key={j}
                    type="button"
                    onClick={() => onAppendText(starter.text)}
                    className="text-[11px] px-2.5 py-1 font-medium transition-colors"
                    style={{
                      background: "var(--md-surface-container)",
                      color: "var(--md-primary)",
                      borderRadius: "100px",
                      border: "1px solid var(--md-outline)",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--md-primary-container)";
                      e.currentTarget.style.borderColor = "var(--md-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "var(--md-surface-container)";
                      e.currentTarget.style.borderColor = "var(--md-outline)";
                    }}
                  >
                    {starter.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Medium priority */}
      {analysis.score < 60 &&
        analysis.missing
          .filter((m) => m.priority === "medium")
          .map((m, i) => (
            <div key={`med-${i}`} className="space-y-1.5">
              <div
                className="flex items-start gap-2 px-3 py-2"
                style={{
                  background: "var(--md-surface-container-low)",
                  borderRadius: "var(--md-shape-corner-sm)",
                }}
              >
                <img src="/ponko.png" alt="ぽん子" className="w-5 h-5 rounded-full shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed" style={{ color: "var(--md-on-surface-variant)" }}>
                  {m.question}
                </p>
              </div>

              {onAppendText && WRITING_STARTERS[m.type] && (
                <div className="pl-7">
                  <p
                    className="text-[10px] font-medium mb-1"
                    style={{ color: "var(--md-on-surface-variant)" }}
                  >
                    例えば...
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {WRITING_STARTERS[m.type].map((starter, j) => (
                      <button
                        key={j}
                        type="button"
                        onClick={() => onAppendText(starter.text)}
                        className="text-[11px] px-2.5 py-1 font-medium transition-colors"
                        style={{
                          background: "var(--md-surface-container)",
                          color: "var(--md-on-surface-variant)",
                          borderRadius: "100px",
                          border: "1px solid var(--md-outline-variant)",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--md-primary-container)";
                          e.currentTarget.style.color = "var(--md-primary)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "var(--md-surface-container)";
                          e.currentTarget.style.color = "var(--md-on-surface-variant)";
                        }}
                      >
                        {starter.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
    </div>
  );
}
