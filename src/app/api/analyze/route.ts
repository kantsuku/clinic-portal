import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const allData = typeof body.data === "object" ? body.data : {};

    const dataText = Object.entries(allData)
      .filter(([, v]) => typeof v === "string" && (v as string).trim())
      .map(([k, v]) => `【${k}】\n${v}`)
      .join("\n\n");

    if (dataText.length < 50) {
      return NextResponse.json({ error: "データが少なすぎます" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: `あなたは歯科医院のHP制作コンサルタントです。
医院から収集した一次情報を分析し、以下の形式でレポートを出力してください。

## 出力形式（JSON）
{
  "summary": "全体的な評価（2-3文）",
  "strengths": ["強み1", "強み2", "強み3"],
  "weaknesses": ["弱み/不足1", "弱み/不足2"],
  "suggestions": ["改善提案1", "改善提案2", "改善提案3"],
  "seo_keywords": ["推奨キーワード1", "推奨キーワード2", "推奨キーワード3"],
  "persona": "この医院に来る典型的な患者像（1-2文）",
  "differentiator": "最大の差別化ポイント（1文）"
}

一次情報の質を重視して評価してください。テンプレ的な表現しかない部分は弱みとして指摘してください。`,
      messages: [{ role: "user", content: `## 医院データ\n\n${dataText}` }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "{}";
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();

    let report;
    try {
      report = JSON.parse(cleaned);
    } catch {
      report = { summary: cleaned, strengths: [], weaknesses: [], suggestions: [], seo_keywords: [], persona: "", differentiator: "" };
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Analyze API error:", error);
    return NextResponse.json({ error: "分析に失敗しました" }, { status: 500 });
  }
}
