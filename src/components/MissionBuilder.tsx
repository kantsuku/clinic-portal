"use client";

import { useState, useEffect, useRef } from "react";
import { saveMissionDraft, loadMissionDraft } from "@/lib/storage";
import { MISSION_CATEGORIES, ALL_MISSION_QUESTIONS } from "@/lib/mission-questions";
import MissionAboutModal from "./MissionAboutModal";

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

// Dark theme colors
const DK = {
  bg: "#0a0a0a",
  surface: "#141414",
  surfaceHigh: "#1e1e1e",
  surfaceBright: "#282828",
  border: "#333",
  text: "#f5f5f5",
  textSub: "#888",
  textMuted: "#555",
  accent: "#fff",
  accentSoft: "rgba(255,255,255,0.08)",
  gold: "#d4a853",
  goldSoft: "rgba(212,168,83,0.15)",
};

export default function MissionBuilder({ clinicId, onComplete, onBack }: MissionBuilderProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(() => {
    const saved = loadMissionDraft(clinicId);
    const initial: Record<string, string | string[]> = {};
    for (const q of ALL_MISSION_QUESTIONS) initial[q.key] = q.type === "multi" ? [] : "";
    if (saved) {
      const merged = { ...initial, ...saved };
      // 空でなければ復元
      const hasData = Object.values(merged).some((v) => Array.isArray(v) ? v.length > 0 : typeof v === "string" && v.trim());
      if (hasData) return merged;
    }
    // デモ用サンプルデータ
    if (clinicId === "demo") return {
      ...initial,
      p_personality: "職人気質",
      p_strength: "説明力",
      p_hobby: "料理（特にパスタ）。細かい作業が好きなのは歯科と通じるかも",
      p_role_model: "大学院時代の山田教授。「歯周病は全身の健康に関わる。だから予防が大事だ」と繰り返し教わった",
      o_why_dentist: "小学生の頃に転んで前歯を折った。担当の先生が「大丈夫、きれいに治るからね」と笑顔で言ってくれて、あの温かさが忘れられなかった",
      o_opening_type: "新規開業",
      o_opening_reason: "勤務先では説明に十分な時間が取れなかった。自分の医院なら1人30分のカウンセリングができると確信した",
      o_regret: "勤務医時代、説明不足のまま患者さんが不安そうに治療を受けていたこと。あの表情が忘れられない",
      o_joy: "歯医者が怖くて5年通えなかった患者さんが、うちに来てから笑顔で通えるようになった",
      o_prev_frustration: "カウンセリングに時間をかけたかったが、勤務先の枠組みでは15分が限界だった",
      a_local_love: "縁があって選んだ",
      a_area_role: "子育て世代が安心して通える歯医者。平日忙しい人も土曜に来られるように",
      a_community: ["学校歯科"],
      t_main_age: ["20-30代", "40-50代"],
      t_main_concern: ["虫歯", "歯周病", "メンテナンス"],
      t_ideal_patient: "仕事が忙しくて通院を後回しにしてきたけど、「そろそろちゃんとしたい」と思って来てくれた30代の会社員",
      t_relationship: "頼れる専門家",
      t_not_for: "「安くて早ければいい」という方。うちは時間をかけてでも説明を大切にするので",
      s_priority: "歯の保存",
      s_approach: "予防重視",
      s_counseling: "じっくり時間をかける",
      s_tech_stance: "実績が出てから導入",
      s_difference: "全患者に30分のカウンセリング枠を確保していること。モニターで検査結果を見せながら説明する",
      v_most_important: "患者さんが納得してから治療を始めること。時間がかかっても説明を省くことは絶対にしない",
      v_quality_std: "マイクロスコープを使った精密な根管治療。見えない部分こそ手を抜かない",
      v_unique_value: ["安心感", "教育・啓発"],
      v_insurance_vs_self: "患者に合わせて使い分け",
      n_never_patient: "説明なしに治療を始めること。急いでいても必ず選択肢を提示する",
      n_never_profit: "不要な自費治療を勧めること。「経過観察でOK」なら正直にそう伝える",
      n_never_others: "ネット広告で煽るような集患",
      n_dilemma: "とことん話し合う",
      vi_5year: "この地域で「歯のことならさくら歯科」と言われる存在になりたい",
      vi_10year: "後進の育成にも関わりたい。自分が恩師から学んだことを次の世代に伝えたい",
      vi_success: "患者さんの子どもが大人になって「子どもの頃から通ってるんだよね」と言ってくれたら",
      vi_legacy: "地域の健康文化",
      e_hardest: "コロナ禍で患者数が半減した時期。スタッフと「来てくれる人に最高の対応をしよう」と決めて乗り越えた",
      e_tension: "初診のカウンセリング。第一印象で信頼関係が決まるから",
      e_good_day: "患者さんが安心した顔で帰っていった日",
      e_motivation: "患者の笑顔",
      tm_message: "患者さんの名前を覚えること。名前で呼ばれるだけで安心感が全然違う",
      tm_hire_priority: "人柄・素直さ",
      tm_culture: "家族のような温かさ",
      tm_growth: "積極的に教える",
      c_first_impression: "「ここは時間をかけて説明してくれるんだな」と思ってもらいたい",
      c_explain_style: "図や写真で視覚的に",
      c_bad_news: "選択肢と一緒に提示して",
    };
    return initial;
  });
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [selectedPattern, setSelectedPattern] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => { saveMissionDraft(clinicId, answers as any); }, [answers, clinicId]);

  const filledCount = ALL_MISSION_QUESTIONS.filter((q) => {
    const v = answers[q.key];
    return Array.isArray(v) ? v.length > 0 : typeof v === "string" && v.trim();
  }).length;
  const canGenerate = filledCount >= 10;

  function setAnswer(key: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }
  function toggleMulti(key: string, option: string) {
    const current = (answers[key] as string[]) || [];
    setAnswer(key, current.includes(option) ? current.filter((o) => o !== option) : [...current, option]);
  }

  async function handleGenerate() {
    setLoading(true); setError(""); setResult(null);
    try {
      const labeled: Record<string, string> = {};
      for (const cat of MISSION_CATEGORIES) {
        for (const q of cat.questions) {
          const v = answers[q.key];
          if (Array.isArray(v) && v.length > 0) labeled[`[${cat.title}] ${q.label}`] = v.join("、");
          else if (typeof v === "string" && v.trim()) labeled[`[${cat.title}] ${q.label}`] = v;
        }
      }
      const res = await fetch("/api/generate-mission", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers: labeled }) });
      if (!res.ok) throw new Error();
      const { result: r } = await res.json();
      setResult(r);
      setSelectedPattern(0);
      if (r.patterns?.[0]) setEditedText(formatPattern(r.patterns[0]));
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 300);
    } catch { setError("Generation failed. Please try again."); }
    finally { setLoading(false); }
  }

  function formatPattern(p: MissionPattern): string {
    return [`【MISSION】\n${p.mission}`, p.mission_supplement ? `\n${p.mission_supplement}` : "", `\n\n【SLOGAN】\n${p.slogan}`, `\n\n【WAY】\n${(p.ways || []).map((w, i) => `${i + 1}. ${w}`).join("\n")}`].join("");
  }
  function handleSelectPattern(idx: number) { setSelectedPattern(idx); if (result?.patterns?.[idx]) setEditedText(formatPattern(result.patterns[idx])); setEditing(false); }
  function handleComplete() { onComplete(editing ? editedText : formatPattern(result!.patterns[selectedPattern])); }

  return (
    <div style={{ background: DK.bg, minHeight: "100vh", margin: "-32px -16px", padding: "32px 16px" }}>
      <div className="max-w-lg mx-auto">
        {/* Back */}
        <button onClick={onBack} className="mb-8 text-xs flex items-center gap-1 py-2 tracking-widest uppercase"
          style={{ color: DK.textSub, background: "transparent", border: "none", cursor: "pointer", letterSpacing: "0.1em" }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Hero */}
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: DK.gold }}>Branding Tool</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2" style={{ color: DK.accent, lineHeight: 1.1 }}>
            MISSION<br /><span style={{ fontWeight: 300 }}>WAY</span>
          </h1>
          <p className="text-xs mt-4 mb-5" style={{ color: DK.textSub }}>
            {ALL_MISSION_QUESTIONS.length} questions to define your identity
          </p>
          <button onClick={() => setShowAbout(true)}
            className="text-xs tracking-widest uppercase px-6 py-2.5"
            style={{ color: DK.gold, background: "transparent", border: `1px solid ${DK.gold}`, borderRadius: 100, cursor: "pointer", fontWeight: 500, letterSpacing: "0.1em" }}>
            Why MISSION WAY?
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-10">
          <div className="flex-1 h-[2px] overflow-hidden" style={{ background: DK.border }}>
            <div className="h-full transition-all duration-500" style={{ width: `${(filledCount / ALL_MISSION_QUESTIONS.length) * 100}%`, background: DK.gold }} />
          </div>
          <span className="text-xs font-mono" style={{ color: DK.gold }}>{filledCount}/{ALL_MISSION_QUESTIONS.length}</span>
        </div>

        {/* Questions */}
        <div className="space-y-10 mb-12">
          {MISSION_CATEGORIES.map((cat) => {
            const catFilled = cat.questions.filter((q) => {
              const v = answers[q.key];
              return Array.isArray(v) ? v.length > 0 : typeof v === "string" && v.trim();
            }).length;

            return (
              <div key={cat.id}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-lg">{cat.icon}</span>
                  <h2 className="text-sm font-medium tracking-wide uppercase" style={{ color: DK.text }}>{cat.title}</h2>
                  <div className="flex-1 h-[1px]" style={{ background: DK.border }} />
                  <span className="text-xs font-mono" style={{ color: catFilled === cat.questions.length ? DK.gold : DK.textMuted }}>
                    {catFilled}/{cat.questions.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {cat.questions.map((q) => (
                    <div key={q.key} className="p-4" style={{ background: DK.surface, borderRadius: 12, border: `1px solid ${DK.border}` }}>
                      <p className="text-sm mb-3" style={{ color: DK.text, fontWeight: 500 }}>{q.label}</p>

                      {q.type === "text" && (
                        <textarea
                          className="w-full resize-y"
                          rows={2}
                          placeholder={q.placeholder}
                          value={(answers[q.key] as string) || ""}
                          onChange={(e) => setAnswer(q.key, e.target.value)}
                          style={{ background: DK.surfaceHigh, color: DK.text, border: `1px solid ${DK.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none" }}
                        />
                      )}

                      {q.type === "select" && q.options && (
                        <div className="flex flex-wrap gap-2">
                          {q.options.map((opt) => (
                            <button key={opt} type="button" onClick={() => setAnswer(q.key, opt)}
                              className="text-xs px-4 py-2 min-h-[36px] transition-all"
                              style={{
                                background: answers[q.key] === opt ? DK.accent : "transparent",
                                color: answers[q.key] === opt ? DK.bg : DK.textSub,
                                borderRadius: 100, border: `1px solid ${answers[q.key] === opt ? DK.accent : DK.border}`, cursor: "pointer", fontWeight: 500,
                              }}>{opt}</button>
                          ))}
                        </div>
                      )}

                      {q.type === "multi" && q.options && (
                        <div className="flex flex-wrap gap-2">
                          {q.options.map((opt) => {
                            const sel = ((answers[q.key] as string[]) || []).includes(opt);
                            return (
                              <button key={opt} type="button" onClick={() => toggleMulti(q.key, opt)}
                                className="text-xs px-4 py-2 min-h-[36px] transition-all"
                                style={{
                                  background: sel ? DK.accent : "transparent",
                                  color: sel ? DK.bg : DK.textSub,
                                  borderRadius: 100, border: `1px solid ${sel ? DK.accent : DK.border}`, cursor: "pointer", fontWeight: 500,
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
          <div className="mb-12 text-center">
            <button onClick={handleGenerate} disabled={!canGenerate || loading}
              className="px-10 py-4 text-sm tracking-widest uppercase transition-all"
              style={{
                background: canGenerate && !loading ? DK.accent : DK.surfaceBright,
                color: canGenerate && !loading ? DK.bg : DK.textMuted,
                borderRadius: 100, border: "none", cursor: canGenerate && !loading ? "pointer" : "default", fontWeight: 600, letterSpacing: "0.15em",
              }}>
              {loading ? "Generating..." : canGenerate ? "Generate 3 Patterns" : `${10 - filledCount} more to go`}
            </button>
            {!canGenerate && <p className="text-xs mt-3" style={{ color: DK.textMuted }}>Minimum 10 answers required</p>}
          </div>
        )}

        {error && <p className="text-sm text-center mb-6" style={{ color: "#e53935" }}>{error}</p>}

        {/* Results */}
        {result && result.patterns && (
          <div ref={resultRef} className="space-y-6 mb-12">
            {result.analysis && (
              <div className="flex items-start gap-3 px-2 mb-4">
                <img src="/ponko.png" alt="" className="w-6 h-6 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed" style={{ color: DK.textSub }}>{result.analysis}</p>
              </div>
            )}

            {/* Pattern tabs */}
            <div className="flex gap-2">
              {result.patterns.map((p, i) => (
                <button key={i} onClick={() => handleSelectPattern(i)}
                  className="flex-1 py-3 text-xs tracking-wider uppercase transition-all"
                  style={{
                    background: selectedPattern === i ? DK.accent : "transparent",
                    color: selectedPattern === i ? DK.bg : DK.textSub,
                    borderRadius: 8, border: `1px solid ${selectedPattern === i ? DK.accent : DK.border}`, cursor: "pointer", fontWeight: 600,
                  }}>{p.tone}</button>
              ))}
            </div>

            {/* Pattern display */}
            {!editing ? (() => {
              const p = result.patterns[selectedPattern];
              if (!p) return null;
              return (
                <div className="space-y-4">
                  <p className="text-xs px-1" style={{ color: DK.textMuted }}>{p.tone_description}</p>

                  {/* MISSION */}
                  <div className="p-6 sm:p-8 text-center" style={{ background: DK.surface, borderRadius: 16, border: `1px solid ${DK.border}` }}>
                    <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: DK.gold }}>Mission</p>
                    <p className="text-xl sm:text-2xl font-bold leading-snug mb-4" style={{ color: DK.accent }}>{p.mission}</p>
                    {p.mission_supplement && <p className="text-xs leading-relaxed" style={{ color: DK.textSub }}>{p.mission_supplement}</p>}
                  </div>

                  {/* SLOGAN */}
                  <div className="p-6 text-center" style={{ background: DK.goldSoft, borderRadius: 16, border: `1px solid rgba(212,168,83,0.3)` }}>
                    <p className="text-[10px] tracking-[0.4em] uppercase mb-3" style={{ color: DK.gold }}>Slogan</p>
                    <p className="text-lg sm:text-xl font-medium" style={{ color: DK.accent }}>{p.slogan}</p>
                  </div>

                  {/* WAY */}
                  <div className="p-6 sm:p-8" style={{ background: DK.surface, borderRadius: 16, border: `1px solid ${DK.border}` }}>
                    <p className="text-[10px] tracking-[0.4em] uppercase mb-6" style={{ color: DK.gold }}>Way</p>
                    <ol className="space-y-5">
                      {(p.ways || []).map((way, i) => (
                        <li key={i} className="flex items-start gap-4">
                          <span className="text-2xl font-bold shrink-0" style={{ color: DK.border, fontFamily: "Georgia, serif", lineHeight: 1 }}>
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <p className="text-sm leading-relaxed pt-1" style={{ color: DK.text }}>{way}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              );
            })() : (
              <div className="p-4" style={{ background: DK.surface, borderRadius: 12, border: `1px solid ${DK.border}` }}>
                <textarea className="w-full resize-y" rows={18} value={editedText} onChange={(e) => setEditedText(e.target.value)}
                  style={{ background: DK.surfaceHigh, color: DK.text, border: `1px solid ${DK.border}`, borderRadius: 8, padding: "12px 16px", fontSize: 14, outline: "none" }} />
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4">
              <button onClick={handleComplete}
                className="flex-1 py-3.5 text-xs tracking-widest uppercase"
                style={{ background: DK.accent, color: DK.bg, borderRadius: 100, border: "none", cursor: "pointer", fontWeight: 600, letterSpacing: "0.15em" }}>
                Apply
              </button>
              <button onClick={() => setEditing(!editing)}
                className="px-6 py-3.5 text-xs tracking-widest uppercase"
                style={{ background: "transparent", color: DK.textSub, borderRadius: 100, border: `1px solid ${DK.border}`, cursor: "pointer", fontWeight: 500 }}>
                {editing ? "Preview" : "Edit"}
              </button>
              <button onClick={() => { setResult(null); setEditing(false); }}
                className="px-6 py-3.5 text-xs tracking-widest uppercase"
                style={{ background: "transparent", color: DK.textSub, borderRadius: 100, border: `1px solid ${DK.border}`, cursor: "pointer", fontWeight: 500 }}>
                Retry
              </button>
            </div>
          </div>
        )}
      </div>
      <MissionAboutModal open={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  );
}
