"use client"

import { useState, useMemo, useCallback } from "react"
import type { HearingStats } from "@/lib/actions/hearing-stats"
import { getSections } from "@/lib/schema"
import { exportAsText, exportAsJson } from "@/lib/export"
import { buildFieldMappings } from "@/lib/dnaos-mapping"
import { submitToDnaOsLite, setStep2Unlocked, setUnlockedSteps, setVisibleCategories, setStepDeadlines } from "@/lib/actions/hearing-data"
import type { ClinicMaster } from "@/lib/actions/clinics"
import { setHearingPassword } from "@/lib/actions/clinics"
import {
  ChevronDown, ChevronUp, ArrowLeft, Upload, Send, Check, Loader2,
  FileText, FileJson, Link2, Lock, Unlock, Stethoscope, Copy, KeyRound, ExternalLink, AlertTriangle, Search, Calendar,
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
  unlockedSteps: number[]
  visibleCategories: string[]
  stepDeadlines: Record<string, string>
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
  const [stepsOverrides, setStepsOverrides] = useState<Record<string, number[]>>({})
  const [stepsToggling, setStepsToggling] = useState<Set<string>>(new Set())
  const [categoriesOverrides, setCategoriesOverrides] = useState<Record<string, string[]>>({})
  const [categoriesSaving, setCategoriesSaving] = useState<Set<string>>(new Set())
  const [showCategories, setShowCategories] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [deadlinesOverrides, setDeadlinesOverrides] = useState<Record<string, Record<string, string>>>({})
  const [deadlinesSaving, setDeadlinesSaving] = useState<Set<string>>(new Set())
  const [editingPw, setEditingPw] = useState<string | null>(null)
  const [pwInput, setPwInput] = useState("")
  const [pwSaving, setPwSaving] = useState(false)
  const [pwOverrides, setPwOverrides] = useState<Record<string, string>>({})

  function copyToClipboard(text: string, fieldId: string) {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldId)
    setTimeout(() => setCopiedField(null), 2000)
  }

  async function handleSavePassword(clinicId: string) {
    if (!pwInput.trim()) return
    setPwSaving(true)
    const result = await setHearingPassword(clinicId, pwInput)
    if ("ok" in result) {
      setPwOverrides((prev) => ({ ...prev, [clinicId]: pwInput.trim() }))
      setEditingPw(null)
      setPwInput("")
    }
    setPwSaving(false)
  }

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
        hearingUpdatedAt: hearing?.updated_at || null, step2Unlocked: hearing?.step2_unlocked ?? false, unlockedSteps: (hearing?.unlocked_steps as number[]) ?? [0], visibleCategories: hearing?.visible_categories ?? [], stepDeadlines: hearing?.step_deadlines ?? {},
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

  const handleDeadlineChange = useCallback(async (clinicId: string, step: number, date: string, currentDeadlines: Record<string, string>) => {
    if (deadlinesSaving.has(clinicId)) return
    setDeadlinesSaving((prev) => new Set(prev).add(clinicId))
    const newDeadlines = { ...currentDeadlines }
    if (date) {
      newDeadlines[String(step)] = date
    } else {
      delete newDeadlines[String(step)]
    }
    const result = await setStepDeadlines(clinicId, newDeadlines)
    if ("ok" in result) setDeadlinesOverrides((prev) => ({ ...prev, [clinicId]: newDeadlines }))
    setDeadlinesSaving((prev) => { const n = new Set(prev); n.delete(clinicId); return n })
  }, [deadlinesSaving])

  const handleStepToggle = useCallback(async (clinicId: string, step: number, currentSteps: number[]) => {
    if (stepsToggling.has(clinicId)) return
    setStepsToggling((prev) => new Set(prev).add(clinicId))
    const newSteps = currentSteps.includes(step)
      ? currentSteps.filter((s) => s !== step)
      : [...currentSteps, step].sort()
    const result = await setUnlockedSteps(clinicId, newSteps)
    if ("ok" in result) setStepsOverrides((prev) => ({ ...prev, [clinicId]: newSteps }))
    setStepsToggling((prev) => { const n = new Set(prev); n.delete(clinicId); return n })
  }, [stepsToggling])

  return (
    <main className="px-4 py-8 sm:py-12 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6 pt-2">
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

      {/* Search */}
      <div
        className="flex items-center gap-2 mb-4 px-3 py-2"
        style={{
          background: "var(--md-surface-container)",
          borderRadius: "var(--md-shape-corner-lg)",
          border: "1px solid var(--md-outline-variant)",
        }}
      >
        <Search size={16} style={{ color: "var(--md-on-surface-variant)" }} />
        <input
          type="text"
          className="flex-1 text-sm"
          placeholder="医院名で検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--md-on-surface)",
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-xs px-1.5"
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--md-on-surface-variant)" }}
          >
            &times;
          </button>
        )}
      </div>

      <div className="space-y-2 mb-6">
        {stats.filter((s) => !searchQuery || s.clinic.clinic_name.toLowerCase().includes(searchQuery.toLowerCase()) || (s.clinic.contract_no || "").toLowerCase().includes(searchQuery.toLowerCase())).map((clinicStat) => {
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
          const currentUnlockedSteps = stepsOverrides[clinic.id] ?? clinicStat.unlockedSteps
          const isStepsToggling = stepsToggling.has(clinic.id)
          const currentDeadlines = deadlinesOverrides[clinic.id] ?? clinicStat.stepDeadlines
          const isDeadlinesSaving = deadlinesSaving.has(clinic.id)

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
                  {/* Step lock toggles */}
                  <div className="pt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock size={14} style={{ color: "var(--md-on-surface-variant)" }} />
                      <span className="text-xs font-medium" style={{ color: "var(--md-on-surface-variant)" }}>フェーズロック</span>
                    </div>
                    <div className="flex gap-1.5">
                      {getSections(industry).reduce<number[]>((acc, s) => acc.includes(s.step) ? acc : [...acc, s.step], []).map((step) => {
                        const isUnlocked = currentUnlockedSteps.includes(step)
                        const stepLabels = ["はじめに", "Step1", "Step2"]
                        return (
                          <button
                            key={step}
                            onClick={() => handleStepToggle(clinic.id, step, currentUnlockedSteps)}
                            disabled={isStepsToggling}
                            className="text-[11px] font-medium px-3 py-1.5 flex items-center gap-1"
                            style={{
                              background: isUnlocked ? "var(--md-tertiary-container)" : "var(--md-surface-container-high)",
                              color: isUnlocked ? "var(--md-tertiary)" : "var(--md-on-surface-variant)",
                              borderRadius: "100px",
                              border: isUnlocked ? "1px solid var(--md-tertiary)" : "1px solid var(--md-outline-variant)",
                              cursor: isStepsToggling ? "wait" : "pointer",
                            }}
                          >
                            {isUnlocked ? <Unlock size={10} /> : <Lock size={10} />}
                            {stepLabels[step] || `Step${step}`}
                          </button>
                        )
                      })}
                    </div>

                    {/* Step deadlines */}
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Calendar size={12} style={{ color: "var(--md-on-surface-variant)" }} />
                        <span className="text-[11px]" style={{ color: "var(--md-on-surface-variant)" }}>記入期限</span>
                        {isDeadlinesSaving && <Loader2 size={10} className="animate-spin" style={{ color: "var(--md-on-surface-variant)" }} />}
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {getSections(industry).reduce<number[]>((acc, s) => acc.includes(s.step) ? acc : [...acc, s.step], []).map((step) => {
                          const stepLabels = ["はじめに", "Step1", "Step2"]
                          const deadline = currentDeadlines[String(step)] || ""
                          const isOverdue = deadline && new Date(deadline + "T23:59:59") < new Date()
                          return (
                            <div key={step} className="flex items-center gap-1">
                              <span className="text-[10px] w-12" style={{ color: "var(--md-on-surface-variant)" }}>{stepLabels[step] || `Step${step}`}</span>
                              <input
                                type="date"
                                value={deadline}
                                onChange={(e) => handleDeadlineChange(clinic.id, step, e.target.value, currentDeadlines)}
                                disabled={isDeadlinesSaving}
                                className="text-[11px] px-1.5 py-1"
                                style={{
                                  background: "var(--md-surface-container-high)",
                                  color: isOverdue ? "var(--md-error)" : "var(--md-on-surface)",
                                  border: isOverdue ? "1px solid var(--md-error)" : "1px solid var(--md-outline-variant)",
                                  borderRadius: "var(--md-shape-corner-sm)",
                                  cursor: isDeadlinesSaving ? "wait" : "pointer",
                                  outline: "none",
                                }}
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>
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

                  {/* Client share info */}
                  {(() => {
                    const currentPw = pwOverrides[clinic.id] ?? clinic.hearing_password
                    const isEditingThis = editingPw === clinic.id
                    return (
                      <div
                        className="p-3"
                        style={{
                          background: currentPw
                            ? "var(--md-surface-container-low)"
                            : "var(--md-error-container)",
                          borderRadius: "var(--md-shape-corner-md)",
                          border: currentPw
                            ? "1px solid var(--md-outline-variant)"
                            : "1px solid var(--md-error)",
                        }}
                      >
                        <p className="text-xs font-medium mb-2 flex items-center gap-1.5" style={{ color: "var(--md-on-surface)" }}>
                          <ExternalLink size={14} /> クライアント共有
                        </p>

                        {/* URL */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[11px] shrink-0 w-7" style={{ color: "var(--md-on-surface-variant)" }}>URL</span>
                          <code
                            className="text-[11px] flex-1 truncate px-2 py-1"
                            style={{
                              background: "var(--md-surface-container-high)",
                              borderRadius: "var(--md-shape-corner-sm)",
                              color: "var(--md-on-surface)",
                            }}
                          >
                            {typeof window !== "undefined" ? `${window.location.origin}/clinic/${clinicKey}` : `/clinic/${clinicKey}`}
                          </code>
                          <button
                            onClick={() => copyToClipboard(`${window.location.origin}/clinic/${clinicKey}`, `url-${clinic.id}`)}
                            className="shrink-0 p-1.5"
                            style={{ background: "transparent", border: "1px solid var(--md-outline-variant)", borderRadius: "var(--md-shape-corner-sm)", cursor: "pointer", color: "var(--md-on-surface-variant)" }}
                          >
                            {copiedField === `url-${clinic.id}` ? <Check size={12} style={{ color: "var(--md-tertiary)" }} /> : <Copy size={12} />}
                          </button>
                        </div>

                        {/* Password */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] shrink-0 w-7" style={{ color: "var(--md-on-surface-variant)" }}>PW</span>
                          {isEditingThis ? (
                            <>
                              <input
                                type="text"
                                className="text-[11px] flex-1 px-2 py-1"
                                placeholder="パスワードを入力"
                                value={pwInput}
                                onChange={(e) => setPwInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSavePassword(clinic.id) } }}
                                autoFocus
                                style={{
                                  background: "var(--md-surface-container-high)",
                                  border: "1px solid var(--md-primary)",
                                  borderRadius: "var(--md-shape-corner-sm)",
                                  color: "var(--md-on-surface)",
                                  outline: "none",
                                }}
                              />
                              <button
                                onClick={() => handleSavePassword(clinic.id)}
                                disabled={pwSaving || !pwInput.trim()}
                                className="shrink-0 p-1.5"
                                style={{ background: "var(--md-primary)", border: "none", borderRadius: "var(--md-shape-corner-sm)", cursor: pwSaving || !pwInput.trim() ? "not-allowed" : "pointer", color: "var(--md-on-primary)" }}
                              >
                                {pwSaving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                              </button>
                              <button
                                onClick={() => { setEditingPw(null); setPwInput("") }}
                                className="shrink-0 p-1.5"
                                style={{ background: "transparent", border: "1px solid var(--md-outline-variant)", borderRadius: "var(--md-shape-corner-sm)", cursor: "pointer", color: "var(--md-on-surface-variant)" }}
                              >
                                &times;
                              </button>
                            </>
                          ) : currentPw ? (
                            <>
                              <code
                                className="text-[11px] flex-1 px-2 py-1"
                                style={{
                                  background: "var(--md-surface-container-high)",
                                  borderRadius: "var(--md-shape-corner-sm)",
                                  color: "var(--md-on-surface)",
                                }}
                              >
                                {currentPw}
                              </code>
                              <button
                                onClick={() => copyToClipboard(currentPw, `pw-${clinic.id}`)}
                                className="shrink-0 p-1.5"
                                style={{ background: "transparent", border: "1px solid var(--md-outline-variant)", borderRadius: "var(--md-shape-corner-sm)", cursor: "pointer", color: "var(--md-on-surface-variant)" }}
                              >
                                {copiedField === `pw-${clinic.id}` ? <Check size={12} style={{ color: "var(--md-tertiary)" }} /> : <Copy size={12} />}
                              </button>
                              <button
                                onClick={() => { setEditingPw(clinic.id); setPwInput(currentPw) }}
                                className="shrink-0 text-[11px] px-2 py-1"
                                style={{ background: "transparent", border: "1px solid var(--md-outline-variant)", borderRadius: "var(--md-shape-corner-sm)", cursor: "pointer", color: "var(--md-on-surface-variant)" }}
                              >
                                変更
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="text-[11px] flex items-center gap-1" style={{ color: "var(--md-error)" }}>
                                <AlertTriangle size={12} /> 未設定
                              </span>
                              <button
                                onClick={() => { setEditingPw(clinic.id); setPwInput("") }}
                                className="shrink-0 text-[11px] font-medium px-2.5 py-1"
                                style={{ background: "var(--md-primary)", color: "var(--md-on-primary)", border: "none", borderRadius: "100px", cursor: "pointer" }}
                              >
                                設定する
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })()}

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
