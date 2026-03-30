"use client";

import { useState, useRef, useEffect } from "react";
import { sections } from "@/lib/schema";

interface PonkoChatProps {
  values: Record<string, string>;
  onClose: () => void;
  /** フィールドに値を反映するコールバック */
  onApplyToField?: (fieldName: string, value: string) => void;
  /** 反映後にセクションを開くコールバック */
  onNavigateToSection?: (sectionId: string) => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

/** textareaフィールドのみ抽出（反映先候補） */
const APPLY_TARGETS = sections.flatMap((s) =>
  s.fields
    .filter((f) => f.type === "textarea" || f.type === "repeater")
    .map((f) => ({
      fieldName: f.name,
      label: f.label,
      sectionId: s.id,
      sectionTitle: s.title,
      icon: s.icon,
    }))
);

export default function PonkoChat({
  values,
  onClose,
  onApplyToField,
  onNavigateToSection,
}: PonkoChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "何でも聞いてくださいね！入力した内容について質問したり、「うちの強みって何？」「キャッチコピー考えて」とか、何でもOKですよ！\n\n回答が良かったら、そのまま入力項目に反映できますよ！",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [applyingIdx, setApplyingIdx] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
        {
          role: "assistant",
          content: "ごめんなさい、エラーが発生しました...もう一度試してみてください！",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleApply(msgIdx: number, fieldName: string, sectionId: string) {
    const msg = messages[msgIdx];
    if (!msg || !onApplyToField) return;

    const existing = values[fieldName] || "";
    const newValue = existing
      ? `${existing}\n\n${msg.content}`
      : msg.content;

    onApplyToField(fieldName, newValue);
    setApplyingIdx(null);

    // 反映完了メッセージ
    const target = APPLY_TARGETS.find((t) => t.fieldName === fieldName);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `「${target?.label}」に反映しました！${onNavigateToSection ? "確認しに行きますか？" : ""}`,
      },
    ]);

    // セクションに飛ぶ導線
    if (onNavigateToSection) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            role: "assistant",
            content: `「${target?.label}」に反映しました！`,
          },
        ]);
      }, 0);
    }
  }

  const filteredTargets = searchQuery
    ? APPLY_TARGETS.filter(
        (t) =>
          t.label.includes(searchQuery) ||
          t.sectionTitle.includes(searchQuery)
      )
    : APPLY_TARGETS;

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
            回答をそのまま入力項目に反映できます
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
          <div key={i}>
            <div
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}
            >
              {msg.role === "assistant" && (
                <img src="/ponko.png" alt="" className="w-6 h-6 shrink-0 mt-1" />
              )}
              <div
                className="max-w-[80%] px-4 py-2.5 text-sm whitespace-pre-wrap"
                style={{
                  background:
                    msg.role === "user"
                      ? "var(--md-primary)"
                      : "var(--md-surface-container)",
                  color:
                    msg.role === "user"
                      ? "var(--md-on-primary)"
                      : "var(--md-on-surface)",
                  borderRadius:
                    msg.role === "user"
                      ? "var(--md-shape-corner-lg) var(--md-shape-corner-lg) 4px var(--md-shape-corner-lg)"
                      : "var(--md-shape-corner-lg) var(--md-shape-corner-lg) var(--md-shape-corner-lg) 4px",
                }}
              >
                {msg.content || (loading && i === messages.length - 1 ? "..." : "")}
              </div>
            </div>

            {/* 反映ボタン（アシスタントの完了メッセージに表示） */}
            {msg.role === "assistant" &&
              msg.content &&
              !loading &&
              i > 0 &&
              onApplyToField &&
              msg.content.length > 20 &&
              !msg.content.includes("反映しました") && (
                <div className="ml-8 mt-1.5">
                  {applyingIdx === i ? (
                    /* フィールド選択UI */
                    <div
                      className="p-3 space-y-2"
                      style={{
                        background: "var(--md-surface-container)",
                        borderRadius: "var(--md-shape-corner-md)",
                        boxShadow: "var(--md-elevation-1)",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <p
                          className="text-xs font-medium"
                          style={{ color: "var(--md-primary)" }}
                        >
                          どの項目に反映しますか？
                        </p>
                        <button
                          onClick={() => setApplyingIdx(null)}
                          className="text-xs px-2 py-1"
                          style={{
                            color: "var(--md-on-surface-variant)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          戻る
                        </button>
                      </div>
                      <input
                        type="text"
                        className="w-full text-xs"
                        placeholder="項目名で検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ padding: "8px 12px" }}
                      />
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {filteredTargets.map((target) => (
                          <button
                            key={target.fieldName}
                            onClick={() =>
                              handleApply(i, target.fieldName, target.sectionId)
                            }
                            className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 min-h-[40px]"
                            style={{
                              background: "transparent",
                              color: "var(--md-on-surface)",
                              border: "none",
                              borderRadius: "var(--md-shape-corner-sm)",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                "var(--md-surface-container-low)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                          >
                            <span>{target.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{target.label}</p>
                              <p
                                className="text-[11px] truncate"
                                style={{ color: "var(--md-on-surface-variant)" }}
                              >
                                {target.sectionTitle}
                              </p>
                            </div>
                            {values[target.fieldName]?.trim() && (
                              <span
                                className="text-[11px] px-1.5 py-0.5 shrink-0"
                                style={{
                                  background: "var(--md-secondary-container)",
                                  color: "var(--md-on-secondary-container)",
                                  borderRadius: "100px",
                                }}
                              >
                                追記
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* 反映ボタン */
                    <button
                      onClick={() => {
                        setApplyingIdx(i);
                        setSearchQuery("");
                      }}
                      className="text-xs font-medium px-3 py-1.5 flex items-center gap-1.5"
                      style={{
                        background: "var(--md-tertiary-container)",
                        color: "var(--md-tertiary)",
                        borderRadius: "100px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      この回答を項目に反映する
                    </button>
                  )}
                </div>
              )}
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
          className="px-4 py-2 text-sm font-medium shrink-0 min-h-[44px]"
          style={{
            background: input.trim()
              ? "var(--md-primary)"
              : "var(--md-surface-container-high)",
            color: input.trim()
              ? "var(--md-on-primary)"
              : "var(--md-on-surface-variant)",
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
