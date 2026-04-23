"use client"

import { useState, useMemo, useCallback } from "react"
import type { HearingStats } from "@/lib/actions/hearing-stats"
import { getSections } from "@/lib/schema"
import { exportAsText, exportAsJson } from "@/lib/export"
import { buildFieldMappings } from "@/lib/dnaos-mapping"
import { submitToDnaOsLite, setStep2Unlocked, setVisibleCategories } from "@/lib/actions/hearing-data"
import type { ClinicMaster } from "@/lib/actions/clinics"
import {
  ChevronDown, ChevronUp, ArrowLeft, Upload, Send, Check, Loader2,
  FileText, FileJson, Link2, Lock, Unlock, Stethoscope,
} from "lucide-react"
import Icon, { normalizeIconName } from "@/components/Icon"

type IndustryType = "dental" | "corporate"

const INDUSTRY_LABELS: Record<IndustryType, string> = {
  dental: "歯科医院",
  corporate: "一般企業",
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  editing: { label: "入力中", color: "var(--md-on-surface-variant)", bg: "var(--md-surface-container-high)" },
  completed: { label: "入力完了", color: "var(--md-primary)", bg: "var(--md-primary-container)" },
  submitted: { label: "送信済み", color: "var(--md-tertiary)", bg: "var(--md-tertiary-container)" },
}

interface ClinicStats {
  clinic: ClinicMaster
  totalFields: number
  filledFields: number
  progressPct: number
  emptySections: string[]
  formData: Record<string, string>
  hearingStatus: string | null
  hearingUpdatedAt: string | null
  step2Unlocked: boolean
  visibleCategories: string[]
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`
}

export default function AdminDashboard({ clinics, hearingStats = [] }: { clinics: ClinicMaster[]; hearingStats?: HearingStats[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set())
  const [sendResults, setSendResults] = useState<Record<string, { ok: boolean; message: string }>>({})
  const [statusOverrides, setStatusOverrides] = useState<Record<string, string>>({})
  const [step2Overrides, setStep2Overrides] = useState<Record<string, boolean>>({})
  const [step2Toggling, setStep2Toggling] = useState<Set<string>>(new Set())
  const [categoriesOverrides, setCategoriesOverrides] = useState<Record<string, string[]>>({})
  const [categoriesSaving, setCategoriesSaving] = useState<Set<string>>(new Set())
  const [showCategories, setShowCategories] = useState<Set<string>>(new Set())

  const hearingMap = useMemo(() => {
    const map: Record<string, HearingStats> = {}
    for (const s of hearingStats) map[s.client_id] = s
    return map
  }, [hearingStats])

  const stats = useMemo(() => {
    return clinics.map((clinic): ClinicStats => {
      const industry = clinic.industry || "dental"
      const industrySections = getSections(industry)
      const allFields = industrySections.flatMap((s) => s.fields)
      const hearing = hearingMap[clinic.id]
      const formData = hearing?.form_data || {}

      const filled = allFields.filter((f) => formData[f.name]?.trim()).length
      const pct = allFields.length > 0 ? Math.round((filled / allFields.length) * 100) : 0

      const emptySections = industrySections
        .filter((s) => s.fields.every((f) => !formData[f.name]?.trim()))
        .map((s) => s.title)

      return {
        clinic, totalFields: allFields.length, filledFields: filled, progressPct: pct,
        emptySections, formData, hearingStatus: hearing?.status || null,
        hearingUpdatedAt: hearing?.updated_at || null, step2Unlocked: hearing?.step2_unlocked ?? false, visibleCategories: hearing?.visible_categories ?? [],
      }
    }).sort((a, b) => b.progressPct - a.progressPct)
  }, [clinics, hearingMap])

  const avgProgress = stats.length > 0 ? Math.round(stats.reduce((s, c) => s + c.progressPct, 0) / stats.length) : 0

  const handleDnaOsSend = useCallback(async (clinicStat: ClinicStats) => {
    const { clinic, formData, filledFields } = clinicStat
    const industry = clinic.industry || "dental"
    if (filledFields === 0) { setSendResults((prev) => ({ ...prev, [clinic.id]: { ok: false, message: "データなし" } })); return }
    if (sendingIds.has(clinic.id)) return
    setSendingIds((prev) => new Set(prev).add(clinic.id))
    setSendResults((prev) => { const n = { ...prev }; delete n[clinic.id]; return n })
    try {
      const sections = getSections(industry)
      const mappings = buildFieldMappings(sections)
      const result = await submitToDnaOsLite(clinic.id, formData, mappings)
      if ("error" in result) { setSendResults((prev) => ({ ...prev, [clinic.id]: { ok: false, message: result.error } })) }
      else { setStatusOverrides((prev) => ({ ...prev, [clinic.id]: "submitted" })); setSendResults((prev) => ({ ...prev, [clinic.id]: { ok: true, message: `${result.count}件送信完了` } })) }
    } catch { setSendResults((prev) => ({ ...prev, [clinic.id]: { ok: false, message: "送信失敗" } })) }
    finally { setSendingIds((prev) => { const n = new Set(prev); n.delete(clinic.id); return n }) }
  }, [sendingIds])

  const handleStep2Toggle = useCallback(async (clinicId: string, currentUnlocked: boolean) => {
    if (step2Toggling.has(clinicId)) return
    setStep2Toggling((prev) => new Set(prev).add(clinicId))
    const newVal = !currentUnlocked
    const result = await setStep2Unlocked(clinicId, newVal)
    if ("ok" in result) setStep2Overrides((prev) => ({ ...prev, [clinicId]: newVal }))
    setStep2Toggling((prev) => { const n = new Set(prev); n.delete(clinicId); return n })
  }, [step2Toggling])

  return (
    <main className="px-4 py-8 sm:py-12 max-w-2xl mx-auto">
      <a href="/" className="text-sm flex items-center gap-1 mb-4" style={{ color: "var(--md-primary)", textDecoration: "none" }}>
        <ArrowLeft size={20} /> トップに戻る
      </a>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <img src="/ponko.png" alt="" className="w-10 h-10" />
          <div>
            <h1 className="text-lg font-medium" style={{ color: "var(--md-on-surface)" }}>制作側ダッシュボード</h1>
            <p className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>{clinics.length} 医院</p>
          </div>
        </div>
        <a
          href="/admin/treatment-editor"
          className="text-xs font-medium px-3 py-2 flex items-center gap-1.5"
          style={{ background: "var(--md-surface-container)", color: "var(--md-on-surface)", borderRadius: "100px", border: "1px solid var(--md-outline-variant)", textDecoration: "none" }}
        >
          <Stethoscope size={14} /> 科目エディタ
        </a>
      </div>

      {stats.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div className="p-3 text-center" style={{ background: "var(--md-primary-container)", borderRadius: "var(--md-shape-corner-lg)" }}>
            <p className="text-2xl font-bold" style={{ color: "var(--md-primary)" }}>{stats.length}</p>
            <p className="text-[11px]" style={{ color: "var(--md-on-primary-container)" }}>医院数</p>
          </div>
          <div className="p-3 text-center" style={{ background: "var(--md-primary-container)", borderRadius: "var(--md-shape-corner-lg)" }}>
            <p className="text-2xl font-bold" style={{ color: "var(--md-primary)" }}>{avgProgress}%</p>
            <p className="text-[11px]" style={{ color: "var(--md-on-primary-container)" }}>平均進捗</p>
          </div>
        </div>
      )}

      <div className="space-y-2 mb-6">
        {stats.map((clinicStat) => {
          const { clinic, filledFields, totalFields, progressPct, emptySections, hearingUpdatedAt } = clinicStat
          const clinicKey = clinic.contract_no || clinic.id
          const industry = clinic.industry || "dental"
          const hearingStatus = statusOverrides[clinic.id] || clinicStat.hearingStatus
          const statusInfo = hearingStatus ? STATUS_LABELS[hearingStatus] : null
          const isSending = sendingIds.has(clinic.id)
          const result = sendResults[clinic.id]
          const isExpanded = expandedId === clinic.id
          const isStep2Unlocked = step2Overrides[clinic.id] ?? clinicStat.step2Unlocked
          const isStep2Toggling = step2Toggling.has(clinic.id)

          return (
            <div key={clinic.id} className="overflow-hidden" style={{ background: "var(--md-surface-container)", borderRadius: "var(--md-shape-corner-lg)", boxShadow: "var(--md-elevation-1)" }}>
              <button
                onClick={() => setExpandedId(isExpanded ? null : clinic.id)}
                className="w-full text-left p-4"
                style={{ background: "transparent", border: "none", cursor: "pointer" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center shrink-0" style={{ background: "var(--md-primary-container)", color: "var(--md-primary)", borderRadius: "var(--md-shape-corner-md)" }}>
                    <Icon name={normalizeIconName(clinic.icon_emoji)} size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">
                        {clinic.clinic_name}
                        <span className="text-[11px] font-normal ml-1.5 px-1.5 py-0.5" style={{ background: "var(--md-secondary-container)", color: "var(--md-on-secondary-container)", borderRadius: "100px" }}>
                          {INDUSTRY_LABELS[industry]}
                        </span>
                      </p>
                      <span className="text-xs font-bold ml-2" style={{ color: progressPct === 100 ? "var(--md-tertiary)" : "var(--md-primary)" }}>{progressPct}%</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 overflow-hidden" style={{ background: "var(--md-outline-variant)", borderRadius: "100px" }}>
                        <div className="h-full" style={{ width: `${progressPct}%`, background: progressPct === 100 ? "var(--md-tertiary)" : "var(--md-primary)", borderRadius: "100px" }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-[11px]" style={{ color: "var(--md-on-surface-variant)" }}>{filledFields}/{totalFields}項目</span>
                      {statusInfo && <span className="text-[11px] px-1.5 py-0.5" style={{ background: statusInfo.bg, color: statusInfo.color, borderRadius: "100px" }}>{statusInfo.label}</span>}
                      {hearingUpdatedAt && <span className="text-[11px]" style={{ color: "var(--md-on-surface-variant)" }}>更新 {formatDate(hearingUpdatedAt)}</span>}
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={20} className="shrink-0" style={{ color: "var(--md-on-surface-variant)" }} /> : <ChevronDown size={20} className="shrink-0" style={{ color: "var(--md-on-surface-variant)" }} />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3" style={{ borderTop: "1px solid var(--md-outline-variant)" }}>
                  {/* Step2 lock toggle */}
                  <div className="pt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isStep2Unlocked ? <Unlock size={16} style={{ color: "var(--md-tertiary)" }} /> : <Lock size={16} style={{ color: "var(--md-on-surface-variant)" }} />}
                      <span className="text-xs font-medium" style={{ color: isStep2Unlocked ? "var(--md-tertiary)" : "var(--md-on-surface-variant)" }}>
                        Step2 {isStep2Unlocked ? "解放中" : "ロック中"}
                      </span>
                    </div>
                    <button
                      onClick={() => handleStep2Toggle(clinic.id, isStep2Unlocked)}
                      disabled={isStep2Toggling}
                      className="text-xs font-medium px-3 py-1.5"
                      style={{
                        background: isStep2Unlocked ? "var(--md-surface-container-low)" : "var(--md-tertiary)",
                        color: isStep2Unlocked ? "var(--md-on-surface)" : "var(--md-on-primary)",
                        borderRadius: "100px",
                        border: isStep2Unlocked ? "1px solid var(--md-outline-variant)" : "none",
                        cursor: isStep2Toggling ? "wait" : "pointer",
                      }}
                    >
                      {isStep2Toggling ? <Loader2 size={12} className="animate-spin inline" /> : isStep2Unlocked ? "ロックする" : "解放する"}
                    </button>
                  </div>

                  {/* Treatment category selector */}
                  <TreatmentCategorySelector
                    clinicId={clinic.id}
                    industry={industry}
                    selected={categoriesOverrides[clinic.id] ?? clinicStat.visibleCategories}
                    isOpen={showCategories.has(clinic.id)}
                    isSaving={categoriesSaving.has(clinic.id)}
                    onToggleOpen={() => setShowCategories((prev) => {
                      const n = new Set(prev)
                      n.has(clinic.id) ? n.delete(clinic.id) : n.add(clinic.id)
                      return n
                    })}
                    onSave={async (cats) => {
                      setCategoriesSaving((prev) => new Set(prev).add(clinic.id))
                      const result = await setVisibleCategories(clinic.id, cats)
                      if ("ok" in result) setCategoriesOverrides((prev) => ({ ...prev, [clinic.id]: cats }))
                      setCategoriesSaving((prev) => { const n = new Set(prev); n.delete(clinic.id); return n })
                    }}
                  />

                  {emptySections.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-1.5" style={{ color: "var(--md-error)" }}>未入力（{emptySections.length}）</p>
                      <div className="flex flex-wrap gap-1">
                        {emptySections.map((s, i) => <span key={i} className="text-[11px] px-2 py-1" style={{ background: "var(--md-error-container)", color: "var(--md-error)", borderRadius: "100px" }}>{s}</span>)}
                      </div>
                    </div>
                  )}

                  {/* Section progress */}
                  <div>
                    <p className="text-xs font-medium mb-1.5" style={{ color: "var(--md-on-surface-variant)" }}>セクション別</p>
                    <div className="space-y-1">
                      {getSections(industry).map((sec) => {
                        const secFilled = sec.fields.filter((f) => clinicStat.formData[f.name]?.trim()).length
                        const secTotal = sec.fields.length
                        const secPct = secTotal > 0 ? Math.round((secFilled / secTotal) * 100) : 0
                        return (
                          <div key={sec.id} className="flex items-center gap-2">
                            <span className="w-5 flex items-center justify-center" style={{ color: "var(--md-on-surface-variant)" }}><Icon name={sec.icon} size={14} /></span>
                            <span className="text-[11px] flex-1 truncate" style={{ color: "var(--md-on-surface)" }}>{sec.title}</span>
                            <div className="w-16 h-1 overflow-hidden" style={{ background: "var(--md-outline-variant)", borderRadius: "100px" }}>
                              <div className="h-full" style={{ width: `${secPct}%`, background: secPct === 100 ? "var(--md-tertiary)" : "var(--md-primary)", borderRadius: "100px" }} />
                            </div>
                            <span className="text-[11px] w-8 text-right font-bold" style={{ color: secPct === 100 ? "var(--md-tertiary)" : "var(--md-on-surface-variant)" }}>{secPct}%</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-1">
                    {result && (
                      <div className="mb-2 p-2.5 text-xs" style={{ background: result.ok ? "var(--md-tertiary-container)" : "var(--md-error-container)", color: result.ok ? "var(--md-on-tertiary-container)" : "var(--md-on-error-container)", borderRadius: "var(--md-shape-corner-md)" }}>
                        {result.ok ? <Check size={14} className="inline mr-1" /> : null}{result.message}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <a href={`/clinic/${clinicKey}`} className="text-xs font-medium px-3 py-2 flex items-center gap-1" style={{ background: "var(--md-primary)", color: "var(--md-on-primary)", borderRadius: "100px", textDecoration: "none" }}>開く</a>
                      <button onClick={() => handleDnaOsSend(clinicStat)} disabled={isSending || filledFields === 0} className="text-xs font-medium px-3 py-2 flex items-center gap-1.5" style={{ background: hearingStatus === "submitted" ? "var(--md-surface-container-low)" : "var(--md-tertiary)", color: hearingStatus === "submitted" ? "var(--md-on-surface)" : "var(--md-on-primary)", borderRadius: "100px", border: hearingStatus === "submitted" ? "1px solid var(--md-outline-variant)" : "none", cursor: isSending || filledFields === 0 ? "not-allowed" : "pointer", opacity: filledFields === 0 ? 0.5 : 1 }}>
                        {isSending ? <><Loader2 size={14} className="animate-spin" /> 送信中</> : hearingStatus === "submitted" ? <><Upload size={14} /> 再送信</> : <><Send size={14} /> DNA OS</>}
                      </button>
                      <button onClick={() => exportAsText(clinicKey, clinicStat.formData, industry)} className="text-xs font-medium px-3 py-2 flex items-center gap-1" style={{ background: "var(--md-surface-container-low)", color: "var(--md-on-surface)", borderRadius: "100px", border: "1px solid var(--md-outline-variant)", cursor: "pointer" }}><FileText size={14} /> TXT</button>
                      <button onClick={() => exportAsJson(clinicKey, clinicStat.formData, industry)} className="text-xs font-medium px-3 py-2 flex items-center gap-1" style={{ background: "var(--md-surface-container-low)", color: "var(--md-on-surface)", borderRadius: "100px", border: "1px solid var(--md-outline-variant)", cursor: "pointer" }}><FileJson size={14} /> JSON</button>
                      <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/clinic/${clinicKey}`); alert("URLコピー済") }} className="text-xs font-medium px-3 py-2 flex items-center gap-1" style={{ background: "var(--md-surface-container-low)", color: "var(--md-on-surface)", borderRadius: "100px", border: "1px solid var(--md-outline-variant)", cursor: "pointer" }}><Link2 size={14} /> URL</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-xs text-center py-4" style={{ color: "var(--md-on-surface-variant)" }}>
        クリニックの追加・削除は kantsuku-hub から
      </p>
    </main>
  )
}

function TreatmentCategorySelector({
  clinicId,
  industry,
  selected,
  isOpen,
  isSaving,
  onToggleOpen,
  onSave,
}: {
  clinicId: string
  industry: string
  selected: string[]
  isOpen: boolean
  isSaving: boolean
  onToggleOpen: () => void
  onSave: (categories: string[]) => Promise<void>
}) {
  const [localSelected, setLocalSelected] = useState<string[]>(selected)
  const sections = getSections(industry as "dental" | "corporate")
  const treatmentSection = sections.find((s) => s.id === "treatment-menu")
  const categories = treatmentSection?.fields[0]?.checklistCategories || []

  // Sync when props change
  if (JSON.stringify(selected) !== JSON.stringify(localSelected) && !isOpen) {
    // Will sync on next render after close
  }

  function toggleCategory(name: string) {
    setLocalSelected((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    )
  }

  function selectAll() {
    setLocalSelected(categories.map((c) => c.name))
  }

  function deselectAll() {
    setLocalSelected([])
  }

  return (
    <div>
      <button
        onClick={() => {
          if (!isOpen) setLocalSelected(selected)
          onToggleOpen()
        }}
        className="w-full flex items-center justify-between py-2"
        style={{ background: "transparent", border: "none", cursor: "pointer" }}
      >
        <div className="flex items-center gap-2">
          <Stethoscope size={16} style={{ color: "var(--md-primary)" }} />
          <span className="text-xs font-medium" style={{ color: "var(--md-on-surface)" }}>
            診療科目（{selected.length}/{categories.length}）
          </span>
        </div>
        <span className="text-[11px]" style={{ color: "var(--md-on-surface-variant)" }}>
          {isOpen ? "閉じる" : "設定"}
        </span>
      </button>

      {isOpen && (
        <div className="mt-1 p-3" style={{ background: "var(--md-surface-container-low)", borderRadius: "var(--md-shape-corner-md)" }}>
          <div className="flex gap-2 mb-2">
            <button onClick={selectAll} className="text-[11px] px-2 py-1" style={{ color: "var(--md-primary)", background: "transparent", border: "1px solid var(--md-outline-variant)", borderRadius: "100px", cursor: "pointer" }}>全選択</button>
            <button onClick={deselectAll} className="text-[11px] px-2 py-1" style={{ color: "var(--md-on-surface-variant)", background: "transparent", border: "1px solid var(--md-outline-variant)", borderRadius: "100px", cursor: "pointer" }}>全解除</button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => {
              const isSelected = localSelected.includes(cat.name)
              return (
                <button
                  key={cat.name}
                  onClick={() => toggleCategory(cat.name)}
                  className="text-[11px] px-2.5 py-1.5 font-medium"
                  style={{
                    background: isSelected ? "var(--md-primary)" : "var(--md-surface-container)",
                    color: isSelected ? "var(--md-on-primary)" : "var(--md-on-surface-variant)",
                    borderRadius: "100px",
                    border: isSelected ? "none" : "1px solid var(--md-outline-variant)",
                    cursor: "pointer",
                  }}
                >
                  {cat.name}
                </button>
              )
            })}
          </div>
          <button
            onClick={async () => { await onSave(localSelected); onToggleOpen() }}
            disabled={isSaving}
            className="w-full mt-3 py-2 text-xs font-medium flex items-center justify-center gap-1.5"
            style={{ background: "var(--md-primary)", color: "var(--md-on-primary)", borderRadius: "100px", border: "none", cursor: isSaving ? "wait" : "pointer" }}
          >
            {isSaving ? <><Loader2 size={12} className="animate-spin" /> 保存中...</> : <><Check size={12} /> 保存</>}
          </button>
        </div>
      )}
    </div>
  )
}
