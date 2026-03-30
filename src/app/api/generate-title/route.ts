import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: Request) {
  try {
    const { text, sectionContext } = await req.json();

    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        { error: "本文が短すぎます" },
        { status: 400 }
      );
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 256,
      system: `あなたは歯科医院HPのキャッチコピーライターです。
本文の内容を読み取り、短く印象的なキャッチコピーを3つ提案してください。

## ルール
- 各キャッチコピーは15文字以内を目標（最大20文字）
- 医院の独自性が伝わる表現にする
- 一般的すぎる表現は避ける（「安心の治療」等は×）
- 本文に含まれる一次情報（判断軸・取り組み・エピソード）を活かす
- 医療広告ガイドラインに配慮（「最高」「絶対」等は使わない）
- 患者目線で、来院したくなる言葉を選ぶ

JSON配列のみを出力してください：
["キャッチコピー1", "キャッチコピー2", "キャッチコピー3"]`,
      messages: [
        {
          role: "user",
          content: `${sectionContext ? `## セクション: ${sectionContext}\n\n` : ""}## 本文\n${text}`,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "[]";

    // JSONパース（```json ... ``` 対応）
    const cleaned = responseText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/, "")
      .trim();

    const titles = JSON.parse(cleaned);

    return NextResponse.json({ titles });
  } catch (error) {
    console.error("Generate title API error:", error);
    return NextResponse.json(
      { error: "キャッチコピー生成に失敗しました" },
      { status: 500 }
    );
  }
}
