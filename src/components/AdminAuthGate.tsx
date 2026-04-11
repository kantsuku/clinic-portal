"use client"

import { useState } from "react"

const STORAGE_KEY = "admin_auth"

function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return sessionStorage.getItem(STORAGE_KEY) === "1"
}

function saveAdminAuth() {
  sessionStorage.setItem(STORAGE_KEY, "1")
}

interface AdminAuthGateProps {
  children: React.ReactNode
}

export default function AdminAuthGate({ children }: AdminAuthGateProps) {
  const [authed, setAuthed] = useState(() => isAdminAuthenticated())
  const [input, setInput] = useState("")
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  if (authed) return <>{children}</>

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(false)

    try {
      const res = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: input }),
      })
      if (res.ok) {
        saveAdminAuth()
        setAuthed(true)
      } else {
        setError(true)
        setTimeout(() => setError(false), 2000)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--md-surface)" }}>
      <div
        className="w-full max-w-sm p-8 text-center"
        style={{
          background: "var(--md-surface-container)",
          borderRadius: "var(--md-shape-corner-xl)",
          boxShadow: "var(--md-elevation-2)",
        }}
      >
        <img src="/ponko.png" alt="ぽん子" className="w-16 h-16 mx-auto mb-4" />
        <h1
          className="text-lg font-medium mb-1"
          style={{ color: "var(--md-on-surface)" }}
        >
          管理画面
        </h1>
        <p
          className="text-sm mb-6"
          style={{ color: "var(--md-on-surface-variant)" }}
        >
          管理者パスワードを入力してください
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            className="w-full text-center"
            placeholder="パスワード"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
            style={{
              borderColor: error ? "var(--md-error)" : undefined,
            }}
          />
          {error && (
            <p className="text-xs" style={{ color: "var(--md-error)" }}>
              パスワードが違います
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !input}
            className="w-full py-3 text-sm font-medium"
            style={{
              background: loading ? "var(--md-surface-container-high)" : "var(--md-primary)",
              color: "var(--md-on-primary)",
              borderRadius: "100px",
              border: "none",
              cursor: loading ? "wait" : "pointer",
              opacity: !input ? 0.5 : 1,
            }}
          >
            {loading ? "確認中..." : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  )
}
