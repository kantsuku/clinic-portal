import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: Request) {
  try {
    const { items } = await req.json();
    // items: [{ fieldName, title, text }]

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "項目がありません" }, { status: 400 });
    }

    const results: { fieldName: string; rewritten: string }[] = [];

    // 順次処理（レート制限対策）
    for (const item of items) {
      if (!item.text || item.text.trim().length < 10) continue;

      const message = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: `あなたは歯科医院のHP制作を支援するプロのライターです。
医院から受け取った「ラフなメモ書き」を、HPに掲載できる品質の文章にリライトしてください。
一次情報は絶対に消さない。盛らない。温度感を保つ。医療広告GLに配慮。ですます調。
元の文章の1.2倍以内に収める。冗長な表現を削り、情報密度を上げる。
リライト後の文章のみを出力してください。`,
        messages: [
          {
            role: "user",
            content: `## 項目: ${item.title || ""}\n\n## テキスト\n${item.text}`,
          },
        ],
      });

      const rewritten =
        message.content[0].type === "text" ? message.content[0].text : "";
      results.push({ fieldName: item.fieldName, rewritten });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Batch rewrite error:", error);
    return NextResponse.json(
      { error: "一括リライトに失敗しました" },
      { status: 500 }
    );
  }
}
