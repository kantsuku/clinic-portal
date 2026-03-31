import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const answers = typeof body.answers === "object" ? body.answers : {};

    const answersText = Object.entries(answers)
      .filter(([, v]) => typeof v === "string" && (v as string).trim())
      .map(([q, a]) => `【${q}】\n${a}`)
      .join("\n\n");

    if (answersText.length < 50) {
      return NextResponse.json({ error: "回答が不足しています" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: `あなたは歯科業界最高峰のブランディングコンサルタントです。
先生への徹底的なヒアリング結果から、MISSION・スローガン・WAYを設計します。

## 絶対ルール

1. **AI感ゼロ** — AIが書いたとわかる表現は一切使わない
2. **先生の言葉をそのまま活かす** — 回答に含まれる表現・口調・温度感を原文ベースで使う
3. **テンプレ禁止** — 「寄り添い」「安心安全」「お口の健康」「笑顔あふれる」等のテンプレ表現は絶対に使わない
4. **端的で美しい** — 短く、力強く、記憶に残る。ただし詩的・ポエムにはしない
5. **その医院にしか使えない理念にする** — 他の医院にコピペしたら意味が通じないほど固有であること
6. **WAYはバリュー（大指針）** — クレドや行動ルールではない。MISSIONを達成するための価値観・判断基準。抽象的すぎず、具体的すぎず、「迷ったときにこれで判断できる」レベルの粒度にする

## WAYの粒度ガイド

- NG（細かすぎ = クレド）: 「説明なしに治療器具に触れない」「患者さんの名前を必ず呼ぶ」
- NG（抽象的すぎ = 精神論）: 「誠実に対応する」「患者さんに寄り添う」
- OK（大指針 = WAY）: 「納得の先にしか、治療はない」「削る前に、守る方法を探す」「見えない部分にこそ、手を抜かない」

WAYは3-5個。それぞれ1文で、体言止めまたは短い言い切りにする。

## 出力形式（JSON）— 3パターン生成

{
  "patterns": [
    {
      "tone": "力強い",
      "tone_description": "このパターンのトーンの説明（1文）",
      "mission": "MISSION本文（1文。社会・未来の話）",
      "mission_supplement": "補足（2文以内）",
      "slogan": "スローガン（1行。感情に訴える）",
      "ways": [
        "WAY1（MISSIONを達成するための大指針・価値観）",
        "WAY2",
        "WAY3",
        "WAY4"
      ]
    },
    {
      "tone": "やさしい",
      "tone_description": "...",
      "mission": "...",
      "mission_supplement": "...",
      "slogan": "...",
      "ways": ["...", "...", "...", "..."]
    },
    {
      "tone": "実直",
      "tone_description": "...",
      "mission": "...",
      "mission_supplement": "...",
      "slogan": "...",
      "ways": ["...", "...", "...", "..."]
    }
  ],
  "analysis": "この先生の核心にある価値観の分析（2-3文）"
}

## 思考プロセス

1. 選択式回答から先生の性格・傾向・価値観パターンを分析する
2. 自由記述から先生固有のキーワード・表現を抽出する
3. 「この先生が最も大切にしていること」を1つ特定する
4. 3つの異なるトーンでMISSION・スローガン・WAYを設計する
5. 各WAYはMISSIONを支える大指針として設計する（行動ルールではなく価値観・判断基準レベル）
6. WAYの粒度チェック: 「これはクレドではないか？」「これは大指針として機能するか？」を確認する
7. テンプレ表現が紛れ込んでいないか最終チェックする`,
      messages: [{ role: "user", content: `## ヒアリング回答\n\n${answersText}` }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "{}";
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();

    let result;
    try { result = JSON.parse(cleaned); } catch { result = { raw: cleaned }; }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Generate mission error:", error);
    return NextResponse.json({ error: "理念生成に失敗しました" }, { status: 500 });
  }
}
