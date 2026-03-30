"use client";

import { useState, useMemo, useEffect } from "react";
import { sections, steps } from "@/lib/schema";
import { getPonkoMessage } from "@/lib/ponko-messages";
import { exportAsJson, exportAsText } from "@/lib/export";
import { analyzePrimaryInfo, getScoreLabel } from "@/lib/primary-info-analyzer";
import PrimaryInfoModal from "./PrimaryInfoModal";

interface DashboardProps {
  values: Record<string, string>;
  onSelectSection: (sectionId: string) => void;
  clinicId?: string;
  onOpenChat?: () => void;
  onOpenAnalysis?: () => void;
}

export default function Dashboard({ values, onSelectSection, clinicId, onOpenChat, onOpenAnalysis }: DashboardProps) {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [messageSeed, setMessageSeed] = useState(() => Math.floor(Math.random() * 1000));

  // 8秒ごとにセリフを自動切り替え
  useEffect(() => {
    const timer = setInterval(() => {
      setMessageSeed((prev) => prev + 1);
    }, 8000);
    return () => clearInterval(timer);
  }, []);
  const sectionStats = sections.map((section) => {
    const filled = section.fields.filter(
      (f) => values[f.name]?.trim()
    ).length;
    const total = section.fields.length;
    const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
    return { section, filled, total, pct };
  });

  const totalFilled = sectionStats.reduce((sum, s) => sum + s.filled, 0);
  const totalFields = sectionStats.reduce((sum, s) => sum + s.total, 0);
  const overallPct =
    totalFields > 0 ? Math.round((totalFilled / totalFields) * 100) : 0;

  // 各テキストフィールドを個別に分析して累計
  const { primaryInfoScore, sectionPrimaryScores } = useMemo(() => {
    let totalScore = 0;
    let totalFields = 0;

    const sectionScores = sections.map((section) => {
      const textFields = section.fields.filter(
        (f) => f.type === "textarea" || f.type === "repeater"
      );
      let sectionTotal = 0;
      let sectionCount = 0;

      for (const field of textFields) {
        const val = values[field.name] || "";
        if (val.trim().length < 10) continue;
        const result = analyzePrimaryInfo(val);
        sectionTotal += result.score;
        sectionCount++;
        totalScore += result.score;
        totalFields++;
      }

      return {
        section,
        score: sectionCount > 0 ? Math.round(sectionTotal / sectionCount) : null,
      };
    });

    return {
      primaryInfoScore: totalFields > 0 ? Math.round(totalScore / totalFields) : 0,
      sectionPrimaryScores: sectionScores,
    };
  }, [values]);

  const primaryLabel = getScoreLabel(primaryInfoScore);

  return (
    <div className="max-w-lg mx-auto">
      {/* Header with Ponko */}
      <div className="text-center mb-6 pt-2">
        <img
          src="/ponko.png"
          alt="ぽん子"
          className="w-20 h-20 mx-auto mb-3 ponko-jump cursor-pointer"
          role="button"
          aria-label="ぽん子のセリフを切り替える"
          onClick={() => setMessageSeed(Math.floor(Math.random() * 1000))}
        />
        <h1 className="text-[22px] font-medium tracking-tight mb-1" style={{ color: "var(--md-on-surface)" }}>
          Clinic Portal <span className="font-normal text-sm" style={{ color: "var(--md-on-surface-variant)" }}>by Ponko</span>
        </h1>
        <div
          className="inline-block mt-2 px-4 py-2.5 text-sm text-left max-w-xs cursor-pointer"
          style={{
            background: "var(--md-surface-container)",
            borderRadius: "var(--md-shape-corner-lg)",
            boxShadow: "var(--md-elevation-1)",
            color: "var(--md-on-surface)",
          }}
          onClick={() => setMessageSeed(Math.floor(Math.random() * 1000))}
        >
          <p>{getPonkoMessage(overallPct, messageSeed)}</p>
        </div>
        <p
          className="text-[11px] mt-1.5"
          style={{ color: "var(--md-on-surface-variant)", }}
        >
          タップでぽん子が別のことを言うよ
        </p>
      </div>

      {/* Overall progress card */}
      <div
        className="p-5 mb-6"
        style={{
          background: "var(--md-primary-container)",
          borderRadius: "var(--md-shape-corner-xl)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium" style={{ color: "var(--md-on-primary-container)" }}>
            全体の入力進捗
          </span>
          <span className="text-3xl font-bold" style={{ color: "var(--md-primary)" }}>
            {overallPct}<span className="text-base font-medium">%</span>
          </span>
        </div>
        <div
          className="h-2 overflow-hidden"
          style={{
            background: "color-mix(in srgb, var(--md-primary) 15%, transparent)",
            borderRadius: "100px",
          }}
        >
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${overallPct}%`,
              background: "var(--md-primary)",
              borderRadius: "100px",
            }}
          />
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--md-on-surface-variant)" }}>
          {totalFilled} / {totalFields} 項目入力済み
        </p>

        {/* 全体の一次情報スコア */}
        {primaryInfoScore > 0 && (
          <div
            className="mt-3 p-2.5"
            style={{
              background: "var(--md-surface-container)",
              borderRadius: "var(--md-shape-corner-md)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <img src="/ponko.png" alt="ぽん子" className="w-7 h-7 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium" style={{ color: primaryLabel.color }}>
                    一次情報スコア
                  </span>
                  <span className="text-xs font-bold" style={{ color: primaryLabel.color }}>
                    {primaryInfoScore}%
                  </span>
                </div>
                <div
                  className="h-1.5 overflow-hidden"
                  style={{ background: "var(--md-outline-variant)", borderRadius: "100px" }}
                >
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${primaryInfoScore}%`,
                      background: primaryLabel.color,
                      borderRadius: "100px",
                    }}
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowInfoModal(true)}
              className="w-full mt-2.5 py-2 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              style={{
                background: "var(--md-primary)",
                color: "var(--md-on-primary)",
                borderRadius: "100px",
                border: "none",
                cursor: "pointer",
              }}
            >
              <img src="/ponko.png" alt="" className="w-4 h-4" />
              一次情報ってなに？
            </button>
          </div>
        )}

        {/* 未入力時でもボタンを表示 */}
        {primaryInfoScore === 0 && totalFilled > 0 && (
          <button
            onClick={() => setShowInfoModal(true)}
            className="w-full mt-3 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            style={{
              background: "var(--md-surface-container)",
              color: "var(--md-primary)",
              borderRadius: "100px",
              border: "1px solid rgba(26,115,232,0.3)",
              cursor: "pointer",
            }}
          >
            <img src="/ponko.png" alt="" className="w-4 h-4" />
            一次情報ってなに？大事なので読んでね！
          </button>
        )}
      </div>

      {/* Info modal */}
      <PrimaryInfoModal open={showInfoModal} onClose={() => setShowInfoModal(false)} />

      {/* Section cards grouped by step */}
      {steps.map((stepDef) => {
        const stepSections = sectionStats.filter((s) => s.section.step === stepDef.step);
        if (stepSections.length === 0) return null;

        return (
          <div key={stepDef.step} className="mb-6">
            {/* Step header */}
            <div className="flex items-center gap-3 mb-3">
              <span
                className="text-xs font-bold px-2.5 py-1"
                style={{
                  background: stepDef.step === 1 ? "var(--md-primary)" : "var(--md-secondary)",
                  color: stepDef.step === 1 ? "var(--md-on-primary)" : "var(--md-on-secondary)",
                  borderRadius: "100px",
                }}
              >
                {stepDef.title}
              </span>
              <span className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
                {stepDef.description}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-2">
              {stepSections.map(({ section, filled, total, pct }) => {
                const sectionPrimary = sectionPrimaryScores.find((s) => s.section.id === section.id);
                const sp = sectionPrimary?.score !== null && sectionPrimary?.score !== undefined
                  ? getScoreLabel(sectionPrimary.score)
                  : null;

                return (
                  <button
                    key={section.id}
                    onClick={() => onSelectSection(section.id)}
                    className="w-full text-left md-state-layer"
                    style={{
                      background: "var(--md-surface-container)",
                      borderRadius: "var(--md-shape-corner-lg)",
                      boxShadow: "var(--md-elevation-1)",
                      padding: "16px 20px",
                      border: "none",
                      cursor: "pointer",
                      transition: "box-shadow 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "var(--md-elevation-2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "var(--md-elevation-1)")}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 flex items-center justify-center text-xl shrink-0"
                        style={{
                          background: pct === 100 ? "var(--md-tertiary-container)" : "var(--md-secondary-container)",
                          borderRadius: "var(--md-shape-corner-md)",
                        }}
                      >
                        {section.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <h3 className="font-medium text-sm" style={{ color: "var(--md-on-surface)" }}>
                            {section.title}
                          </h3>
                          <span
                            className="text-xs px-2 py-0.5"
                            style={{
                              color: pct === 100 ? "var(--md-tertiary)" : "var(--md-on-surface-variant)",
                              background: pct === 100 ? "var(--md-tertiary-container)" : "var(--md-surface-container-low)",
                              borderRadius: "100px",
                              fontWeight: 500,
                            }}
                          >
                            {filled}/{total}
                          </span>
                        </div>
                        <div
                          className="h-1 overflow-hidden"
                          style={{ background: "var(--md-outline-variant)", borderRadius: "100px" }}
                        >
                          <div
                            className="h-full transition-all duration-300"
                            style={{
                              width: `${pct}%`,
                              background: pct === 100 ? "var(--md-tertiary)" : "var(--md-primary)",
                              borderRadius: "100px",
                            }}
                          />
                        </div>

                        {sp && sectionPrimary?.score != null && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <img src="/ponko.png" alt="" className="w-3.5 h-3.5" />
                            <span className="text-[11px]" style={{ color: "var(--md-on-surface-variant)" }}>
                              一次情報
                            </span>
                            <div
                              className="flex-1 h-1 overflow-hidden"
                              style={{ background: "var(--md-outline-variant)", borderRadius: "100px" }}
                            >
                              <div
                                className="h-full transition-all duration-300"
                                style={{
                                  width: `${sectionPrimary.score}%`,
                                  background: sp.color,
                                  borderRadius: "100px",
                                }}
                              />
                            </div>
                            <span className="text-[11px] font-bold" style={{ color: sp.color }}>
                              {sectionPrimary.score}%
                            </span>
                          </div>
                        )}

                        {!sp && filled > 0 && (
                          <p
                            className="text-[11px] mt-1 flex items-center gap-1"
                            style={{ color: "var(--md-on-surface-variant)" }}
                            onClick={(e) => { e.stopPropagation(); setShowInfoModal(true); }}
                          >
                            <img src="/ponko.png" alt="" className="w-3.5 h-3.5" />
                            一次情報を入れるともっと良くなりますよ！
                          </p>
                        )}
                      </div>
                      <svg
                        className="w-5 h-5 shrink-0"
                        style={{ color: "var(--md-on-surface-variant)" }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Tools */}
      {totalFilled > 0 && clinicId && (
        <div
          className="mt-6 p-4"
          style={{
            background: "var(--md-surface-container)",
            borderRadius: "var(--md-shape-corner-lg)",
            boxShadow: "var(--md-elevation-1)",
          }}
        >
          <p className="text-xs font-medium mb-3" style={{ color: "var(--md-on-surface-variant)" }}>
            ツール
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {onOpenChat && (
              <button
                onClick={onOpenChat}
                className="text-xs font-medium px-3 py-2 flex items-center gap-1.5"
                style={{
                  background: "var(--md-primary)",
                  color: "var(--md-on-primary)",
                  borderRadius: "100px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <img src="/ponko.png" alt="" className="w-4 h-4" />
                ぽん子に相談
              </button>
            )}
            {onOpenAnalysis && (
              <button
                onClick={onOpenAnalysis}
                className="text-xs font-medium px-3 py-2 flex items-center gap-1.5"
                style={{
                  background: "var(--md-tertiary-container)",
                  color: "var(--md-tertiary)",
                  borderRadius: "100px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                AI総合診断
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => exportAsText(clinicId, values)}
              className="text-xs font-medium px-3 py-2 flex items-center gap-1.5"
              style={{
                background: "var(--md-surface-container-low)",
                color: "var(--md-on-surface)",
                borderRadius: "100px",
                border: "1px solid var(--md-outline-variant)",
                cursor: "pointer",
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              テキスト出力
            </button>
            <button
              onClick={() => exportAsJson(clinicId, values)}
              className="text-xs font-medium px-3 py-2 flex items-center gap-1.5"
              style={{
                background: "var(--md-surface-container-low)",
                color: "var(--md-on-surface)",
                borderRadius: "100px",
                border: "1px solid var(--md-outline-variant)",
                cursor: "pointer",
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              JSON出力
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
