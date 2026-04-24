"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { ChevronRight } from "lucide-react"
import { getSections, getSectionById, getDefaultValues } from "@/lib/schema"
import { loadClinicData, saveLastSection, getLastSection } from "@/lib/storage"
import { DEMO_DATA } from "@/lib/seed-data"
import { useAutoSave } from "@/hooks/useAutoSave"
import { exportAsJson, exportAsText } from "@/lib/export"
// buildFieldMappings moved to admin-only flow
import { saveSessionState } from "@/lib/actions/hearing-data"
import type { HearingSession } from "@/lib/actions/hearing-data"
import Dashboard from "@/components/Dashboard"
import SectionForm from "@/components/SectionForm"
import AuthGate from "@/components/AuthGate"
import SaveIndicator from "@/components/SaveIndicator"
import ToastContainer from "@/components/Toast"
import HamburgerMenu from "@/components/HamburgerMenu"
import MissionBuilder from "@/components/MissionBuilder"
import PresetModal from "@/components/PresetModal"
// DnaOsSendButton removed — DNA OS submission is admin-only
import type { ClinicMaster } from "@/lib/actions/clinics"

interface ClinicEditorProps {
  clinic: ClinicMaster
  initialData: Record<string, string> | null
  initialSession: HearingSession | null
}

export default function ClinicEditor({ clinic, initialData, initialSession }: ClinicEditorProps) {
  const clinicKey = clinic.contract_no || clinic.id
  const industry = clinic.industry || "dental"

  const [currentSection, setCurrentSection] = useState<string | null>(null)
  const [values, setValues] = useState<Record<string, string>>(() => {
    const defaults = getDefaultValues(industry)

    // Priority: Supabase > localStorage > demo seed > defaults
    if (initialData && Object.keys(initialData).length > 0) return { ...defaults, ...initialData }

    if (typeof window !== "undefined") {
      const localSaved = loadClinicData(clinicKey)
      if (localSaved) return { ...defaults, ...localSaved.data }
    }

    if (clinicKey === "demo") return { ...defaults, ...DEMO_DATA }
    return defaults
  })
  const [showPresets, setShowPresets] = useState(false)
  const [showMission, setShowMission] = useState(false)
  const [showWelcomeBack, setShowWelcomeBack] = useState(false)
  const [lastSectionName, setLastSectionName] = useState<string | null>(null)
  // AI advice per section (kept in memory, not persisted)
  const [adviceMap, setAdviceMap] = useState<Record<string, string>>({})
  const [adviceLoading, setAdviceLoading] = useState(false)

  const handleRequestAdvice = useCallback(async (sectionId: string, sectionTitle: string, fields: { label: string; value: string }[], allValues: Record<string, string>) => {
    if (adviceLoading) return
    setAdviceLoading(true)
    setAdviceMap((prev) => ({ ...prev, [sectionId]: "" }))

    // Build context from other sections (basic info, director, etc.)
    const allSections = getSections(industry)
    const contextFields: { label: string; value: string }[] = []
    for (const sec of allSections) {
      if (sec.id === sectionId) continue
      for (const f of sec.fields) {
        const val = allValues[f.name]?.trim()
        if (val) contextFields.push({ label: `${sec.title} > ${f.label}`, value: val })
      }
    }

    try {
      const res = await fetch("/api/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionTitle, fields, context: contextFields }),
      })

      if (!res.ok) throw new Error("API error")

      const reader = res.body?.getReader()
      if (!reader) throw new Error("No reader")

      const decoder = new TextDecoder()
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n")
        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const parsed = JSON.parse(line.slice(6))
              if (parsed.text) {
                accumulated += parsed.text
                setAdviceMap((prev) => ({ ...prev, [sectionId]: accumulated }))
              }
            } catch {}
          }
        }
      }
    } catch {
      setAdviceMap((prev) => ({ ...prev, [sectionId]: "アドバイスの取得に失敗しました。もう一度お試しください。" }))
    } finally {
      setAdviceLoading(false)
    }
  }, [adviceLoading])

  const handleClearAdvice = useCallback((sectionId: string) => {
    setAdviceMap((prev) => {
      const next = { ...prev }
      delete next[sectionId]
      return next
    })
  }, [])

  // auto-save to both localStorage and Supabase
  const { lastSaved, isDirty } = useAutoSave({
    clinicId: clinicKey,
    data: values,
    clientUuid: clinic.id,
    industry,
  })

  // welcome back guide (Supabase session > localStorage)
  useEffect(() => {
    if (typeof window === "undefined") return
    const lastId = initialSession?.lastSectionId || getLastSection(clinicKey)
    if (lastId) {
      const sec = getSectionById(lastId)
      if (sec) {
        setLastSectionName(sec.title)
        setShowWelcomeBack(true)
        setTimeout(() => setShowWelcomeBack(false), 8000)
      }
    }
  }, [clinicKey, initialSession])

  function handleSectionChange(sectionId: string | null) {
    setCurrentSection(sectionId)
    if (sectionId) {
      saveLastSection(clinicKey, sectionId)
      // Save to Supabase too
      if (clinic.id) {
        saveSessionState(clinic.id, { lastSectionId: sectionId })
      }
    }
  }

  const handleFieldChange = useCallback((fieldName: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }))
  }, [])

  // DNA OS Lite submit removed — admin-only via /admin

  const section = currentSection ? getSectionById(currentSection) : null

  return (
    <AuthGate clinic={clinic}>
      <main className={showMission ? "pb-20" : "px-4 py-8 sm:py-12 pb-20"} style={showMission ? { background: "#0a0a0a" } : undefined}>
        {/* Clinic name bar */}
        {!showMission && (
          <div className="max-w-lg mx-auto mb-4 flex items-center gap-2.5 px-1">
            <img src="/ponko.png" alt="" className="w-6 h-6 shrink-0" />
            <p className="text-xs font-medium truncate" style={{ color: "var(--md-on-surface-variant)" }}>
              {clinic.clinic_name}
            </p>
          </div>
        )}

        {/* welcome back banner */}
        {showWelcomeBack && !currentSection && lastSectionName && (
          <div
            className="max-w-lg mx-auto mb-4 flex items-center gap-3 p-3 cursor-pointer animate-slide-down"
            style={{
              background: "var(--md-primary-container)",
              borderRadius: "var(--md-shape-corner-lg)",
            }}
            onClick={() => {
              const lastId = initialSession?.lastSectionId || getLastSection(clinicKey)
              if (lastId) handleSectionChange(lastId)
              setShowWelcomeBack(false)
            }}
          >
            <img src="/ponko.png" alt="" className="w-8 h-8 ponko-jump" />
            <div className="flex-1">
              <p className="text-xs font-medium" style={{ color: "var(--md-primary)" }}>
                おかえりなさい！
              </p>
              <p className="text-xs" style={{ color: "var(--md-on-primary-container)" }}>
                前回は「{lastSectionName}」を編集してましたよ！続きからどうぞ！
              </p>
            </div>
            <ChevronRight size={20} className="shrink-0" style={{ color: "var(--md-primary)" }} />
          </div>
        )}

        {showMission ? (
          <MissionBuilder
            clinicId={clinicKey}
            clientUuid={clinic.id}
            onComplete={(result) => {
              setValues((prev) => ({ ...prev, philosophy: result }))
              setShowMission(false)
            }}
            onBack={() => setShowMission(false)}
            initialDraft={initialSession?.missionDraft}
          />
        ) : section ? (
          <SectionForm
            section={section}
            values={values}
            onChange={handleFieldChange}
            onBack={() => handleSectionChange(null)}
            onNavigate={handleSectionChange}
            industry={industry}
            advice={adviceMap[section.id]}
            adviceLoading={adviceLoading}
            onRequestAdvice={handleRequestAdvice}
            onClearAdvice={handleClearAdvice}
            visibleCategories={initialSession?.visibleCategories}
          />
        ) : (
          <Dashboard
            values={values}
            onSelectSection={handleSectionChange}
            industry={industry}
            step2Unlocked={initialSession?.step2Unlocked}
            unlockedSteps={initialSession?.unlockedSteps}
            onOpenMissionBuilder={() => setShowMission(true)}
          />
        )}
      </main>

      <HamburgerMenu
        clinicId={clinicKey}
        onOpenPresets={() => setShowPresets(true)}
        onOpenMissionBuilder={() => setShowMission(true)}
        onExportText={() => exportAsText(clinicKey, values, industry)}
        onExportJson={() => exportAsJson(clinicKey, values, industry)}
      />
      <SaveIndicator lastSaved={lastSaved} isDirty={isDirty} />
      <ToastContainer />
      {showPresets && (
        <PresetModal
          onApply={(presetData) => setValues((prev) => ({ ...prev, ...presetData }))}
          onClose={() => setShowPresets(false)}
        />
      )}
    </AuthGate>
  )
}
