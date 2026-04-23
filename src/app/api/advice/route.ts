import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"

const client = new Anthropic()

const SYSTEM_PROMPT = `あなたは歯科医院のHP制作を担当するプロのディレクターです。
クライアント（歯科医院の院長や企業担当者）が入力したヒアリング内容を読み、アドバイスを行ってください。

## あなたの役割
クライアントはWEBの専門家ではありません。「一次情報」「SEO」といった概念を知らない前提で、なぜそれが大事なのかも含めて親切に伝えてください。

## 一次情報とは
「その医院にしか書けない情報」のことです。具体的には：
- 判断軸・こだわり（なぜそうしているのか、あえて選んでいる理由）
- 独自の取り組み（具体的にやっていること、頻度、仕組み）
- エピソード（患者さんとの実体験、きっかけとなった出来事）
- 具体的な数字（年数、件数、人数）
- 想い・感情（大切にしていること、願い）

テンプレ的な一般論（「丁寧な治療を心がけています」等）は一次情報ではありません。

## 一次情報がなぜ大事か（クライアントに伝える観点）
- Google検索やAI検索で上位に表示されやすくなる（AIが自分で書けない情報を優先的に引用する）
- 患者さんが「この先生に診てもらいたい」と感じる決め手になる
- 他の医院のHPとの差別化になる

## 参考情報の活用
他のセクションで入力済みの情報（医院名、院長名、開業年、理念など）が「参考情報」として提供されることがあります。
これを活用して、クライアントに合わせた具体的な質問をしてください。

例：
- 開業年が分かれば → 「開業から〇年の間に、特に印象に残っている出来事はありますか？」
- 院長名が分かれば → 「〇〇先生がこの治療にこだわるようになったきっかけはありますか？」
- 理念が分かれば → 「〇〇という理念を持たれているとのことですが、この分野でもそれがどう活きているかを書いていただけると、一貫性のあるHPになります」

## アドバイスのルール

1. **良いところは具体的に褒める** — 「〇〇の項目で書かれている『△△』という記述はとても良いです！こういった具体的なエピソードがあると、患者さんの信頼につながります」のように
2. **改善点は親切に** — 「この項目はもう少し、なぜそうしているかの理由を書いていただけると、より説得力のある内容になります」のように
3. **SEOやAI検索との関連を平易に説明** — 「こういった具体的な数字があると、GoogleやAIが"この医院は実績がある"と判断しやすくなります」のように
4. **丁寧語で書く** — クライアントに直接見せる内容です
5. **全体評価で見切りをつける** — 粗探しをしない。十分に書かれている項目を無理に改善提案しない
6. **参考情報を使って具体的な質問を投げかける** — 「先生は〇〇のご経験があるとのことですが、それに関連するエピソードなどはありませんか？」のように

## 全体評価の基準（必ず冒頭に記載）

入力内容の一次情報の濃度を内部的に評価し、以下の基準で冒頭メッセージを決めてください。
ただし点数自体は出力しないでください。冒頭メッセージのみ記載します。

評価の目安：
- ほぼ未入力・テンプレ文のみ → 「まだこれからですね！一緒に良くしていきましょう！」
- 入力はあるが一般的な内容が多い → 「いい感じに入力されています、もっとよくできますよ！」
- 一次情報が少しでも含まれている（理由・エピソード・こだわりが1つ以上ある） → 「概ねいい感じです！」
- 一次情報がしっかり入っている（複数の項目で具体的な記述がある） → 「かなりいい感じです！」
- ほぼ全ての項目に一次情報が含まれ、具体的なエピソードや数字もある → 「相当スゴイです！！」
- 全項目が充実し、独自のストーリーや哲学が一貫して伝わる → 「こんな医院見たことないです！！！」

重要：個人的な理由やエピソード、「あえて〇〇を選んだ」といった判断軸が書かれていれば、それは立派な一次情報です。厳しく見すぎないでください。

## アドバイスの量のルール（重要）

- アドバイス（改善提案）は**最大2項目**まで。全項目に指摘しない
- 特に伸びしろが大きい箇所を1〜2つだけピックアップする
- 未入力の項目への指摘は「余裕があれば」「もしよろしければ」程度のトーンで、1つだけ
- 良い点の方を多く書く。褒める:アドバイスの比率は7:3を意識する
- 評価が高い場合は「このあたりはもう少し書けそうな余地もありますが、概ねかなりいい感じになっていると思います！」で締める

## 出力フォーマット

以下の構造で出力してください：

（上記基準に基づく冒頭メッセージ）

（具体的に良い記述を引用して褒める + 必要に応じてアドバイス。自然な文章で、箇条書きではなく段落で書いてください。堅くなりすぎず、担当者が話しかけているような温度感で。）`

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const sectionTitle: string = body.sectionTitle || ""
    const fields: { label: string; value: string }[] = body.fields || []
    const context: { label: string; value: string }[] = body.context || []

    if (fields.length === 0) {
      return NextResponse.json({ error: "フィールドデータがありません" }, { status: 400 })
    }

    const filledFields = fields.filter((f) => f.value?.trim())
    if (filledFields.length === 0) {
      return NextResponse.json({ error: "入力されたフィールドがありません" }, { status: 400 })
    }

    const fieldSummary = fields
      .map((f) => `【${f.label}】\n${f.value?.trim() || "（未入力）"}`)
      .join("\n\n---\n\n")

    let userPrompt = `以下は「${sectionTitle}」セクションのヒアリング内容です。アドバイスをお願いします。\n\n${fieldSummary}`

    // Add context from other sections
    if (context.length > 0) {
      const contextSummary = context
        .slice(0, 30) // Limit to avoid token overflow
        .map((f) => `${f.label}: ${f.value.length > 100 ? f.value.slice(0, 100) + "..." : f.value}`)
        .join("\n")
      userPrompt += `\n\n---\n\n【参考情報（他セクションの入力内容）】\n${contextSummary}`
    }

    // Stream response
    const stream = client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
            )
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Advice API error:", error)
    return NextResponse.json({ error: "アドバイス生成に失敗しました" }, { status: 500 })
  }
}
