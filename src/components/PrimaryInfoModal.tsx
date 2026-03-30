"use client";

interface PrimaryInfoModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PrimaryInfoModal({ open, onClose }: PrimaryInfoModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Scrim */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto mx-4 mb-0 sm:mb-0"
        style={{
          background: "var(--md-surface-container)",
          borderRadius: "var(--md-shape-corner-xl) var(--md-shape-corner-xl) 0 0",
          boxShadow: "var(--md-elevation-2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="w-8 h-1 rounded-full"
            style={{ background: "var(--md-outline-variant)" }}
          />
        </div>

        <div className="px-4 sm:px-6 pb-8 pt-2">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <img src="/ponko.png" alt="ぽん子" className="w-12 h-12" />
            <div>
              <h2
                className="text-lg font-medium"
                style={{ color: "var(--md-on-surface)" }}
              >
                一次情報ってなに？
              </h2>
              <p className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
                ぽん子が解説します！
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-5 text-sm leading-relaxed" style={{ color: "var(--md-on-surface)" }}>
            <div
              className="p-4"
              style={{
                background: "var(--md-primary-container)",
                borderRadius: "var(--md-shape-corner-lg)",
              }}
            >
              <p className="font-medium mb-2" style={{ color: "var(--md-primary)" }}>
                一次情報 = 先生の医院にしか書けないこと
              </p>
              <p style={{ color: "var(--md-on-primary-container)" }}>
                「丁寧な治療を心がけています」← これはどの医院でも書けちゃいます。
                でも「なぜそうしているのか」「どんな工夫をしているのか」は、先生にしか書けない情報です。
                これが<strong>一次情報</strong>です！
              </p>
            </div>

            <div>
              <p className="font-medium mb-3" style={{ color: "var(--md-on-surface)" }}>
                なんで一次情報が大事なの？
              </p>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <span
                    className="w-7 h-7 flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      background: "var(--md-primary)",
                      color: "var(--md-on-primary)",
                      borderRadius: "var(--md-shape-corner-sm)",
                    }}
                  >
                    1
                  </span>
                  <div>
                    <p className="font-medium">AIに引用される</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--md-on-surface-variant)" }}>
                      Google の AI 検索（AIO）は、AIが自分で書けない「独自の情報」を優先的に引用します。
                      テンプレ文はAIが自分で生成できるので、引用されません。
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span
                    className="w-7 h-7 flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      background: "var(--md-primary)",
                      color: "var(--md-on-primary)",
                      borderRadius: "var(--md-shape-corner-sm)",
                    }}
                  >
                    2
                  </span>
                  <div>
                    <p className="font-medium">SEOに強い</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--md-on-surface-variant)" }}>
                      Googleは E-E-A-T（経験・専門性・権威性・信頼性）を重視しています。
                      先生の実体験や判断の理由が書かれたページは「経験」の評価が高くなります。
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span
                    className="w-7 h-7 flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      background: "var(--md-primary)",
                      color: "var(--md-on-primary)",
                      borderRadius: "var(--md-shape-corner-sm)",
                    }}
                  >
                    3
                  </span>
                  <div>
                    <p className="font-medium">患者さんに響く</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--md-on-surface-variant)" }}>
                      「なぜこの治療にこだわっているのか」が書いてあると、
                      患者さんは「この先生に診てもらいたい」と感じます。
                      来院の決め手になるのは、いつも先生の想いや姿勢です。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="p-4"
              style={{
                background: "var(--md-surface-container-low)",
                borderRadius: "var(--md-shape-corner-lg)",
              }}
            >
              <p className="font-medium mb-2">ぽん子がチェックしてる5つのポイント</p>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <span className="font-bold" style={{ color: "var(--md-primary)" }}>30%</span>
                  <div>
                    <span className="font-medium">判断軸・こだわり</span>
                    <p style={{ color: "var(--md-on-surface-variant)" }}>
                      「なぜそうしているのか」「あえて選んでいる理由」
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold" style={{ color: "var(--md-primary)" }}>25%</span>
                  <div>
                    <span className="font-medium">独自の取り組み</span>
                    <p style={{ color: "var(--md-on-surface-variant)" }}>
                      「具体的に何をやっているか」「医院ならではの工夫」
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold" style={{ color: "var(--md-primary)" }}>25%</span>
                  <div>
                    <span className="font-medium">エピソード</span>
                    <p style={{ color: "var(--md-on-surface-variant)" }}>
                      「きっかけとなった出来事」「患者さんとの実体験」
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold" style={{ color: "var(--md-on-surface-variant)" }}>10%</span>
                  <div>
                    <span className="font-medium">具体的な数字</span>
                    <p style={{ color: "var(--md-on-surface-variant)" }}>
                      「年数」「件数」「回数」などの具体的データ
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold" style={{ color: "var(--md-on-surface-variant)" }}>10%</span>
                  <div>
                    <span className="font-medium">想い・感情</span>
                    <p style={{ color: "var(--md-on-surface-variant)" }}>
                      「大切にしていること」「願い」「目指す姿」
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="p-4"
              style={{
                background: "var(--md-tertiary-container)",
                borderRadius: "var(--md-shape-corner-lg)",
              }}
            >
              <p className="font-medium mb-1" style={{ color: "var(--md-tertiary)" }}>
                コツは「1文足すだけ」！
              </p>
              <p className="text-xs" style={{ color: "var(--md-on-surface)" }}>
                全部を完璧に書く必要はありません！<br />
                テンプレ文の後に<strong>「なぜなら〜」「きっかけは〜」</strong>を1文足すだけで、
                一次情報スコアがグッと上がりますよ！
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full mt-6 py-3 text-sm font-medium"
            style={{
              background: "var(--md-primary)",
              color: "var(--md-on-primary)",
              borderRadius: "100px",
              border: "none",
              cursor: "pointer",
            }}
          >
            わかりました！
          </button>
        </div>
      </div>
    </div>
  );
}
