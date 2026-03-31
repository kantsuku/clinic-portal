import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = typeof body.data === "object" ? body.data : {};

    const dataText = Object.entries(data)
      .filter(([, v]) => typeof v === "string" && (v as string).trim())
      .map(([k, v]) => `【${k}】\n${v}`)
      .join("\n\n");

    if (dataText.length < 100) {
      return NextResponse.json({ error: "データが不足しています" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: `あなたは歯科医院のHP制作ディレクターです。
入力データをもとに、HPの構成案と各ページの原稿たたき台を作成してください。

## 出力形式（JSON）
{
  "pages": [
    {
      "name": "ページ名（例：トップページ）",
      "sections": [
        {
          "heading": "セクション見出し",
          "content": "原稿テキスト（2-4文、簡潔に）",
          "source_fields": ["参照した入力項目名"]
        }
      ],
      "photos_needed": ["必要な写真（例：院内全景）"]
    }
  ]
}

## ルール
- 一次情報を最大限活かす
- 元の文章の1.2倍以内に収める
- 医療広告ガイドラインに配慮
- ページ構成：トップ、診療案内、院長・スタッフ紹介、医院案内（設備・アクセス）、初めての方へ
- 各セクションの原稿は簡潔に（ダラダラ書かない）`,
      messages: [{ role: "user", content: `## 医院データ\n\n${dataText}` }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "{}";
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();

    let result;
    try { result = JSON.parse(cleaned); } catch { result = { pages: [], raw: cleaned }; }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Generate HP error:", error);
    return NextResponse.json({ error: "生成に失敗しました" }, { status: 500 });
  }
}
