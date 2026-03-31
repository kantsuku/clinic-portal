"use client";

const DK = {
  bg: "#0a0a0a",
  surface: "#141414",
  surfaceHigh: "#1e1e1e",
  border: "#333",
  text: "#f5f5f5",
  textSub: "#888",
  textMuted: "#555",
  accent: "#fff",
  gold: "#d4a853",
  goldSoft: "rgba(212,168,83,0.15)",
};

interface MissionAboutModalProps {
  open: boolean;
  onClose: () => void;
}

export default function MissionAboutModal({ open, onClose }: MissionAboutModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.7)" }} />
      <div
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto mx-2 sm:mx-4"
        style={{ background: DK.surface, borderRadius: "20px 20px 0 0", border: `1px solid ${DK.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-8 h-1 rounded-full" style={{ background: DK.border }} />
        </div>

        <div className="px-5 sm:px-8 pb-10 pt-4">
          {/* Header */}
          <p className="text-[10px] tracking-[0.4em] uppercase mb-2" style={{ color: DK.gold }}>About</p>
          <h2 className="text-2xl font-bold mb-8" style={{ color: DK.accent }}>
            理念とは何か
          </h2>

          <div className="space-y-10" style={{ color: DK.text }}>
            {/* Section 1 */}
            <section>
              <h3 className="text-sm font-bold tracking-wide uppercase mb-4" style={{ color: DK.gold }}>
                歯科医院の理念事情
              </h3>
              <div className="space-y-4 text-sm leading-relaxed" style={{ color: DK.textSub }}>
                <p>
                  歯科医院では「診療理念」を掲げる場合が一般的ですが、それでは十分とは言えません。
                  診療理念とはあくまで診療に対する思想であり、<strong style={{ color: DK.text }}>経営や未来のビジョン、スタッフに対しての思想が欠けています。</strong>
                </p>
                <p>
                  また「クレド」と呼ばれるスタッフの行動指針を採用される場合も見かけます。
                  これも理念として不十分です。行動指針は普段の行動に具体的な規則を設けるもの（「ありがとう」を徹底する、など）であり、理念からすると枝葉の要素になります。
                </p>
                <div className="p-4" style={{ background: DK.goldSoft, borderRadius: 12 }}>
                  <p className="text-sm font-medium" style={{ color: DK.gold }}>
                    理念を正しく定義し、経営機能として意識的に活用している事例は多くないと感じます。
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h3 className="text-sm font-bold tracking-wide uppercase mb-4" style={{ color: DK.gold }}>
                理念とは経営の根幹施策
              </h3>
              <div className="space-y-4 text-sm leading-relaxed" style={{ color: DK.textSub }}>
                <p>
                  理念設計は医院の哲学でもありますが、経営者の気持ちや想いをきれいな言葉にして掲げるだけのものではありません。
                  <strong style={{ color: DK.text }}>医院経営におけるあらゆる判断や行動の基準をつくり、組織を正しい方向へ導くための重要な機能</strong>です。
                </p>
                <p style={{ color: DK.textMuted }}>
                  今風に例えるなら、組織のためのAIプロンプトといったところです。
                </p>
                <div className="p-4 space-y-2" style={{ background: DK.surfaceHigh, borderRadius: 12, border: `1px solid ${DK.border}` }}>
                  {[
                    "スタッフ全員が同じ方向を向きやすくなる",
                    "日々の判断や取り組みの基準が統一される",
                    "採用・教育・マーケティングに一貫性が生まれる",
                    "医院の世界観やブランド価値が育ちやすくなる",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span style={{ color: DK.gold }}>-</span>
                      <p className="text-sm" style={{ color: DK.text }}>{item}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm font-medium" style={{ color: DK.accent }}>
                  理念は「掲示する言葉」ではなく、行動を生み成果につながる実践的な仕組みとして設計することが大切です。
                </p>
              </div>
            </section>

            {/* Section 3 — Examples */}
            <section>
              <h3 className="text-sm font-bold tracking-wide uppercase mb-4" style={{ color: DK.gold }}>
                理念が運用されている企業の例
              </h3>
              <div className="space-y-4">
                {[
                  { company: "Google", program: "20%ルール", desc: "勤務時間の20%を自由な研究に使える。GmailやGoogleニュースはここから生まれた。" },
                  { company: "Netflix", program: "完全自由休暇制度", desc: "成果が出ていれば休み方は完全に個人に委ねる。" },
                  { company: "Patagonia", program: "環境活動休暇", desc: "環境保護ボランティアのための有給制度。社員の行動がそのまま理念の実践になる。" },
                  { company: "サイボウズ", program: "選べる働き方制度", desc: "100通り以上の働き方から社員が自分で選択できる。" },
                  { company: "Starbucks", program: "学費補助制度", desc: "アルバイトを含む全従業員の大学学費を全額負担。" },
                ].map((ex, i) => (
                  <div key={i} className="p-3" style={{ background: DK.surfaceHigh, borderRadius: 10, border: `1px solid ${DK.border}` }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold" style={{ color: DK.accent }}>{ex.company}</span>
                      <span className="text-[11px]" style={{ color: DK.gold }}>{ex.program}</span>
                    </div>
                    <p className="text-xs" style={{ color: DK.textSub }}>{ex.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 4 — MISSION WAY */}
            <section>
              <div className="p-6 text-center" style={{ background: DK.goldSoft, borderRadius: 16, border: `1px solid rgba(212,168,83,0.3)` }}>
                <p className="text-[10px] tracking-[0.4em] uppercase mb-3" style={{ color: DK.gold }}>Our Framework</p>
                <h3 className="text-2xl font-bold mb-1" style={{ color: DK.accent }}>MISSION</h3>
                <h3 className="text-2xl font-light mb-4" style={{ color: DK.accent }}>WAY</h3>
                <p className="text-xs leading-relaxed" style={{ color: DK.textSub }}>
                  MISSIONとWAYだけでつくる、<br />現場で「使われる」理念設計
                </p>
              </div>
            </section>

            <section>
              <div className="space-y-4 text-sm leading-relaxed" style={{ color: DK.textSub }}>
                <p>
                  「理念はあるけれど、正直だれも覚えていない」「MVVを作ったけれど、現場に落ちていない」
                </p>
                <p>
                  理由はシンプルで、理念が<strong style={{ color: DK.text }}>難しすぎる、抽象的すぎる、そして実務とつながっていない</strong>ことが多いからです。
                </p>
                <div className="p-4 space-y-3" style={{ background: DK.surfaceHigh, borderRadius: 12, border: `1px solid ${DK.border}` }}>
                  <div>
                    <p className="text-xs font-bold mb-1" style={{ color: DK.gold }}>MISSION</p>
                    <p className="text-sm" style={{ color: DK.text }}>目指す未来。社会や患者さんに対して何を実現するか。</p>
                  </div>
                  <div style={{ borderTop: `1px solid ${DK.border}`, paddingTop: 12 }}>
                    <p className="text-xs font-bold mb-1" style={{ color: DK.gold }}>WAY</p>
                    <p className="text-sm" style={{ color: DK.text }}>その未来をどう実現するか。判断と行動の大指針。</p>
                  </div>
                  <div style={{ borderTop: `1px solid ${DK.border}`, paddingTop: 12 }}>
                    <p className="text-xs font-bold mb-1" style={{ color: DK.textMuted }}>SLOGAN（付属要素）</p>
                    <p className="text-sm" style={{ color: DK.textSub }}>MISSIONを一言で伝える短文。覚えやすく、外向けに。</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Examples */}
            <section>
              <h3 className="text-sm font-bold tracking-wide uppercase mb-4" style={{ color: DK.gold }}>
                Example
              </h3>
              <div className="space-y-6">
                {[
                  {
                    type: "予防・メインテナンス重視",
                    mission: "むし歯と歯周病で困る人を、地域から減らします。",
                    slogan: "治すより先に、守る。",
                    ways: ["初診では治療より先に現状と選択肢を丁寧に説明します", "症状だけでなく原因まで一緒に整理します", "治療して終わりにせず予防プランまで提案します"],
                  },
                  {
                    type: "痛み・不安の少ない通院体験",
                    mission: "歯医者が怖くて行けない人でも、安心して通える場所をつくります。",
                    slogan: "こわいを、安心に変える。",
                    ways: ["いきなり治療に入らず困りごとと不安を最初に聞きます", "痛みが出る可能性がある工程は事前に説明して同意を取ります", "できたことを言葉で伝え通院のハードルを下げます"],
                  },
                  {
                    type: "精密・長期視点",
                    mission: "できるだけ削らず、できるだけ歯を残せる未来を増やします。",
                    slogan: "残すために、急がない。",
                    ways: ["削る・抜く前に保存できる可能性を必ず検討します", "5〜10年先まで考えた治療計画を立てます", "再発を防ぐために治療後の管理まで設計します"],
                  },
                ].map((ex, i) => (
                  <div key={i} className="p-5" style={{ background: DK.surfaceHigh, borderRadius: 14, border: `1px solid ${DK.border}` }}>
                    <p className="text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color: DK.textMuted }}>{ex.type}</p>
                    <p className="text-sm font-bold mb-1" style={{ color: DK.accent }}>{ex.mission}</p>
                    <p className="text-xs mb-3" style={{ color: DK.gold }}>{ex.slogan}</p>
                    <div className="space-y-1.5">
                      {ex.ways.map((w, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <span className="text-xs font-bold shrink-0" style={{ color: DK.border, fontFamily: "Georgia, serif" }}>{String(j + 1).padStart(2, "0")}</span>
                          <p className="text-xs" style={{ color: DK.textSub }}>{w}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Close */}
          <button onClick={onClose}
            className="w-full mt-8 py-3.5 text-xs tracking-widest uppercase"
            style={{ background: DK.accent, color: DK.bg, borderRadius: 100, border: "none", cursor: "pointer", fontWeight: 600, letterSpacing: "0.15em" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
