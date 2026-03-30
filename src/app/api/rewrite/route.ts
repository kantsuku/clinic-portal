import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: Request) {
  try {
    const { title, text, context } = await req.json();

    if (!text || text.trim().length < 5) {
      return NextResponse.json(
        { error: "テキストが短すぎます" },
        { status: 400 }
      );
    }

    const systemPrompt = `あなたは歯科医院のHP制作を支援するプロのライターです。
医院から受け取った「ラフなメモ書き」を、HPに掲載できる品質の文章にリライトしてください。

## リライトのルール

1. **一次情報は絶対に消さない** — 医院独自の判断軸・取り組み・エピソード・数字は必ず残す
2. **盛らない** — 事実にないことを付け足さない。嘘になる表現は禁止
3. **温度感を保つ** — 元の文章のトーン（親しみやすい/プロフェッショナル等）を維持する
4. **読みやすく整える** — 冗長な表現を削り、文のリズムを整える
5. **医療広告ガイドラインに配慮** — 「最高」「絶対」「必ず治る」等の誇大表現は使わない
6. **ですます調** — 患者さん向けの丁寧な文体にする
7. **短すぎない** — リライト後が極端に短くならないようにする。情報量は維持する

リライト後の文章のみを出力してください。前置きや説明は不要です。`;

    const userPrompt = title
      ? `## 項目名\n${title}\n\n## リライト対象のテキスト\n${text}${context ? `\n\n## 補足情報\n${context}` : ""}`
      : `## リライト対象のテキスト\n${text}${context ? `\n\n## 補足情報\n${context}` : ""}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    const rewritten =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ rewritten });
  } catch (error) {
    console.error("Rewrite API error:", error);
    return NextResponse.json(
      { error: "リライトに失敗しました" },
      { status: 500 }
    );
  }
}
