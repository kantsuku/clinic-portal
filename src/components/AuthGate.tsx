"use client"

import { useState } from "react"
import { saveAuthFlag, isAuthenticated } from "@/lib/storage"
import type { ClinicMaster } from "@/lib/actions/clinics"

interface AuthGateProps {
  clinic: ClinicMaster
  children: React.ReactNode
}

export default function AuthGate({ clinic, children }: AuthGateProps) {
  const clinicKey = clinic.contract_no || clinic.id
  const [authed, setAuthed] = useState(() => {
    if (!clinic.hearing_password) return true
    return isAuthenticated(clinicKey)
  })
  const [input, setInput] = useState("")
  const [error, setError] = useState(false)

  if (authed) return <>{children}</>

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!clinic.hearing_password || clinic.hearing_password === input) {
      saveAuthFlag(clinicKey)
      setAuthed(true)
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
        className="w-full max-w-sm p-8 text-center"
        style={{
          background: "var(--md-surface-container)",
          borderRadius: "var(--md-shape-corner-xl)",
          boxShadow: "var(--md-elevation-2)",
        }}
      >
        <img src="/ponko.png" alt="ぽん子" className="w-16 h-16 mx-auto mb-4 ponko-jump" />
        <h1
          className="text-lg font-medium mb-1"
          style={{ color: "var(--md-on-surface)" }}
        >
          {clinic.clinic_name}
        </h1>
        <p
          className="text-sm mb-6"
          style={{ color: "var(--md-on-surface-variant)" }}
        >
          パスワードを入力してください
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
            className="w-full py-3 text-sm font-medium"
            style={{
              background: "var(--md-primary)",
              color: "var(--md-on-primary)",
              borderRadius: "100px",
              border: "none",
              cursor: "pointer",
            }}
          >
            はじめる
          </button>
        </form>
      </div>
    </div>
  )
}
