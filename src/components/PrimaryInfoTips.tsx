"use client";

import { useState } from "react";

interface PrimaryInfoTipsProps {
  sectionId: string;
}

interface Tip {
  emoji: string;
  label: string;
  bad: string;
  good: string;
  technique: string;
}

const SECTION_TIPS: Record<string, Tip[]> = {
  basic: [
    {
      emoji: "📍",
      label: "アクセス",
      bad: "駅から徒歩5分",
      good: "◯◯駅南口を出て商店街を抜けた先、緑の看板が目印です。雨の日も屋根付きの道で濡れずに来られます",
      technique: "来院する患者さんの気持ちになって、実際に歩いたときの情景を書いてみてください！",
    },
  ],
  director: [
    {
      emoji: "🎓",
      label: "経歴",
      bad: "◯◯大学卒業、◯◯医院勤務",
      good: "◯◯大学で根管治療を専門的に学び、◯◯医院では年間200件以上のインプラント症例に携わりました",
      technique: "「何を学んだか」「何件くらいやったか」を足すと、先生の専門性が伝わります！",
    },
    {
      emoji: "📜",
      label: "資格",
      bad: "インプラント専門医",
      good: "インプラント専門医（取得まで5年間、200症例の実績が必要な厳しい審査を経て取得）",
      technique: "資格の「すごさ」が患者さんに伝わるように、取得条件や努力を一言添えてみてください！",
    },
  ],
  "philosophy-origin": [
    {
      emoji: "🌱",
      label: "きっかけ",
      bad: "子どもの頃から歯科医師になりたいと思っていました",
      good: "小学生の頃、虫歯の治療で泣いていたら、先生が手を握って「大丈夫、すぐ終わるからね」と言ってくれた。あの温かさが忘れられなくて、自分もああなりたいと思いました",
      technique: "具体的な場面を1つ思い出して書くと、テンプレ感がゼロになります！",
    },
    {
      emoji: "🏠",
      label: "開業理由",
      bad: "地域医療に貢献したいと思い開業しました",
      good: "この地域で5年間訪問歯科をしていた時に、通える歯医者が少なくて困っている高齢者を何人も見てきました。だからここに開業しようと決めました",
      technique: "「なぜこの場所？」の答えには、必ず先生だけの理由があるはず！",
    },
  ],
  "philosophy-core": [
    {
      emoji: "💭",
      label: "理念",
      bad: "患者さまに寄り添った丁寧な治療を心がけています",
      good: "以前勤務していた医院で、説明不足のまま治療が進んで不安そうにしている患者さんを何度も見てきました。だから当院では、治療の前に必ず30分のカウンセリング時間を設けています",
      technique: "「なぜそう思うようになったか」のきっかけを書くだけで、一気にオリジナルな文章になります！",
    },
    {
      emoji: "🚫",
      label: "やらないこと",
      bad: "無理な治療はしません",
      good: "患者さんが納得していないまま治療を始めることは、絶対にしないと決めています。以前、別の医院で十分な説明なく抜歯されたというトラウマを持つ患者さんが来院されたことがあり、その方の不安な表情が忘れられません",
      technique: "「やらない判断」とその理由は、最も信頼を生む一次情報です！",
    },
  ],
  "philosophy-story": [
    {
      emoji: "📖",
      label: "エピソード",
      bad: "患者さんに喜んでいただけるよう努力しています",
      good: "歯医者が怖くて10年通えなかったという患者さんが、当院には笑顔で通ってくださっています。初来院のとき震えていた手が、3回目には「先生、今日もよろしく」と握手してくれた。それが何より嬉しいことです",
      technique: "「いつ・誰が・何をして・どう変わったか」を書くだけで最高のストーリーになります！",
    },
    {
      emoji: "💬",
      label: "患者さんの声",
      bad: "患者さんに信頼されています",
      good: "患者さんから一番言われるのは「説明が丁寧ですね」という言葉です。自分では当たり前のことだと思っていましたが、それが来院の決め手になっていると聞いて、続けてよかったと思いました",
      technique: "先生が「当たり前」だと思ってることが、実は患者さんにとっては特別なんです！",
    },
  ],
  "treatment-menu": [
    {
      emoji: "🦷",
      label: "診療内容",
      bad: "インプラント治療を行っています",
      good: "インプラント専門医が在籍し、年間120件以上の実績があります。当院ではCT撮影とサージカルガイドを必ず使用し、手術時間は通常1本30分程度です",
      technique: "「やっています」だけでなく、実績・件数・独自のやり方を書くと最強です！",
    },
  ],
  "equipment-check": [
    {
      emoji: "🔬",
      label: "設備",
      bad: "最新のCTを導入しています",
      good: "CTを導入したことで、以前は大学病院に紹介していた難しい親知らずの抜歯も当院で安全に対応できるようになりました。患者さんに紹介状を書く回数が3分の1に減りました",
      technique: "「導入した結果、何が変わったか」を患者さん目線で！",
    },
  ],
  features: [
    {
      emoji: "⭐",
      label: "特徴",
      bad: "痛みの少ない治療を行っています",
      good: "開院以来、治療中に痛みで手を挙げた患者さんはほぼゼロです。表面麻酔→電動麻酔→体温に温めた麻酔液という3ステップを必ず踏んでいます",
      technique: "「具体的に何をしているか」と「その結果どうなったか」を書くと最強です！",
    },
    {
      emoji: "🔧",
      label: "設備",
      bad: "最新のCTを導入しています",
      good: "CTを導入したことで、以前は大学病院に紹介していた難しい親知らずの抜歯も、当院で安全に対応できるようになりました",
      technique: "「その設備があることで何が変わったか」を患者さん目線で書いてみてください！",
    },
  ],
};

export default function PrimaryInfoTips({ sectionId }: PrimaryInfoTipsProps) {
  const tips = SECTION_TIPS[sectionId];
  const [currentTip, setCurrentTip] = useState(0);
  const [expanded, setExpanded] = useState(false);

  if (!tips || tips.length === 0) return null;

  const tip = tips[currentTip];

  return (
    <div
      className="mb-4"
      style={{
        background: "var(--md-surface-container)",
        borderRadius: "var(--md-shape-corner-lg)",
        boxShadow: "var(--md-elevation-1)",
        overflow: "hidden",
      }}
    >
      {/* Header - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left"
        style={{ border: "none", cursor: "pointer", background: "transparent" }}
      >
        <img src="/ponko.png" alt="ぽん子" className="w-8 h-8 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium" style={{ color: "var(--md-primary)" }}>
            一次情報のコツ {tip.emoji}
          </p>
          <p className="text-xs truncate" style={{ color: "var(--md-on-surface-variant)" }}>
            {tip.technique}
          </p>
        </div>
        <svg
          className="w-5 h-5 shrink-0 transition-transform"
          style={{
            color: "var(--md-on-surface-variant)",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Bad example */}
          <div
            className="p-3"
            style={{
              background: "var(--md-error-container)",
              borderRadius: "var(--md-shape-corner-sm)",
            }}
          >
            <p className="text-[10px] font-medium mb-1" style={{ color: "var(--md-error)" }}>
              よくある文章（テンプレ感あり）
            </p>
            <p className="text-xs" style={{ color: "var(--md-on-surface)" }}>
              {tip.bad}
            </p>
          </div>

          {/* Good example */}
          <div
            className="p-3"
            style={{
              background: "var(--md-tertiary-container)",
              borderRadius: "var(--md-shape-corner-sm)",
            }}
          >
            <p className="text-[10px] font-medium mb-1" style={{ color: "var(--md-tertiary)" }}>
              一次情報が入った文章
            </p>
            <p className="text-xs" style={{ color: "var(--md-on-surface)" }}>
              {tip.good}
            </p>
          </div>

          {/* Technique */}
          <div className="flex items-start gap-2">
            <img src="/ponko.png" alt="ぽん子" className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-xs font-medium" style={{ color: "var(--md-primary)" }}>
              {tip.technique}
            </p>
          </div>

          {/* Tip navigation */}
          {tips.length > 1 && (
            <div className="flex items-center justify-center gap-3 pt-1">
              {tips.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTip(i)}
                  className="w-2 h-2 rounded-full transition-colors"
                  style={{
                    background: i === currentTip ? "var(--md-primary)" : "var(--md-outline-variant)",
                    border: "none",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
