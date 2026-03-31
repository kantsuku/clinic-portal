"use client";

import { useState, useEffect } from "react";
import { saveMissionDraft, loadMissionDraft } from "@/lib/storage";

interface MissionBuilderProps {
  clinicId: string;
  onComplete: (result: string) => void;
  onBack: () => void;
}

const QUESTIONS = [
  { key: "ideal", label: "どんな医院にしたいですか？", hint: "一番大事にしたいこと、理想の医院像を教えてください", placeholder: "例：患者さんが「ここに来てよかった」と思える場所にしたい" },
  { key: "patient_outcome", label: "患者さんにどうなってほしいですか？", hint: "治療後だけでなく、人生全体で", placeholder: "例：歯のことで不安を感じない人生を送ってほしい" },
  { key: "never_do", label: "絶対にやらないと決めていることは？", hint: "これだけは譲れない、という判断軸", placeholder: "例：患者さんが納得していないまま治療を始めること" },
  { key: "origin", label: "なぜ歯科医師になったのですか？", hint: "きっかけや原体験があれば", placeholder: "例：子どもの頃に歯医者で怖い思いをして、自分がそれを変えたいと思った" },
  { key: "differentiator", label: "他の医院と一番違うと思うところは？", hint: "自分の医院だけの強み", placeholder: "例：治療前のカウンセリングに30分かけること" },
  { key: "staff_message", label: "スタッフにいつも伝えていることは？", hint: "チームの行動指針になっている言葉", placeholder: "例：患者さんの名前を覚えること" },
  { key: "future_vision", label: "5年後、10年後の理想の医院像は？", hint: "この先どうなりたいか", placeholder: "例：この地域で「歯のことならあそこ」と思われる存在になりたい" },
];

interface GeneratedMission {
  mission: string;
  mission_supplement: string;
  slogan: string;
  ways: string[];
  reasoning: string;
}

export default function MissionBuilder({ clinicId, onComplete, onBack }: MissionBuilderProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const saved = loadMissionDraft(clinicId);
    if (saved) {
      // 旧形式からの移行対応
      const initial: Record<string, string> = {};
      for (const q of QUESTIONS) initial[q.key] = "";
      return { ...initial, ...saved };
    }
    const initial: Record<string, string> = {};
    for (const q of QUESTIONS) initial[q.key] = "";
    return initial;
  });
  const [generated, setGenerated] = useState<GeneratedMission | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [editedResult, setEditedResult] = useState("");

  // 自動保存
  useEffect(() => {
    saveMissionDraft(clinicId, answers as Record<string, string> & { mission: string; supplement: string; slogan: string; ways: string });
  }, [answers, clinicId]);

  const filledCount = QUESTIONS.filter((q) => answers[q.key]?.trim()).length;
  const canGenerate = filledCount >= 3;

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setGenerated(null);

    try {
      const labeledAnswers: Record<string, string> = {};
      for (const q of QUESTIONS) {
        if (answers[q.key]?.trim()) labeledAnswers[q.label] = answers[q.key];
      }

      const res = await fetch("/api/generate-mission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: labeledAnswers }),
      });

      if (!res.ok) throw new Error();
      const { result } = await res.json();
      setGenerated(result);

      // 編集用テキスト
      const text = [
        `【MISSION】\n${result.mission}`,
        result.mission_supplement ? `\n${result.mission_supplement}` : "",
        `\n\n【スローガン】\n${result.slogan}`,
        `\n\n【WAY】\n${(result.ways || []).map((w: string, i: number) => `${i + 1}. ${w}`).join("\n")}`,
      ].join("");
      setEditedResult(text);
    } catch {
      setError("生成に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  function handleComplete() {
    onComplete(editing ? editedResult : formatResult());
  }

  function formatResult(): string {
    if (!generated) return "";
    return [
      `【MISSION】\n${generated.mission}`,
      generated.mission_supplement ? `\n${generated.mission_supplement}` : "",
      `\n\n【スローガン】\n${generated.slogan}`,
      `\n\n【WAY】\n${(generated.ways || []).map((w, i) => `${i + 1}. ${w}`).join("\n")}`,
    ].join("");
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Back */}
      <button onClick={onBack} className="mb-4 text-sm flex items-center gap-1 py-2 px-1"
        style={{ color: "var(--md-primary)", background: "transparent", border: "none", cursor: "pointer", fontWeight: 500 }}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        一覧に戻る
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-2 p-5" style={{ background: "var(--md-surface-container)", borderRadius: "var(--md-shape-corner-xl)", boxShadow: "var(--md-elevation-1)" }}>
        <img src="/ponko.png" alt="ぽん子" className="w-12 h-12 ponko-jump" />
        <div>
          <h2 className="text-lg font-medium" style={{ color: "var(--md-on-surface)" }}>診療理念ツクール</h2>
          <p className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
            先生の想いをヒアリングして、MISSION・スローガン・WAYを作ります
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-5 px-1">
        <div className="flex-1 h-1.5 overflow-hidden" style={{ background: "var(--md-outline-variant)", borderRadius: "100px" }}>
          <div className="h-full transition-all duration-300" style={{ width: `${(filledCount / QUESTIONS.length) * 100}%`, background: "var(--md-primary)", borderRadius: "100px" }} />
        </div>
        <span className="text-xs font-medium" style={{ color: "var(--md-on-surface-variant)" }}>{filledCount}/{QUESTIONS.length}</span>
      </div>

      {/* Questions */}
      <div className="space-y-3 mb-6">
        {QUESTIONS.map((q) => (
          <div key={q.key} className="p-4 sm:p-5" style={{ background: "var(--md-surface-container)", borderRadius: "var(--md-shape-corner-lg)", boxShadow: "var(--md-elevation-1)" }}>
            <div className="flex items-start gap-2 mb-2">
              <img src="/ponko.png" alt="" className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--md-on-surface)" }}>{q.label}</p>
                <p className="text-[11px]" style={{ color: "var(--md-on-surface-variant)" }}>{q.hint}</p>
              </div>
            </div>
            <textarea
              className="w-full resize-y"
              rows={3}
              placeholder={q.placeholder}
              value={answers[q.key]}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [q.key]: e.target.value }))}
            />
          </div>
        ))}
      </div>

      {/* Generate button */}
      {!generated && (
        <div className="mb-6">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || loading}
            className="w-full py-3 text-sm font-medium min-h-[48px] flex items-center justify-center gap-2"
            style={{
              background: canGenerate && !loading ? "var(--md-primary)" : "var(--md-surface-container-high)",
              color: canGenerate && !loading ? "var(--md-on-primary)" : "var(--md-on-surface-variant)",
              borderRadius: "100px",
              border: "none",
              cursor: canGenerate && !loading ? "pointer" : "default",
            }}
          >
            {loading ? (
              <>
                <img src="/ponko.png" alt="" className="w-5 h-5 ponko-jump" />
                ぽん子が理念を考えています...
              </>
            ) : (
              <>
                <img src="/ponko.png" alt="" className="w-5 h-5" />
                理念を生成する（{filledCount >= 3 ? "準備OK" : `あと${3 - filledCount}項目`}）
              </>
            )}
          </button>
          {!canGenerate && (
            <p className="text-[11px] text-center mt-1.5" style={{ color: "var(--md-on-surface-variant)" }}>
              最低3項目の入力で生成できます
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-center mb-4" style={{ color: "var(--md-error)" }}>{error}</p>
      )}

      {/* Generated result */}
      {generated && (
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <img src="/ponko.png" alt="" className="w-6 h-6" />
            <p className="text-sm font-medium" style={{ color: "var(--md-primary)" }}>
              先生の想いから理念を作りました！
            </p>
          </div>

          {!editing ? (
            <>
              {/* MISSION */}
              <div className="p-4" style={{ background: "var(--md-primary-container)", borderRadius: "var(--md-shape-corner-lg)" }}>
                <p className="text-xs font-medium mb-1" style={{ color: "var(--md-primary)" }}>MISSION</p>
                <p className="text-base font-medium leading-relaxed" style={{ color: "var(--md-on-primary-container)" }}>
                  {generated.mission}
                </p>
                {generated.mission_supplement && (
                  <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--md-on-primary-container)" }}>
                    {generated.mission_supplement}
                  </p>
                )}
              </div>

              {/* Slogan */}
              <div className="p-4 text-center" style={{ background: "var(--md-tertiary-container)", borderRadius: "var(--md-shape-corner-lg)" }}>
                <p className="text-xs font-medium mb-1" style={{ color: "var(--md-tertiary)" }}>スローガン</p>
                <p className="text-lg font-medium" style={{ color: "var(--md-on-surface)" }}>
                  {generated.slogan}
                </p>
              </div>

              {/* WAY */}
              <div className="p-4" style={{ background: "var(--md-surface-container)", borderRadius: "var(--md-shape-corner-lg)", boxShadow: "var(--md-elevation-1)" }}>
                <p className="text-xs font-medium mb-2" style={{ color: "var(--md-on-surface-variant)" }}>WAY（行動指針）</p>
                <ol className="space-y-2">
                  {(generated.ways || []).map((way, i) => (
                    <li key={i} className="text-sm flex items-start gap-2" style={{ color: "var(--md-on-surface)" }}>
                      <span className="text-xs font-bold shrink-0 mt-0.5 w-5 h-5 flex items-center justify-center" style={{ background: "var(--md-primary-container)", color: "var(--md-primary)", borderRadius: "100%" }}>
                        {i + 1}
                      </span>
                      {way}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Reasoning */}
              {generated.reasoning && (
                <div className="flex items-start gap-2 px-2">
                  <img src="/ponko.png" alt="" className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed" style={{ color: "var(--md-on-surface-variant)" }}>
                    {generated.reasoning}
                  </p>
                </div>
              )}
            </>
          ) : (
            /* 編集モード */
            <div className="p-4 sm:p-5" style={{ background: "var(--md-surface-container)", borderRadius: "var(--md-shape-corner-lg)", boxShadow: "var(--md-elevation-1)" }}>
              <p className="text-xs font-medium mb-2" style={{ color: "var(--md-on-surface-variant)" }}>
                自由に編集してください
              </p>
              <textarea
                className="w-full resize-y"
                rows={15}
                value={editedResult}
                onChange={(e) => setEditedResult(e.target.value)}
              />
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
              {editing ? "プレビュー" : "編集する"}
            </button>
            <button onClick={() => { setGenerated(null); setEditing(false); }} className="px-4 py-3 text-sm font-medium min-h-[48px]"
              style={{ background: "transparent", color: "var(--md-on-surface-variant)", borderRadius: "100px", border: "1px solid var(--md-outline-variant)", cursor: "pointer" }}>
              再生成
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
