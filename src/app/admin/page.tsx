"use client";

import { useState, useEffect } from "react";
import { getAllClinics, addClinic, deleteClinic, type ClinicConfig } from "@/lib/clinics";

export default function AdminPage() {
  const [clinics, setClinics] = useState<ClinicConfig[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setClinics(getAllClinics());
  }, []);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const id = newId.trim().replace(/\s+/g, "_").toUpperCase();
    if (!id || !newName.trim()) {
      setError("IDと医院名は必須です");
      return;
    }
    try {
      addClinic({ id, name: newName.trim(), password: newPassword });
      setClinics(getAllClinics());
      setNewId("");
      setNewName("");
      setNewPassword("");
      setShowForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "追加に失敗しました");
    }
  }

  function handleDelete(id: string) {
    if (!confirm(`「${id}」を削除しますか？入力データは残ります。`)) return;
    deleteClinic(id);
    setClinics(getAllClinics());
  }

  return (
    <main className="px-4 py-8 sm:py-12 max-w-lg mx-auto">
      <a
        href="/"
        className="text-sm flex items-center gap-1 mb-4"
        style={{ color: "var(--md-primary)", textDecoration: "none" }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        トップに戻る
      </a>

      <div className="flex items-center gap-3 mb-6">
        <img src="/ponko.png" alt="ぽん子" className="w-10 h-10" />
        <div>
          <h1 className="text-lg font-medium" style={{ color: "var(--md-on-surface)" }}>
            クリニック管理
          </h1>
          <p className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
            クリニックの追加・削除ができます
          </p>
        </div>
      </div>

      {/* Clinic list */}
      <div className="space-y-2 mb-6">
        {clinics.map((clinic) => (
          <div
            key={clinic.id}
            className="flex items-center gap-3 p-4"
            style={{
              background: "var(--md-surface-container)",
              borderRadius: "var(--md-shape-corner-lg)",
              boxShadow: "var(--md-elevation-1)",
            }}
          >
            <div
              className="w-10 h-10 flex items-center justify-center text-lg font-bold shrink-0"
              style={{
                background: "var(--md-primary-container)",
                color: "var(--md-primary)",
                borderRadius: "var(--md-shape-corner-md)",
              }}
            >
              {clinic.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{clinic.name}</p>
              <p className="text-xs font-mono" style={{ color: "var(--md-on-surface-variant)" }}>
                {clinic.id} {clinic.password ? "🔒" : "🔓"}
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              <a
                href={`/clinic/${clinic.id}`}
                className="text-xs font-medium px-3 py-1.5"
                style={{
                  background: "var(--md-primary)",
                  color: "var(--md-on-primary)",
                  borderRadius: "100px",
                  textDecoration: "none",
                }}
              >
                開く
              </a>
              <button
                onClick={() => handleDelete(clinic.id)}
                className="text-xs font-medium px-3 py-1.5 transition-colors"
                style={{
                  background: "transparent",
                  color: "var(--md-error)",
                  borderRadius: "100px",
                  border: "1px solid var(--md-error)",
                  cursor: "pointer",
                }}
              >
                削除
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showForm ? (
        <form
          onSubmit={handleAdd}
          className="p-5 space-y-4"
          style={{
            background: "var(--md-surface-container)",
            borderRadius: "var(--md-shape-corner-xl)",
            boxShadow: "var(--md-elevation-2)",
          }}
        >
          <h3 className="font-medium text-sm" style={{ color: "var(--md-on-surface)" }}>
            新しいクリニックを追加
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--md-on-surface-variant)" }}>
                クリニックID（英数字）
              </label>
              <input
                type="text"
                className="w-full"
                placeholder="例：KEYAKI_DC"
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--md-on-surface-variant)" }}>
                医院名
              </label>
              <input
                type="text"
                className="w-full"
                placeholder="例：けやき歯科クリニック"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--md-on-surface-variant)" }}>
                パスワード（空欄ならパスワードなし）
              </label>
              <input
                type="text"
                className="w-full"
                placeholder="任意"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          {error && (
            <p className="text-xs" style={{ color: "var(--md-error)" }}>{error}</p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 text-sm font-medium"
              style={{
                background: "var(--md-primary)",
                color: "var(--md-on-primary)",
                borderRadius: "100px",
                border: "none",
                cursor: "pointer",
              }}
            >
              追加する
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(""); }}
              className="px-4 py-2.5 text-sm font-medium"
              style={{
                background: "transparent",
                color: "var(--md-on-surface-variant)",
                borderRadius: "100px",
                border: "1px solid var(--md-outline)",
                cursor: "pointer",
              }}
            >
              キャンセル
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 text-sm font-medium flex items-center justify-center gap-2"
          style={{
            background: "var(--md-primary)",
            color: "var(--md-on-primary)",
            borderRadius: "100px",
            border: "none",
            cursor: "pointer",
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          クリニックを追加
        </button>
      )}

      <p
        className="text-[11px] text-center mt-6"
        style={{ color: "var(--md-on-surface-variant)", }}
      >
        URLをクリニックに共有: /clinic/クリニックID
      </p>
    </main>
  );
}
