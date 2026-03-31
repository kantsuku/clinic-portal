"use client";

import { useState, useEffect } from "react";
import { saveMissionDraft, loadMissionDraft } from "@/lib/storage";

interface MissionBuilderProps {
  clinicId: string;
  onComplete: (result: string) => void;
  onBack: () => void;
}

interface QuestionCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  questions: { key: string; label: string; placeholder: string }[];
}

const CATEGORIES: QuestionCategory[] = [
  {
    id: "why", title: "原点・動機", icon: "🌱", color: "var(--md-tertiary)",
    questions: [
      { key: "why_1", label: "なぜ歯科医師になったのですか？", placeholder: "きっかけや原体験を教えてください" },
      { key: "why_2", label: "勤務医時代に「自分ならこうする」と思ったことは？", placeholder: "前職への不満ではなく、自分の理想を" },
      { key: "why_3", label: "開業を決意した瞬間のことを教えてください", placeholder: "何がきっかけで「自分の医院を持とう」と思ったか" },
      { key: "why_4", label: "歯科医師として一番悔しかった経験は？", placeholder: "その悔しさが今の診療にどう影響しているか" },
      { key: "why_5", label: "歯科医師として一番嬉しかった経験は？", placeholder: "この瞬間のために歯科医師をやっていると思えること" },
    ],
  },
  {
    id: "who", title: "患者像・理想の関係", icon: "👥", color: "var(--md-primary)",
    questions: [
      { key: "who_1", label: "理想の患者さん像は？", placeholder: "年齢・家族構成・悩み・来院動機など" },
      { key: "who_2", label: "「この患者さんのためにこの医院がある」と思える人は？", placeholder: "具体的な人物像を1人思い浮かべてください" },
      { key: "who_3", label: "患者さんとの理想の距離感は？", placeholder: "友人のような関係？プロと依頼者？家族のような？" },
      { key: "who_4", label: "患者さんに「うちに来てよかった」と思ってもらえる瞬間は？", placeholder: "どんな場面でそう感じてほしいか" },
      { key: "who_5", label: "逆に「うちに合わない」と感じる患者さんのタイプは？", placeholder: "これを明確にすることで理想の患者像がクリアになります" },
    ],
  },
  {
    id: "what", title: "提供価値・こだわり", icon: "💎", color: "var(--md-primary)",
    questions: [
      { key: "what_1", label: "他の医院と同じ治療をしても「うちは違う」と思える部分は？", placeholder: "同じ虫歯治療でも、うちならではの違いがあるはず" },
      { key: "what_2", label: "治療の質以外で患者さんに提供したい価値は？", placeholder: "安心感？教育？人生の質の向上？" },
      { key: "what_3", label: "「これだけは譲れない」品質基準は？", placeholder: "効率や売上より優先するもの" },
      { key: "what_4", label: "保険診療と自費診療、どちらに力を入れたい？その理由は？", placeholder: "経営的な話ではなく、理念として" },
    ],
  },
  {
    id: "how", title: "方法論・独自性", icon: "🔧", color: "var(--md-primary)",
    questions: [
      { key: "how_1", label: "カウンセリングで一番大事にしていることは？", placeholder: "何を聞く？何を伝える？どう進める？" },
      { key: "how_2", label: "治療計画を立てるとき、最優先にすることは？", placeholder: "患者の希望？医学的正解？コスト？長期視点？" },
      { key: "how_3", label: "新しい技術や機器の導入基準は？", placeholder: "何を基準に「これは導入する」と判断するか" },
      { key: "how_4", label: "他の医院がやっていなくてうちがやっていることは？", placeholder: "小さなことでもOK" },
    ],
  },
  {
    id: "where", title: "ビジョン・未来", icon: "🔭", color: "var(--md-tertiary)",
    questions: [
      { key: "where_1", label: "5年後、医院はどうなっていたい？", placeholder: "規模？評判？診療内容？地域での立ち位置？" },
      { key: "where_2", label: "10年後、先生個人としてどうなっていたい？", placeholder: "医院だけでなく、人生として" },
      { key: "where_3", label: "この地域にどんな影響を与えたい？", placeholder: "地域社会における医院の役割" },
      { key: "where_4", label: "「成功した」と思える状態を具体的に教えてください", placeholder: "数字ではなく、状態や感情として" },
    ],
  },
  {
    id: "not", title: "判断基準・やらないこと", icon: "🚫", color: "var(--md-error)",
    questions: [
      { key: "not_1", label: "患者さんに絶対にしないことは？", placeholder: "どんな状況でも譲れない一線" },
      { key: "not_2", label: "売上のためにやりたくないことは？", placeholder: "経営と理念のぶつかるライン" },
      { key: "not_3", label: "他の医院がやっていて「自分はやらない」と決めていることは？", placeholder: "意識的にやらない判断" },
      { key: "not_4", label: "2つの正しさがぶつかったら、どちらを優先する？", placeholder: "例：患者の希望 vs 医学的正解 / 短期の安さ vs 長期の質" },
    ],
  },
  {
    id: "emotion", title: "感情・葛藤", icon: "💭", color: "var(--md-on-surface-variant)",
    questions: [
      { key: "emo_1", label: "開院してから一番大変だったことは？", placeholder: "どう乗り越えたかも教えてください" },
      { key: "emo_2", label: "診療中に一番緊張する瞬間は？", placeholder: "その緊張とどう向き合っているか" },
      { key: "emo_3", label: "一日の終わりに「今日は良い一日だった」と思える基準は？", placeholder: "何があれば良い一日？" },
    ],
  },
  {
    id: "culture", title: "チーム・組織文化", icon: "🤝", color: "var(--md-primary)",
    questions: [
      { key: "cul_1", label: "スタッフに一番伝えたいことは？", placeholder: "毎日の行動に影響する言葉" },
      { key: "cul_2", label: "採用で一番重視するポイントは？", placeholder: "スキル？人柄？価値観？" },
      { key: "cul_3", label: "チームとしての理想の状態は？", placeholder: "どんなチームでありたいか" },
    ],
  },
];

const ALL_QUESTIONS = CATEGORIES.flatMap((c) => c.questions);

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
    const initial: Record<string, string> = {};
    for (const q of ALL_QUESTIONS) initial[q.key] = "";
    if (saved) return { ...initial, ...saved };
    return initial;
  });
  const [generated, setGenerated] = useState<GeneratedMission | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [editedResult, setEditedResult] = useState("");

  useEffect(() => {
    saveMissionDraft(clinicId, answers as any);
  }, [answers, clinicId]);

  const filledCount = ALL_QUESTIONS.filter((q) => answers[q.key]?.trim()).length;
  const totalCount = ALL_QUESTIONS.length;
  const canGenerate = filledCount >= 8;

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setGenerated(null);
    try {
      const labeledAnswers: Record<string, string> = {};
      for (const cat of CATEGORIES) {
        for (const q of cat.questions) {
          if (answers[q.key]?.trim()) {
            labeledAnswers[`[${cat.title}] ${q.label}`] = answers[q.key];
          }
        }
      }
      const res = await fetch("/api/generate-mission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: labeledAnswers }),
      });
      if (!res.ok) throw new Error();
      const { result } = await res.json();
      setGenerated(result);
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
              先生の想いを深く掘り下げて、世界に1つだけの理念を作ります
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 overflow-hidden" style={{ background: "rgba(255,255,255,0.3)", borderRadius: "100px" }}>
            <div className="h-full transition-all duration-300" style={{ width: `${(filledCount / totalCount) * 100}%`, background: "var(--md-primary)", borderRadius: "100px" }} />
          </div>
          <span className="text-xs font-medium" style={{ color: "var(--md-on-primary-container)" }}>{filledCount}/{totalCount}</span>
        </div>
      </div>

      {/* Questions by category */}
      <div className="space-y-4 mb-6">
        {CATEGORIES.map((cat) => {
          const catFilled = cat.questions.filter((q) => answers[q.key]?.trim()).length;
          return (
            <div key={cat.id}>
              {/* Category header */}
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="text-lg">{cat.icon}</span>
                <p className="text-sm font-medium" style={{ color: "var(--md-on-surface)" }}>{cat.title}</p>
                <span className="text-[11px] px-2 py-0.5" style={{ background: catFilled === cat.questions.length ? "var(--md-tertiary-container)" : "var(--md-surface-container-low)", color: catFilled === cat.questions.length ? "var(--md-tertiary)" : "var(--md-on-surface-variant)", borderRadius: "100px" }}>
                  {catFilled}/{cat.questions.length}
                </span>
              </div>

              {/* Questions */}
              <div className="space-y-2">
                {cat.questions.map((q) => (
                  <div key={q.key} className="p-4" style={{ background: "var(--md-surface-container)", borderRadius: "var(--md-shape-corner-md)", boxShadow: "var(--md-elevation-1)" }}>
                    <p className="text-sm font-medium mb-1" style={{ color: "var(--md-on-surface)" }}>{q.label}</p>
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
            </div>
          );
        })}
      </div>

      {/* Generate */}
      {!generated && (
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
              <><img src="/ponko.png" alt="" className="w-5 h-5" />理念を生成する（{canGenerate ? "準備OK" : `あと${8 - filledCount}項目`}）</>
            )}
          </button>
          {!canGenerate && <p className="text-[11px] text-center mt-1.5" style={{ color: "var(--md-on-surface-variant)" }}>最低8項目の入力で生成できます（多いほど精度が上がります）</p>}
        </div>
      )}

      {error && <p className="text-sm text-center mb-4" style={{ color: "var(--md-error)" }}>{error}</p>}

      {/* Result */}
      {generated && (
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <img src="/ponko.png" alt="" className="w-6 h-6" />
            <p className="text-sm font-medium" style={{ color: "var(--md-primary)" }}>先生だけの理念ができました！</p>
          </div>

          {!editing ? (
            <>
              <div className="p-5" style={{ background: "var(--md-primary-container)", borderRadius: "var(--md-shape-corner-xl)" }}>
                <p className="text-xs font-medium mb-2" style={{ color: "var(--md-primary)" }}>MISSION</p>
                <p className="text-lg font-medium leading-relaxed" style={{ color: "var(--md-on-primary-container)" }}>{generated.mission}</p>
                {generated.mission_supplement && <p className="text-xs mt-3 leading-relaxed" style={{ color: "var(--md-on-primary-container)" }}>{generated.mission_supplement}</p>}
              </div>

              <div className="p-5 text-center" style={{ background: "var(--md-tertiary-container)", borderRadius: "var(--md-shape-corner-xl)" }}>
                <p className="text-xs font-medium mb-2" style={{ color: "var(--md-tertiary)" }}>スローガン</p>
                <p className="text-xl font-medium" style={{ color: "var(--md-on-surface)" }}>{generated.slogan}</p>
              </div>

              <div className="p-5" style={{ background: "var(--md-surface-container)", borderRadius: "var(--md-shape-corner-xl)", boxShadow: "var(--md-elevation-1)" }}>
                <p className="text-xs font-medium mb-3" style={{ color: "var(--md-on-surface-variant)" }}>WAY（行動指針）</p>
                <ol className="space-y-3">
                  {(generated.ways || []).map((way, i) => (
                    <li key={i} className="text-sm flex items-start gap-3" style={{ color: "var(--md-on-surface)" }}>
                      <span className="text-xs font-bold shrink-0 w-6 h-6 flex items-center justify-center" style={{ background: "var(--md-primary-container)", color: "var(--md-primary)", borderRadius: "100%" }}>{i + 1}</span>
                      <span className="pt-0.5">{way}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {generated.reasoning && (
                <div className="flex items-start gap-2 px-2">
                  <img src="/ponko.png" alt="" className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed" style={{ color: "var(--md-on-surface-variant)" }}>{generated.reasoning}</p>
                </div>
              )}
            </>
          ) : (
            <div className="p-4 sm:p-5" style={{ background: "var(--md-surface-container)", borderRadius: "var(--md-shape-corner-lg)", boxShadow: "var(--md-elevation-1)" }}>
              <p className="text-xs font-medium mb-2" style={{ color: "var(--md-on-surface-variant)" }}>自由に編集してください</p>
              <textarea className="w-full resize-y" rows={18} value={editedResult} onChange={(e) => setEditedResult(e.target.value)} />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button onClick={handleComplete} className="flex-1 py-3 text-sm font-medium min-h-[48px]"
              style={{ background: "var(--md-primary)", color: "var(--md-on-primary)", borderRadius: "100px", border: "none", cursor: "pointer" }}>
              この理念を使う
            </button>
            <button onClick={() => setEditing(!editing)} className="px-4 py-3 text-sm font-medium min-h-[48px]"
              style={{ background: "var(--md-surface-container)", color: "var(--md-on-surface-variant)", borderRadius: "100px", border: "1px solid var(--md-outline-variant)", cursor: "pointer" }}>
              {editing ? "プレビュー" : "編集"}
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
