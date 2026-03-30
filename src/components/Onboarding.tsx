"use client";

import { useState } from "react";

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  {
    title: "ようこそ！",
    body: "Clinic Portal へようこそ！\nわたし、ぽん子がヒアリングをサポートします。先生の医院の情報を一緒に整理していきましょう！",
    tip: null,
  },
  {
    title: "2ステップで進めます",
    body: "ステップ1で基本情報と理念、ステップ2でエピソードや詳細を入力します。どこからでも始められますよ！",
    tip: "入力はいつでも中断OK！自動で保存されます",
  },
  {
    title: "一次情報がカギ！",
    body: "「先生にしか書けないこと」が一次情報です。テンプレ的な文章よりも、先生の判断理由やエピソードの方がHPの差別化に繋がります！",
    tip: "入力すると一次情報メーターでチェックできます",
  },
  {
    title: "AIがお手伝い！",
    body: "ラフに書いてもらえれば「AIできれいにする」ボタンで文章を整えます。ぽん子に相談もできますよ！",
    tip: "相談した内容はそのまま項目に反映できます",
  },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "var(--md-surface)" }}>
      <div className="w-full max-w-sm text-center">
        <img
          src="/ponko.png"
          alt="ぽん子"
          className="w-24 h-24 mx-auto mb-6 ponko-jump"
        />

        <h2
          className="text-xl font-medium mb-3"
          style={{ color: "var(--md-on-surface)" }}
        >
          {current.title}
        </h2>

        <p
          className="text-sm leading-relaxed whitespace-pre-wrap mb-4"
          style={{ color: "var(--md-on-surface)" }}
        >
          {current.body}
        </p>

        {current.tip && (
          <div
            className="inline-block px-4 py-2 text-xs font-medium mb-6"
            style={{
              background: "var(--md-primary-container)",
              color: "var(--md-on-primary-container)",
              borderRadius: "100px",
            }}
          >
            {current.tip}
          </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-colors"
              style={{
                background: i === step ? "var(--md-primary)" : "var(--md-outline-variant)",
              }}
            />
          ))}
        </div>

        <div className="flex gap-2 justify-center">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-6 py-3 text-sm font-medium min-h-[48px]"
              style={{
                background: "var(--md-surface-container)",
                color: "var(--md-on-surface-variant)",
                borderRadius: "100px",
                border: "1px solid var(--md-outline-variant)",
                cursor: "pointer",
              }}
            >
              戻る
            </button>
          )}
          <button
            onClick={() => {
              if (isLast) onComplete();
              else setStep((s) => s + 1);
            }}
            className="px-8 py-3 text-sm font-medium min-h-[48px]"
            style={{
              background: "var(--md-primary)",
              color: "var(--md-on-primary)",
              borderRadius: "100px",
              border: "none",
              cursor: "pointer",
            }}
          >
            {isLast ? "はじめる！" : "次へ"}
          </button>
        </div>

        {!isLast && (
          <button
            onClick={onComplete}
            className="mt-4 text-xs"
            style={{
              color: "var(--md-on-surface-variant)",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            スキップ
          </button>
        )}
      </div>
    </div>
  );
}
