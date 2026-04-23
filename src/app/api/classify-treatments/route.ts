import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"

const client = new Anthropic()

const SYSTEM_PROMPT = `あなたは歯科医療の専門家です。
歯科の診療科目の項目リストを受け取り、中粒度のサブカテゴリに分類してください。

## ルール

1. 各サブカテゴリは「検査・診断」「基本治療」「外科治療」「体制・取り組み」のような中粒度のグループ
2. 1つのサブカテゴリに含まれる項目は3〜8個程度が理想
3. 上位概念と下位概念が重複しないよう整理する（例：「歯周外科治療」という上位があるなら「FOP」は歯周外科の下に入れる）
4. 各サブカテゴリには、クライアント（歯科医院の院長）に聞く質問文を付ける
5. 項目が少ない科目（2〜3個）はサブカテゴリを作らず「全般」で1つにまとめてよい
6. 「機器/設備」「資格/実績」「取り組み」のようなタグが付いている場合、それを参考にグルーピングする

## 質問文の作り方（重要）

質問文の目的は「概要の説明」ではなく「一次情報（その医院にしか書けない情報）を引き出すこと」です。
以下の観点を質問に含めてください：

- なぜそうしているのか（判断軸・こだわり）
- 他の方法もある中であえてそれを選んでいる理由
- 実際にあったエピソード・患者さんの反応
- 大切にしている考え方・想い

悪い質問の例：
- 「どのような検査を行っていますか？」 ← チェックで分かるので不要
- 「対応している治療内容を教えてください」 ← 概要を聞いても一次情報にならない

良い質問の例：
- 「この中で特にこだわっているものはありますか？なぜそれを大切にされていますか？」
- 「この分野で印象に残っている患者さんとのエピソードがあれば教えてください」
- 「他の医院ではあまりやらないけど、うちではこれをやっている、ということはありますか？」
- 「この治療に対する先生のお考えや、患者さんに伝えたい想いがあれば聞かせてください」

質問文は丁寧語で、1〜2文で簡潔に。

## 出力形式

JSON配列で返してください：
[
  {
    "name": "サブカテゴリ名",
    "question": "質問文",
    "items": ["項目1", "項目2", ...]
  }
]`

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const categoryName: string = body.categoryName || ""
    const items: string[] = body.items || []

    if (!categoryName || items.length === 0) {
      return NextResponse.json({ error: "データ不足" }, { status: 400 })
    }

    const userPrompt = `以下は「${categoryName}」の診療項目リストです。中粒度のサブカテゴリに分類してください。\n\n${items.map((item, i) => `${i + 1}. ${item}`).join("\n")}`

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : ""
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return NextResponse.json({ error: "分類結果を解析できませんでした" }, { status: 500 })
    }

    const subcategories = JSON.parse(jsonMatch[0])
    return NextResponse.json({ subcategories })
  } catch (error) {
    console.error("Classify API error:", error)
    return NextResponse.json({ error: "分類に失敗しました" }, { status: 500 })
  }
}
