"use client";

import { useState, useMemo } from "react";
import { getSections, getSteps, type SectionDef, type StepDef } from "@/lib/schema";
type IndustryType = "dental" | "corporate";
import { ChevronRight, Lock } from "lucide-react";
import Icon from "./Icon";

interface DashboardProps {
  values: Record<string, string>;
  onSelectSection: (sectionId: string) => void;
  industry?: IndustryType;
  step2Unlocked?: boolean;
}

export default function Dashboard({ values, onSelectSection, industry, step2Unlocked = false }: DashboardProps) {
  const sections = getSections(industry);
  const steps = getSteps(industry);

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

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-6 pt-2">
        <img
          src="/ponko.png"
          alt="Clinic Portal"
          className="w-16 h-16 mx-auto mb-3"
        />
        <h1 className="text-[22px] font-medium tracking-tight mb-1" style={{ color: "var(--md-on-surface)" }}>
          Clinic Portal
        </h1>
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

      </div>

      {/* Section cards grouped by step */}
      {steps.map((stepDef) => {
        const stepSections = sectionStats.filter((s) => s.section.step === stepDef.step);
        if (stepSections.length === 0) return null;

        const isLocked = stepDef.step === 2 && !step2Unlocked;

        return (
          <div key={stepDef.step} className="mb-6">
            {/* Step header */}
            <div className="flex items-center gap-3 mb-3">
              <span
                className="text-xs font-bold px-2.5 py-1 flex items-center gap-1"
                style={{
                  background: isLocked ? "var(--md-outline-variant)" : stepDef.step === 0 ? "var(--md-on-surface-variant)" : stepDef.step === 1 ? "var(--md-primary)" : "var(--md-secondary)",
                  color: isLocked ? "var(--md-on-surface-variant)" : "var(--md-on-primary)",
                  borderRadius: "100px",
                }}
              >
                {isLocked && <Lock size={12} />}
                {stepDef.title}
              </span>
              <span className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
                {isLocked ? "担当者が確認後に解放されます" : stepDef.description}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-2" style={isLocked ? { opacity: 0.45, pointerEvents: "none" } : undefined}>
              {stepSections.map(({ section, filled, total, pct }) => {
                return (
                  <div
                    key={section.id}
                    className="w-full text-left relative"
                    style={{
                      background: "var(--md-surface-container)",
                      borderRadius: "var(--md-shape-corner-lg)",
                      boxShadow: "var(--md-elevation-1)",
                      padding: "16px 20px",
                      border: "none",
                      cursor: isLocked ? "not-allowed" : "pointer",
                      transition: "box-shadow 0.2s",
                    }}
                    onClick={() => !isLocked && onSelectSection(section.id)}
                    role={isLocked ? undefined : "button"}
                    tabIndex={isLocked ? -1 : 0}
                  >
                    {isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ borderRadius: "var(--md-shape-corner-lg)", zIndex: 1 }}>
                        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(135deg, transparent, transparent 10px, var(--md-outline-variant) 10px, var(--md-outline-variant) 11px)", borderRadius: "var(--md-shape-corner-lg)", opacity: 0.3 }} />
                        <Lock size={24} style={{ color: "var(--md-on-surface-variant)", position: "relative", zIndex: 2 }} />
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 flex items-center justify-center shrink-0"
                        style={{
                          background: isLocked ? "var(--md-surface-container-high)" : pct === 100 ? "var(--md-tertiary-container)" : "var(--md-secondary-container)",
                          color: isLocked ? "var(--md-on-surface-variant)" : pct === 100 ? "var(--md-tertiary)" : "var(--md-on-surface-variant)",
                          borderRadius: "var(--md-shape-corner-md)",
                        }}
                      >
                        {isLocked ? <Lock size={20} /> : <Icon name={section.icon} size={20} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <h3 className="font-medium text-sm" style={{ color: "var(--md-on-surface)" }}>
                            {section.title}
                            {section.estimatedMinutes && pct < 100 && (
                              <span className="text-[11px] font-normal ml-1.5" style={{ color: "var(--md-on-surface-variant)" }}>
                                約{section.estimatedMinutes}分
                              </span>
                            )}
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

                      </div>
                      {!isLocked && <ChevronRight
                        size={20}
                        className="shrink-0"
                        style={{ color: "var(--md-on-surface-variant)" }}
                      />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

    </div>
  );
}
