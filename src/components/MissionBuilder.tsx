"use client";

import { useState, useEffect, useRef } from "react";
import { saveMissionDraft, loadMissionDraft } from "@/lib/storage";
import { MISSION_CATEGORIES, ALL_MISSION_QUESTIONS } from "@/lib/mission-questions";

interface MissionBuilderProps {
  clinicId: string;
  onComplete: (result: string) => void;
  onBack: () => void;
}

interface MissionPattern {
  tone: string;
  tone_description: string;
  mission: string;
  mission_supplement: string;
  slogan: string;
  ways: string[];
}

interface GeneratedResult {
  patterns: MissionPattern[];
  analysis: string;
}

export default function MissionBuilder({ clinicId, onComplete, onBack }: MissionBuilderProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(() => {
    const saved = loadMissionDraft(clinicId);
    const initial: Record<string, string | string[]> = {};
    for (const q of ALL_MISSION_QUESTIONS) {
      initial[q.key] = q.type === "multi" ? [] : "";
    }
    if (saved) return { ...initial, ...saved };
    return initial;
  });
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [selectedPattern, setSelectedPattern] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveMissionDraft(clinicId, answers as any);
  }, [answers, clinicId]);

  const filledCount = ALL_MISSION_QUESTIONS.filter((q) => {
    const v = answers[q.key];
    if (Array.isArray(v)) return v.length > 0;
    return typeof v === "string" && v.trim();
  }).length;
  const canGenerate = filledCount >= 10;

  function setAnswer(key: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function toggleMulti(key: string, option: string) {
    const current = (answers[key] as string[]) || [];
    const next = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    setAnswer(key, next);
  }

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const labeled: Record<string, string> = {};
      for (const cat of MISSION_CATEGORIES) {
        for (const q of cat.questions) {
          const v = answers[q.key];
          if (Array.isArray(v) && v.length > 0) {
            labeled[`[${cat.title}] ${q.label}`] = v.join("、");
          } else if (typeof v === "string" && v.trim()) {
            labeled[`[${cat.title}] ${q.label}`] = v;
          }
        }
      }
      const res = await fetch("/api/generate-mission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: labeled }),
      });
      if (!res.ok) throw new Error();
      const { result: r } = await res.json();
      setResult(r);
      setSelectedPattern(0);
      if (r.patterns?.[0]) {
        setEditedText(formatPattern(r.patterns[0]));
      }
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 300);
    } catch {
      setError("生成に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  function formatPattern(p: MissionPattern): string {
    return [
      `【MISSION】\n${p.mission}`,
      p.mission_supplement ? `\n${p.mission_supplement}` : "",
      `\n\n【スローガン】\n${p.slogan}`,
      `\n\n【WAY】\n${(p.ways || []).map((w, i) => `${i + 1}. ${w}`).join("\n")}`,
    ].join("");
  }

  function handleSelectPattern(idx: number) {
    setSelectedPattern(idx);
    if (result?.patterns?.[idx]) {
      setEditedText(formatPattern(result.patterns[idx]));
    }
  }

  function handleComplete() {
    onComplete(editing ? editedText : formatPattern(result!.patterns[selectedPattern]));
  }

  return (
    <div className="max-w-lg mx-auto">
      <button onClick={onBack} className="mb-4 text-sm flex items-center gap-1 py-2 px-1"
        style={{ color: "var(--md-primary)", background: "transparent", border: "none", cursor: "pointer", fontWeight: 500 }}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        一覧に戻る
      </button>

      {/* Header */}
      <div className="p-5 mb-4" style={{ background: "var(--md-primary-container)", borderRadius: "var(--md-shape-corner-xl)" }}>
        <div className="flex items-center gap-3 mb-3">
          <img src="/ponko.png" alt="ぽん子" className="w-12 h-12 ponko-jump" />
          <div>
            <h2 className="text-lg font-medium" style={{ color: "var(--md-on-primary-container)" }}>診療理念ツクール</h2>
            <p className="text-xs" style={{ color: "var(--md-on-primary-container)" }}>
              {ALL_MISSION_QUESTIONS.length}問のヒアリングから、先生だけの理念を設計します
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 overflow-hidden" style={{ background: "rgba(255,255,255,0.3)", borderRadius: "100px" }}>
            <div className="h-full transition-all duration-300" style={{ width: `${(filledCount / ALL_MISSION_QUESTIONS.length) * 100}%`, background: "var(--md-primary)", borderRadius: "100px" }} />
          </div>
          <span className="text-xs font-bold" style={{ color: "var(--md-on-primary-container)" }}>{filledCount}/{ALL_MISSION_QUESTIONS.length}</span>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-5 mb-6">
        {MISSION_CATEGORIES.map((cat) => {
          const catFilled = cat.questions.filter((q) => {
            const v = answers[q.key];
            return Array.isArray(v) ? v.length > 0 : typeof v === "string" && v.trim();
          }).length;

          return (
            <div key={cat.id}>
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="text-lg">{cat.icon}</span>
                <p className="text-sm font-medium flex-1" style={{ color: "var(--md-on-surface)" }}>{cat.title}</p>
                <span className="text-[11px] px-2 py-0.5 font-medium" style={{
                  background: catFilled === cat.questions.length ? "var(--md-tertiary-container)" : "var(--md-surface-container-low)",
                  color: catFilled === cat.questions.length ? "var(--md-tertiary)" : "var(--md-on-surface-variant)",
                  borderRadius: "100px",
                }}>{catFilled}/{cat.questions.length}</span>
              </div>

              <div className="space-y-2">
                {cat.questions.map((q) => (
                  <div key={q.key} className="p-3 sm:p-4" style={{ background: "var(--md-surface-container)", borderRadius: "var(--md-shape-corner-md)", boxShadow: "var(--md-elevation-1)" }}>
                    <p className="text-sm font-medium mb-2" style={{ color: "var(--md-on-surface)" }}>{q.label}</p>

                    {q.type === "text" && (
                      <textarea className="w-full resize-y" rows={2} placeholder={q.placeholder}
                        value={(answers[q.key] as string) || ""}
                        onChange={(e) => setAnswer(q.key, e.target.value)} />
                    )}

                    {q.type === "select" && q.options && (
                      <div className="flex flex-wrap gap-1.5">
                        {q.options.map((opt) => (
                          <button key={opt} type="button" onClick={() => setAnswer(q.key, opt)}
                            className="text-xs font-medium px-3 py-2 min-h-[36px] transition-colors"
                            style={{
                              background: answers[q.key] === opt ? "var(--md-primary)" : "var(--md-surface-container-low)",
                              color: answers[q.key] === opt ? "var(--md-on-primary)" : "var(--md-on-surface-variant)",
                              borderRadius: "100px", border: answers[q.key] === opt ? "none" : "1px solid var(--md-outline-variant)", cursor: "pointer",
                            }}>{opt}</button>
                        ))}
                      </div>
                    )}

                    {q.type === "multi" && q.options && (
                      <div className="flex flex-wrap gap-1.5">
                        {q.options.map((opt) => {
                          const selected = ((answers[q.key] as string[]) || []).includes(opt);
                          return (
                            <button key={opt} type="button" onClick={() => toggleMulti(q.key, opt)}
                              className="text-xs font-medium px-3 py-2 min-h-[36px] transition-colors"
                              style={{
                                background: selected ? "var(--md-primary)" : "var(--md-surface-container-low)",
                                color: selected ? "var(--md-on-primary)" : "var(--md-on-surface-variant)",
                                borderRadius: "100px", border: selected ? "none" : "1px solid var(--md-outline-variant)", cursor: "pointer",
                              }}>{opt}</button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Generate */}
      {!result && (
        <div className="mb-6">
          <button onClick={handleGenerate} disabled={!canGenerate || loading}
            className="w-full py-3.5 text-sm font-medium min-h-[48px] flex items-center justify-center gap-2"
            style={{
              background: canGenerate && !loading ? "var(--md-primary)" : "var(--md-surface-container-high)",
              color: canGenerate && !loading ? "var(--md-on-primary)" : "var(--md-on-surface-variant)",
              borderRadius: "100px", border: "none", cursor: canGenerate && !loading ? "pointer" : "default",
            }}>
            {loading ? (
              <><img src="/ponko.png" alt="" className="w-5 h-5 ponko-jump" />ぽん子が理念を設計しています...</>
            ) : (
              <><img src="/ponko.png" alt="" className="w-5 h-5" />3パターン生成する（{canGenerate ? "準備OK" : `あと${10 - filledCount}項目`}）</>
            )}
          </button>
          {!canGenerate && <p className="text-[11px] text-center mt-1.5" style={{ color: "var(--md-on-surface-variant)" }}>最低10項目で生成可能（多いほど精度UP）</p>}
        </div>
      )}

      {error && <p className="text-sm text-center mb-4" style={{ color: "var(--md-error)" }}>{error}</p>}

      {/* Results — 3 patterns */}
      {result && result.patterns && (
        <div ref={resultRef} className="space-y-4 mb-6">
          {/* Analysis */}
          {result.analysis && (
            <div className="flex items-start gap-2 px-1 mb-2">
              <img src="/ponko.png" alt="" className="w-6 h-6 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed" style={{ color: "var(--md-on-surface-variant)" }}>{result.analysis}</p>
            </div>
          )}

          {/* Pattern selector */}
          <div className="flex gap-2">
            {result.patterns.map((p, i) => (
              <button key={i} onClick={() => { handleSelectPattern(i); setEditing(false); }}
                className="flex-1 py-2.5 text-xs font-medium text-center min-h-[44px]"
                style={{
                  background: selectedPattern === i ? "var(--md-primary)" : "var(--md-surface-container)",
                  color: selectedPattern === i ? "var(--md-on-primary)" : "var(--md-on-surface-variant)",
                  borderRadius: "var(--md-shape-corner-md)", border: selectedPattern === i ? "none" : "1px solid var(--md-outline-variant)", cursor: "pointer",
                }}>
                {p.tone}
              </button>
            ))}
          </div>

          {/* Selected pattern display */}
          {!editing ? (
            (() => {
              const p = result.patterns[selectedPattern];
              if (!p) return null;
              return (
                <div className="space-y-3">
                  <p className="text-[11px] px-1" style={{ color: "var(--md-on-surface-variant)" }}>{p.tone_description}</p>

                  <div className="p-5" style={{ background: "var(--md-primary-container)", borderRadius: "var(--md-shape-corner-xl)" }}>
                    <p className="text-xs font-medium mb-2" style={{ color: "var(--md-primary)" }}>MISSION</p>
                    <p className="text-lg font-medium leading-relaxed" style={{ color: "var(--md-on-primary-container)" }}>{p.mission}</p>
                    {p.mission_supplement && <p className="text-xs mt-3 leading-relaxed" style={{ color: "var(--md-on-primary-container)" }}>{p.mission_supplement}</p>}
                  </div>

                  <div className="p-5 text-center" style={{ background: "var(--md-tertiary-container)", borderRadius: "var(--md-shape-corner-xl)" }}>
                    <p className="text-xs font-medium mb-2" style={{ color: "var(--md-tertiary)" }}>スローガン</p>
                    <p className="text-xl font-medium" style={{ color: "var(--md-on-surface)" }}>{p.slogan}</p>
                  </div>

                  <div className="p-5" style={{ background: "var(--md-surface-container)", borderRadius: "var(--md-shape-corner-xl)", boxShadow: "var(--md-elevation-1)" }}>
                    <p className="text-xs font-medium mb-3" style={{ color: "var(--md-on-surface-variant)" }}>WAY（行動指針）</p>
                    <ol className="space-y-3">
                      {(p.ways || []).map((way, i) => (
                        <li key={i} className="text-sm flex items-start gap-3">
                          <span className="text-xs font-bold shrink-0 w-6 h-6 flex items-center justify-center" style={{ background: "var(--md-primary-container)", color: "var(--md-primary)", borderRadius: "100%" }}>{i + 1}</span>
                          <span className="pt-0.5" style={{ color: "var(--md-on-surface)" }}>{way}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="p-4" style={{ background: "var(--md-surface-container)", borderRadius: "var(--md-shape-corner-lg)", boxShadow: "var(--md-elevation-1)" }}>
              <textarea className="w-full resize-y" rows={18} value={editedText} onChange={(e) => setEditedText(e.target.value)} />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button onClick={handleComplete} className="flex-1 py-3 text-sm font-medium min-h-[48px]"
              style={{ background: "var(--md-primary)", color: "var(--md-on-primary)", borderRadius: "100px", border: "none", cursor: "pointer" }}>
              この理念を使う
            </button>
            <button onClick={() => setEditing(!editing)} className="px-4 py-3 text-sm font-medium min-h-[48px]"
              style={{ background: "var(--md-surface-container)", color: "var(--md-on-surface-variant)", borderRadius: "100px", border: "1px solid var(--md-outline-variant)", cursor: "pointer" }}>
              {editing ? "プレビュー" : "編集"}
            </button>
            <button onClick={() => { setResult(null); setEditing(false); }} className="px-4 py-3 text-sm font-medium min-h-[48px]"
              style={{ background: "transparent", color: "var(--md-on-surface-variant)", borderRadius: "100px", border: "1px solid var(--md-outline-variant)", cursor: "pointer" }}>
              再生成
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
