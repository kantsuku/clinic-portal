"use client";

import { useState, useEffect } from "react";
import { saveMissionDraft, loadMissionDraft } from "@/lib/storage";
import RewriteButton from "./RewriteButton";

interface MissionBuilderProps {
  clinicId: string;
  onComplete: (result: string) => void;
  onBack: () => void;
}

const STEPS = [
  {
    id: "mission",
    title: "MISSION",
    subtitle: "未来への一文",
    description: "「私たちは何を提供します」ではなく、どんな未来をつくりたいかを一文で表現してください。",
    tips: [
      "主語は「私たち」よりも「未来」に置く",
      "一文で終わらせる（長文にしない）",
      "その下に補足を2〜3行だけ",
    ],
    examples: [
      { label: "予防型", text: "10年後に困らない口をつくる。" },
      { label: "安心型", text: "「歯医者が怖い」をなくす。" },
      { label: "地域密着型", text: "この街の歯の健康を、生涯にわたって守る。" },
      { label: "審美型", text: "笑顔に自信を取り戻す。" },
    ],
    placeholder: "例：10年後に困らない口をつくる。",
    failTip: "「自社紹介」になりがち。MISSIONは「自分たちの説明」ではなく「社会や未来の話」にしてください。",
  },
  {
    id: "slogan",
    title: "スローガン",
    subtitle: "感情担当の一行",
    description: "論理ではなく、共感をつくる言葉です。MISSIONが「思想」なら、スローガンは「感情」。",
    tips: [
      "短く、覚えやすく",
      "多少ポエムでもOK",
      "目的は「伝わること」",
    ],
    examples: [
      { label: "予防型", text: "未来の歯を、今日守る。" },
      { label: "安心型", text: "あなたのペースで、安心を。" },
      { label: "家族型", text: "家族みんなの「かかりつけ」へ。" },
      { label: "丁寧型", text: "ひとり、ひとりに、まっすぐ。" },
    ],
    placeholder: "例：未来の歯を、今日守る。",
    failTip: null,
  },
  {
    id: "way",
    title: "WAY",
    subtitle: "現場ルール",
    description: "精神論ではなく、行動のルール。現場で迷ったとき立ち返れるように、すべて動詞で始めてください。",
    tips: [
      "抽象語を避ける（「誠実に」だけでは弱い）",
      "3〜5個に絞る",
      "すべて動詞で始める",
    ],
    examples: [
      { label: "説明重視", text: "治療より先に、必ず丁寧な説明を行います。" },
      { label: "保存重視", text: "削る・抜く前に、本当に必要かを必ず検討します。" },
      { label: "長期視点", text: "短期ではなく、5〜10年先を見据えた治療計画を立てます。" },
      { label: "生活配慮", text: "患者さまの生活背景を踏まえて提案します。" },
    ],
    placeholder: "1つずつ改行で入力してください",
    failTip: "「誠実に対応します」だけだと行動が変わりません。具体的なルールに落としてください。",
  },
];

export default function MissionBuilder({ clinicId, onComplete, onBack }: MissionBuilderProps) {
  const [step, setStep] = useState(0);
  const [mission, setMission] = useState("");
  const [supplement, setSupplement] = useState("");
  const [slogan, setSlogan] = useState("");
  const [ways, setWays] = useState("");

  // 起動時に保存データを復元
  useEffect(() => {
    const saved = loadMissionDraft(clinicId);
    if (saved) {
      setMission(saved.mission);
      setSupplement(saved.supplement);
      setSlogan(saved.slogan);
      setWays(saved.ways);
    }
  }, [clinicId]);

  // 入力変更のたびに保存
  useEffect(() => {
    saveMissionDraft(clinicId, { mission, supplement, slogan, ways });
  }, [mission, supplement, slogan, ways, clinicId]);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  function getValue() {
    if (step === 0) return mission;
    if (step === 1) return slogan;
    return ways;
  }

  function setValue(val: string) {
    if (step === 0) setMission(val);
    else if (step === 1) setSlogan(val);
    else setWays(val);
  }

  function handleComplete() {
    const missionFull = supplement ? `${mission}\n\n${supplement}` : mission;
    const result = `【MISSION】\n${missionFull}\n\n【スローガン】\n${slogan}\n\n【WAY】\n${ways}`;
    onComplete(result);
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Back */}
      <button
        onClick={onBack}
        className="mb-4 text-sm flex items-center gap-1 py-2 px-1"
        style={{ color: "var(--md-primary)", background: "transparent", border: "none", cursor: "pointer", fontWeight: 500 }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        一覧に戻る
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-5 p-5" style={{ background: "var(--md-surface-container)", borderRadius: "var(--md-shape-corner-xl)", boxShadow: "var(--md-elevation-1)" }}>
        <img src="/ponko.png" alt="ぽん子" className="w-12 h-12 ponko-jump" />
        <div>
          <h2 className="text-lg font-medium" style={{ color: "var(--md-on-surface)" }}>診療理念ツクール</h2>
          <p className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>MISSION → スローガン → WAY</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1 mb-5">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex-1">
            <div className="h-1.5 rounded-full" style={{ background: i <= step ? "var(--md-primary)" : "var(--md-outline-variant)", transition: "background 0.3s" }} />
            <p className="text-[11px] mt-1 text-center font-medium" style={{ color: i === step ? "var(--md-primary)" : "var(--md-on-surface-variant)" }}>{s.title}</p>
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="p-4 sm:p-5 mb-4" style={{ background: "var(--md-primary-container)", borderRadius: "var(--md-shape-corner-lg)" }}>
        <p className="text-sm font-medium mb-1" style={{ color: "var(--md-primary)" }}>{current.title} — {current.subtitle}</p>
        <p className="text-xs leading-relaxed" style={{ color: "var(--md-on-primary-container)" }}>{current.description}</p>
      </div>

      {/* Tips */}
      <div className="p-4 sm:p-5 mb-4" style={{ background: "var(--md-surface-container)", borderRadius: "var(--md-shape-corner-lg)", boxShadow: "var(--md-elevation-1)" }}>
        <p className="text-xs font-medium mb-2" style={{ color: "var(--md-on-surface-variant)" }}>ポイント</p>
        <ul className="space-y-1">
          {current.tips.map((tip, i) => (
            <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: "var(--md-on-surface)" }}>
              <span style={{ color: "var(--md-primary)" }}>-</span>{tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Examples */}
      <div className="p-4 sm:p-5 mb-4" style={{ background: "var(--md-surface-container)", borderRadius: "var(--md-shape-corner-lg)", boxShadow: "var(--md-elevation-1)" }}>
        <p className="text-xs font-medium mb-2" style={{ color: "var(--md-on-surface-variant)" }}>例文（タップで挿入）</p>
        <div className="flex flex-wrap gap-1.5">
          {current.examples.map((ex, i) => (
            <button key={i} type="button" onClick={() => setValue(ex.text)}
              className="text-xs font-medium px-3 py-1.5 transition-colors"
              style={{ background: "var(--md-surface-container-low)", color: "var(--md-primary)", borderRadius: "100px", border: "1px solid var(--md-outline)", cursor: "pointer" }}
            >{ex.label}</button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 sm:p-5 mb-4" style={{ background: "var(--md-surface-container)", borderRadius: "var(--md-shape-corner-lg)", boxShadow: "var(--md-elevation-1)" }}>
        <textarea className="w-full resize-y" rows={step === 2 ? 8 : 3} placeholder={current.placeholder} value={getValue()} onChange={(e) => setValue(e.target.value)} />

        {step === 0 && mission && (
          <div className="mt-3">
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--md-on-surface-variant)" }}>補足（2〜3行）</label>
            <textarea className="w-full resize-y" rows={3} placeholder="その場しのぎの治療ではなく..." value={supplement} onChange={(e) => setSupplement(e.target.value)} />
          </div>
        )}

        {getValue().length > 10 && (
          <RewriteButton text={getValue()} title={current.title} onRewrite={setValue} />
        )}
      </div>

      {/* Fail tip */}
      {current.failTip && (
        <div className="p-3 mb-4" style={{ background: "var(--md-error-container)", borderRadius: "var(--md-shape-corner-md)" }}>
          <p className="text-xs font-medium mb-1" style={{ color: "var(--md-error)" }}>よくある失敗</p>
          <p className="text-[11px]" style={{ color: "var(--md-on-surface)" }}>{current.failTip}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-2">
        {step > 0 && (
          <button onClick={() => { setStep((s) => s - 1); window.scrollTo(0, 0); }}
            className="px-6 py-3 text-sm font-medium min-h-[48px]"
            style={{ background: "var(--md-surface-container)", color: "var(--md-on-surface-variant)", borderRadius: "100px", border: "1px solid var(--md-outline-variant)", cursor: "pointer" }}
          >戻る</button>
        )}
        {isLast ? (
          <button onClick={handleComplete} disabled={!mission || !slogan || !ways}
            className="flex-1 py-3 text-sm font-medium min-h-[48px]"
            style={{
              background: mission && slogan && ways ? "var(--md-tertiary)" : "var(--md-surface-container-high)",
              color: mission && slogan && ways ? "var(--md-on-primary)" : "var(--md-on-surface-variant)",
              borderRadius: "100px", border: "none", cursor: mission && slogan && ways ? "pointer" : "default",
            }}
          >理念を完成させる！</button>
        ) : (
          <button onClick={() => { setStep((s) => s + 1); window.scrollTo(0, 0); }} disabled={!getValue()}
            className="flex-1 py-3 text-sm font-medium min-h-[48px]"
            style={{
              background: getValue() ? "var(--md-primary)" : "var(--md-surface-container-high)",
              color: getValue() ? "var(--md-on-primary)" : "var(--md-on-surface-variant)",
              borderRadius: "100px", border: "none", cursor: getValue() ? "pointer" : "default",
            }}
          >次へ</button>
        )}
      </div>
    </div>
  );
}
