"use client";

import { useState, useRef, useEffect } from "react";
import { sections } from "@/lib/schema";

interface PonkoChatProps {
  values: Record<string, string>;
  onClose: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function PonkoChat({ values, onClose }: PonkoChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "何でも聞いてくださいね！入力した内容について質問したり、「うちの強みって何？」「キャッチコピー考えて」とか、何でもOKですよ！" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 入力データをテキスト化
  function getClinicDataText(): string {
    return sections
      .flatMap((s) =>
        s.fields
          .filter((f) => values[f.name]?.trim())
          .map((f) => `【${f.label}】\n${values[f.name]}`)
      )
      .join("\n\n");
  }

  async function handleSend() {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, clinicData: getClinicDataText() }),
      });

      if (!res.ok) throw new Error();

      const reader = res.body?.getReader();
      if (!reader) throw new Error();

      const decoder = new TextDecoder();
      let result = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const data = JSON.parse(line.slice(6));
              result += data.text;
              setMessages((prev) => [
                ...prev.slice(0, -1),
                { role: "assistant", content: result },
              ]);
            } catch {}
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "ごめんなさい、エラーが発生しました...もう一度試してみてください！" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "var(--md-surface)" }}
      role="dialog"
      aria-label="ぽん子に相談"
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 shrink-0"
        style={{
          background: "var(--md-surface-container)",
          boxShadow: "var(--md-elevation-1)",
        }}
      >
        <img src="/ponko.png" alt="ぽん子" className="w-8 h-8 ponko-jump" />
        <div className="flex-1">
          <p className="text-sm font-medium" style={{ color: "var(--md-on-surface)" }}>
            ぽん子に相談
          </p>
          <p className="text-[11px]" style={{ color: "var(--md-on-surface-variant)" }}>
            入力データをもとに回答します
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-sm font-medium px-3 py-1.5"
          style={{
            color: "var(--md-primary)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          閉じる
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" aria-live="polite">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}
          >
            {msg.role === "assistant" && (
              <img src="/ponko.png" alt="" className="w-6 h-6 shrink-0 mt-1" />
            )}
            <div
              className="max-w-[80%] px-4 py-2.5 text-sm whitespace-pre-wrap"
              style={{
                background: msg.role === "user"
                  ? "var(--md-primary)"
                  : "var(--md-surface-container)",
                color: msg.role === "user"
                  ? "var(--md-on-primary)"
                  : "var(--md-on-surface)",
                borderRadius: msg.role === "user"
                  ? "var(--md-shape-corner-lg) var(--md-shape-corner-lg) 4px var(--md-shape-corner-lg)"
                  : "var(--md-shape-corner-lg) var(--md-shape-corner-lg) var(--md-shape-corner-lg) 4px",
              }}
            >
              {msg.content || (loading && i === messages.length - 1 ? "..." : "")}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="shrink-0 px-4 py-3 flex gap-2 safe-bottom"
        style={{
          background: "var(--md-surface-container)",
          boxShadow: "var(--md-elevation-1)",
        }}
      >
        <input
          type="text"
          className="flex-1"
          placeholder="ぽん子に質問..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-4 py-2 text-sm font-medium shrink-0"
          style={{
            background: input.trim() ? "var(--md-primary)" : "var(--md-surface-container-high)",
            color: input.trim() ? "var(--md-on-primary)" : "var(--md-on-surface-variant)",
            borderRadius: "100px",
            border: "none",
            cursor: input.trim() ? "pointer" : "default",
          }}
        >
          送信
        </button>
      </div>
    </div>
  );
}
