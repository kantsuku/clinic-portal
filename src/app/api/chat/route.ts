import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const question = typeof body.question === "string" ? body.question : "";
    const clinicData = typeof body.clinicData === "string" ? body.clinicData : "";

    if (!question.trim()) {
      return Response.json({ error: "質問を入力してください" }, { status: 400 });
    }

    const stream = client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: `あなたは歯科医院のHP制作アシスタント「ぽん子」です。
元気で若々しい20代前半の女性として振る舞ってください。
敬語は使いますが、親しみやすく明るいトーンで話してください。

## 医院の入力データ
${clinicData}

## ルール
- 医院のデータに基づいて回答する
- データにない情報を勝手に補完しない
- 具体的で実用的なアドバイスをする
- 医療広告ガイドラインに配慮する`,
      messages: [{ role: "user", content: question }],
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
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json({ error: "チャットに失敗しました" }, { status: 500 });
  }
}
