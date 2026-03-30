import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic();

const SYSTEM_PROMPT = `あなたは歯科医院のHP制作を支援するプロのライターです。
医院から受け取った「ラフなメモ書き」を、HPに掲載できる品質の文章にリライトしてください。

## リライトのルール

1. **一次情報は絶対に消さない** — 医院独自の判断軸・取り組み・エピソード・数字は必ず残す
2. **盛らない** — 事実にないことを付け足さない。嘘になる表現は禁止
3. **温度感を保つ** — 元の文章のトーン（親しみやすい/プロフェッショナル等）を維持する
4. **読みやすく整える** — 冗長な表現を削り、文のリズムを整える
5. **医療広告ガイドラインに配慮** — 「最高」「絶対」「必ず治る」等の誇大表現は使わない
6. **ですます調** — 患者さん向けの丁寧な文体にする

## 文量のルール（重要）

- **元の文章の1.2倍以内**に収める。元が3行なら4行以内
- 「〜することができます」→「〜できます」のように冗長な表現を削る
- 同じ意味を2回言わない（例：「安心して安全に」→ どちらか1つ）
- 修飾語の連発を避ける（例：「丁寧で優しく温かい対応」→「丁寧な対応」）
- 1文を短く。40文字を超える文は分割を検討する
- 情報密度を上げる：少ない文字数で多くの情報を伝える

リライト後の文章のみを出力してください。前置きや説明は不要です。`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title = typeof body.title === "string" ? body.title : "";
    const text = typeof body.text === "string" ? body.text : "";
    const context = typeof body.context === "string" ? body.context : "";
    const useStream = !!body.stream;

    if (!text || text.trim().length < 5) {
      return NextResponse.json(
        { error: "テキストが短すぎます" },
        { status: 400 }
      );
    }

    const userPrompt = title
      ? `## 項目名\n${title}\n\n## リライト対象のテキスト\n${text}${context ? `\n\n## 補足情報\n${context}` : ""}`
      : `## リライト対象のテキスト\n${text}${context ? `\n\n## 補足情報\n${context}` : ""}`;

    // ストリーミングモード
    if (useStream) {
      const stream = client.messages.stream({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      });

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // 通常モード
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
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
