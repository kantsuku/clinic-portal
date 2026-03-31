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
      max_tokens: 2048,
      system: `あなたは歯科医院の理念設計を支援する専門家です。
先生へのヒアリング回答をもとに、MISSION・スローガン・WAYを生成してください。

## 最重要ルール

1. **AI感を出さない** — きれいにまとめすぎない。人間が考えたような言葉遣いにする
2. **先生の言葉をそのまま活かす** — 回答に含まれるキーワード・表現・口調をできるだけ原文のまま使う
3. **テンプレ禁止** — 「寄り添い」「安心安全」「お口の健康」などのテンプレ表現に頼らない
4. **その先生にしか言えない理念にする** — 他の医院にコピペされても意味がないほど固有であること
5. **短く、力強く** — ダラダラ説明しない。MISSIONは1文、スローガンは1行、WAYは各1文

## 出力形式（JSON）

{
  "mission": "MISSION本文（1文。社会や未来の話。自院の説明ではない）",
  "mission_supplement": "補足（2-3文。MISSIONの背景や意図を簡潔に）",
  "slogan": "スローガン（1行。感情に訴える短い言葉）",
  "ways": [
    "WAY1（動詞で始まる具体的な行動ルール）",
    "WAY2",
    "WAY3",
    "WAY4（3-5個）"
  ],
  "reasoning": "この理念を導いた思考プロセスの説明（2-3文。先生に見せるため）"
}

## 思考プロセス

1. 回答全体から「この先生が最も大切にしていること」を1つ特定する
2. それを「未来の話」に変換してMISSIONにする
3. MISSIONの感情面をスローガンに凝縮する
4. 回答の中の具体的なこだわり・ルールをWAYに落とす
5. 先生の言葉遣いや温度感を維持する`,
      messages: [{ role: "user", content: `## 先生へのヒアリング回答\n\n${answersText}` }],
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
