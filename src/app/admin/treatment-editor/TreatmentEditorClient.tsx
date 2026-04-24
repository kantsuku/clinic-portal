"use client"

import { useState, useCallback } from "react"
import type { TreatmentCategory, Subcategory } from "@/lib/actions/treatment-categories"
import { bulkSaveTreatmentCategories, updateTreatmentSubcategories } from "@/lib/actions/treatment-categories"
import {
  ArrowLeft, Loader2, Sparkles, Plus, Trash2, Check, ChevronDown, ChevronUp, Save, X,
} from "lucide-react"

interface SchemaCategory {
  name: string
  items: string[]
}

interface Props {
  initialCategories: TreatmentCategory[]
  schemaCategories: SchemaCategory[]
}

export default function TreatmentEditorClient({ initialCategories, schemaCategories }: Props) {
  const [categories, setCategories] = useState<TreatmentCategory[]>(initialCategories)
  const [selectedCat, setSelectedCat] = useState<string | null>(null)
  const [classifyingAll, setClassifyingAll] = useState(false)
  const [classifyingSingle, setClassifyingSingle] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  // Editing state for selected category
  const [editSubs, setEditSubs] = useState<Subcategory[]>([])
  const [dirty, setDirty] = useState(false)

  const selectedCategory = categories.find((c) => c.categoryName === selectedCat)
  const schemaForSelected = schemaCategories.find((c) => c.name === selectedCat)

  function selectCategory(name: string) {
    const cat = categories.find((c) => c.categoryName === name)
    setSelectedCat(name)
    setEditSubs(cat ? [...cat.subcategories.map((s) => ({ ...s, items: [...s.items] }))] : [])
    setDirty(false)
    setMessage(null)
  }

  // AI classify a single category
  const handleClassifySingle = useCallback(async () => {
    if (!selectedCat || !schemaForSelected || classifyingSingle) return
    setClassifyingSingle(true)
    setMessage(null)
    try {
      const res = await fetch("/api/classify-treatments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryName: selectedCat, items: schemaForSelected.items }),
      })
      if (!res.ok) throw new Error("API error")
      const data = await res.json()
      const subs: Subcategory[] = data.subcategories || []
      setEditSubs(subs)
      setDirty(true)
      setMessage({ ok: true, text: `${subs.length}個のサブカテゴリに分類しました` })
    } catch {
      setMessage({ ok: false, text: "AI分類に失敗しました" })
    } finally {
      setClassifyingSingle(false)
    }
  }, [selectedCat, schemaForSelected, classifyingSingle])

  // AI classify ALL categories
  const handleClassifyAll = useCallback(async () => {
    if (classifyingAll) return
    if (!confirm("全科目をAIで分類します。既存の分類は上書きされます。よろしいですか？")) return
    setClassifyingAll(true)
    setMessage(null)

    const results: { categoryName: string; subcategories: Subcategory[]; sortOrder: number }[] = []

    for (let i = 0; i < schemaCategories.length; i++) {
      const sc = schemaCategories[i]
      try {
        const res = await fetch("/api/classify-treatments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categoryName: sc.name, items: sc.items }),
        })
        if (!res.ok) continue
        const data = await res.json()
        results.push({
          categoryName: sc.name,
          subcategories: data.subcategories || [],
          sortOrder: i,
        })
        setMessage({ ok: true, text: `分類中... ${i + 1}/${schemaCategories.length} (${sc.name})` })
      } catch {
        // skip failed
      }
    }

    if (results.length > 0) {
      const saveResult = await bulkSaveTreatmentCategories(results)
      if ("ok" in saveResult) {
        setCategories(results.map((r) => ({
          id: "",
          categoryName: r.categoryName,
          subcategories: r.subcategories,
          sortOrder: r.sortOrder,
          updatedAt: new Date().toISOString(),
        })))
        setMessage({ ok: true, text: `${results.length}科目の分類を保存しました` })
        if (selectedCat) {
          const updated = results.find((r) => r.categoryName === selectedCat)
          if (updated) setEditSubs(updated.subcategories)
        }
      } else {
        setMessage({ ok: false, text: "保存に失敗しました" })
      }
    }
    setClassifyingAll(false)
  }, [classifyingAll, schemaCategories, selectedCat])

  // Save current category
  const handleSave = useCallback(async () => {
    if (!selectedCat || saving) return
    setSaving(true)
    const result = await updateTreatmentSubcategories(selectedCat, editSubs)
    if ("ok" in result) {
      setCategories((prev) => prev.map((c) =>
        c.categoryName === selectedCat ? { ...c, subcategories: editSubs } : c
      ))
      setDirty(false)
      setMessage({ ok: true, text: "保存しました" })
    } else {
      // If category doesn't exist yet, create it
      const sortOrder = schemaCategories.findIndex((c) => c.name === selectedCat)
      const createResult = await bulkSaveTreatmentCategories([{
        categoryName: selectedCat,
        subcategories: editSubs,
        sortOrder: sortOrder >= 0 ? sortOrder : 99,
      }])
      if ("ok" in createResult) {
        setCategories((prev) => {
          const exists = prev.find((c) => c.categoryName === selectedCat)
          if (exists) return prev.map((c) => c.categoryName === selectedCat ? { ...c, subcategories: editSubs } : c)
          return [...prev, { id: "", categoryName: selectedCat, subcategories: editSubs, sortOrder: sortOrder >= 0 ? sortOrder : 99, updatedAt: new Date().toISOString() }]
        })
        setDirty(false)
        setMessage({ ok: true, text: "保存しました" })
      } else {
        setMessage({ ok: false, text: "保存に失敗しました" })
      }
    }
    setSaving(false)
  }, [selectedCat, editSubs, saving, schemaCategories])

  // Subcategory editing helpers
  function addSubcategory() {
    setEditSubs((prev) => [...prev, { name: "", question: "", items: [] }])
    setDirty(true)
  }

  function removeSubcategory(idx: number) {
    setEditSubs((prev) => prev.filter((_, i) => i !== idx))
    setDirty(true)
  }

  function updateSubName(idx: number, name: string) {
    setEditSubs((prev) => prev.map((s, i) => i === idx ? { ...s, name } : s))
    setDirty(true)
  }

  function updateSubQuestion(idx: number, question: string) {
    setEditSubs((prev) => prev.map((s, i) => i === idx ? { ...s, question } : s))
    setDirty(true)
  }

  function addItem(subIdx: number) {
    setEditSubs((prev) => prev.map((s, i) =>
      i === subIdx ? { ...s, items: [...s.items, ""] } : s
    ))
    setDirty(true)
  }

  function updateItem(subIdx: number, itemIdx: number, value: string) {
    setEditSubs((prev) => prev.map((s, i) =>
      i === subIdx ? { ...s, items: s.items.map((item, j) => j === itemIdx ? value : item) } : s
    ))
    setDirty(true)
  }

  function removeItem(subIdx: number, itemIdx: number) {
    setEditSubs((prev) => prev.map((s, i) =>
      i === subIdx ? { ...s, items: s.items.filter((_, j) => j !== itemIdx) } : s
    ))
    setDirty(true)
  }

  function moveItem(subIdx: number, itemIdx: number, direction: "up" | "down") {
    const newIdx = direction === "up" ? itemIdx - 1 : itemIdx + 1
    setEditSubs((prev) => prev.map((s, i) => {
      if (i !== subIdx) return s
      const items = [...s.items]
      if (newIdx < 0 || newIdx >= items.length) return s
      const tmp = items[itemIdx]
      items[itemIdx] = items[newIdx]
      items[newIdx] = tmp
      return { ...s, items }
    }))
    setDirty(true)
  }

  function moveSubcategory(idx: number, direction: "up" | "down") {
    const newIdx = direction === "up" ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= editSubs.length) return
    setEditSubs((prev) => {
      const arr = [...prev]
      const tmp = arr[idx]
      arr[idx] = arr[newIdx]
      arr[newIdx] = tmp
      return arr
    })
    setDirty(true)
  }

  return (
    <main className="px-4 py-8 sm:py-12 max-w-4xl mx-auto">
      <a href="/admin" className="text-sm flex items-center gap-1 mb-4" style={{ color: "var(--md-primary)", textDecoration: "none" }}>
        <ArrowLeft size={20} /> ダッシュボードに戻る
      </a>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium" style={{ color: "var(--md-on-surface)" }}>
          診療科目エディタ
        </h1>
        <button
          onClick={handleClassifyAll}
          disabled={classifyingAll}
          className="text-xs font-medium px-4 py-2 flex items-center gap-1.5"
          style={{
            background: "var(--md-tertiary)",
            color: "var(--md-on-primary)",
            borderRadius: "100px",
            border: "none",
            cursor: classifyingAll ? "wait" : "pointer",
          }}
        >
          {classifyingAll ? <><Loader2 size={14} className="animate-spin" /> AI分類中...</> : <><Sparkles size={14} /> 全科目をAIで分類</>}
        </button>
      </div>

      {message && (
        <div className="mb-4 p-2.5 text-xs" style={{
          background: message.ok ? "var(--md-tertiary-container)" : "var(--md-error-container)",
          color: message.ok ? "var(--md-on-tertiary-container)" : "var(--md-on-error-container)",
          borderRadius: "var(--md-shape-corner-md)",
        }}>
          {message.ok ? <Check size={14} className="inline mr-1" /> : null}{message.text}
        </div>
      )}

      <div className="flex gap-4" style={{ minHeight: "60vh" }}>
        {/* Category list */}
        <div className="w-48 shrink-0 space-y-1 overflow-y-auto" style={{ maxHeight: "70vh" }}>
          {schemaCategories.map((sc) => {
            const hasSubs = categories.find((c) => c.categoryName === sc.name)?.subcategories?.length ?? 0
            const isActive = selectedCat === sc.name
            return (
              <button
                key={sc.name}
                onClick={() => selectCategory(sc.name)}
                className="w-full text-left text-xs px-3 py-2 flex items-center justify-between"
                style={{
                  background: isActive ? "var(--md-primary-container)" : "transparent",
                  color: isActive ? "var(--md-primary)" : "var(--md-on-surface)",
                  borderRadius: "var(--md-shape-corner-sm)",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <span className="truncate">{sc.name}</span>
                {hasSubs > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 shrink-0 ml-1" style={{
                    background: "var(--md-tertiary-container)",
                    color: "var(--md-tertiary)",
                    borderRadius: "100px",
                  }}>
                    {hasSubs}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Editor panel */}
        <div className="flex-1 min-w-0">
          {!selectedCat ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm" style={{ color: "var(--md-on-surface-variant)" }}>
                左から科目を選択してください
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-medium" style={{ color: "var(--md-on-surface)" }}>{selectedCat}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleClassifySingle}
                    disabled={classifyingSingle || !schemaForSelected}
                    className="text-[11px] font-medium px-3 py-1.5 flex items-center gap-1"
                    style={{
                      background: "var(--md-tertiary-container)",
                      color: "var(--md-tertiary)",
                      borderRadius: "100px",
                      border: "none",
                      cursor: classifyingSingle ? "wait" : "pointer",
                    }}
                  >
                    {classifyingSingle ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    AIで分類
                  </button>
                  {dirty && (
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="text-[11px] font-medium px-3 py-1.5 flex items-center gap-1"
                      style={{
                        background: "var(--md-primary)",
                        color: "var(--md-on-primary)",
                        borderRadius: "100px",
                        border: "none",
                        cursor: saving ? "wait" : "pointer",
                      }}
                    >
                      {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                      保存
                    </button>
                  )}
                </div>
              </div>

              {/* Source items (from schema) */}
              {schemaForSelected && (
                <div className="mb-4 p-3" style={{ background: "var(--md-surface-container-low)", borderRadius: "var(--md-shape-corner-md)" }}>
                  <p className="text-[11px] font-medium mb-1.5" style={{ color: "var(--md-on-surface-variant)" }}>
                    元の項目一覧（{schemaForSelected.items.length}件）
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {schemaForSelected.items.map((item) => (
                      <span key={item} className="text-[10px] px-2 py-0.5" style={{
                        background: "var(--md-surface-container)",
                        color: "var(--md-on-surface-variant)",
                        borderRadius: "100px",
                      }}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Subcategories editor */}
              <div className="space-y-3">
                {editSubs.map((sub, subIdx) => (
                  <div key={subIdx} className="p-3" style={{
                    background: "var(--md-surface-container)",
                    borderRadius: "var(--md-shape-corner-md)",
                    boxShadow: "var(--md-elevation-1)",
                  }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => moveSubcategory(subIdx, "up")} disabled={subIdx === 0} className="p-0.5" style={{ background: "transparent", border: "none", cursor: subIdx === 0 ? "default" : "pointer", opacity: subIdx === 0 ? 0.3 : 1, color: "var(--md-on-surface-variant)" }}>
                          <ChevronUp size={12} />
                        </button>
                        <button onClick={() => moveSubcategory(subIdx, "down")} disabled={subIdx === editSubs.length - 1} className="p-0.5" style={{ background: "transparent", border: "none", cursor: subIdx === editSubs.length - 1 ? "default" : "pointer", opacity: subIdx === editSubs.length - 1 ? 0.3 : 1, color: "var(--md-on-surface-variant)" }}>
                          <ChevronDown size={12} />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={sub.name}
                        onChange={(e) => updateSubName(subIdx, e.target.value)}
                        placeholder="サブカテゴリ名"
                        className="flex-1 text-sm font-medium px-2 py-1"
                        style={{ borderRadius: "var(--md-shape-corner-sm)" }}
                      />
                      <button onClick={() => removeSubcategory(subIdx)} className="p-1" style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--md-error)" }}>
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={sub.question}
                      onChange={(e) => updateSubQuestion(subIdx, e.target.value)}
                      placeholder="質問文（例：この分野で特に力を入れていることはありますか？）"
                      className="w-full text-xs px-2 py-1.5 mb-2"
                      style={{ borderRadius: "var(--md-shape-corner-sm)", color: "var(--md-primary)" }}
                    />

                    <div className="space-y-1">
                      {sub.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-center gap-1.5">
                          <div className="flex flex-col gap-0" style={{ flexShrink: 0 }}>
                            <button onClick={() => moveItem(subIdx, itemIdx, "up")} disabled={itemIdx === 0} className="p-0" style={{ background: "transparent", border: "none", cursor: itemIdx === 0 ? "default" : "pointer", opacity: itemIdx === 0 ? 0.3 : 1, color: "var(--md-on-surface-variant)", lineHeight: 0 }}>
                              <ChevronUp size={10} />
                            </button>
                            <button onClick={() => moveItem(subIdx, itemIdx, "down")} disabled={itemIdx === sub.items.length - 1} className="p-0" style={{ background: "transparent", border: "none", cursor: itemIdx === sub.items.length - 1 ? "default" : "pointer", opacity: itemIdx === sub.items.length - 1 ? 0.3 : 1, color: "var(--md-on-surface-variant)", lineHeight: 0 }}>
                              <ChevronDown size={10} />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => updateItem(subIdx, itemIdx, e.target.value)}
                            className="flex-1 text-xs px-2 py-1"
                            style={{ borderRadius: "var(--md-shape-corner-sm)" }}
                          />
                          <button onClick={() => removeItem(subIdx, itemIdx)} className="p-0.5" style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--md-error)" }}>
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => addItem(subIdx)}
                      className="mt-1.5 text-[11px] flex items-center gap-1 px-2 py-1"
                      style={{ background: "transparent", color: "var(--md-primary)", border: "1px dashed var(--md-outline-variant)", borderRadius: "var(--md-shape-corner-sm)", cursor: "pointer" }}
                    >
                      <Plus size={10} /> 項目追加
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={addSubcategory}
                className="w-full mt-3 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5"
                style={{
                  background: "transparent",
                  color: "var(--md-primary)",
                  borderRadius: "var(--md-shape-corner-md)",
                  border: "1px dashed var(--md-outline)",
                  cursor: "pointer",
                }}
              >
                <Plus size={14} /> サブカテゴリ追加
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
