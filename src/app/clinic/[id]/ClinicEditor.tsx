"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { ChevronRight } from "lucide-react"
import { getSections, getSectionById, getDefaultValues } from "@/lib/schema"
import { loadClinicData, saveLastSection, getLastSection, isOnboardingDone, setOnboardingDone } from "@/lib/storage"
import { DEMO_DATA } from "@/lib/seed-data"
import { useAutoSave } from "@/hooks/useAutoSave"
import { exportAsJson, exportAsText } from "@/lib/export"
// buildFieldMappings moved to admin-only flow
import { saveSessionState } from "@/lib/actions/hearing-data"
import type { HearingSession } from "@/lib/actions/hearing-data"
import { showToast } from "@/components/Toast"
import Dashboard from "@/components/Dashboard"
import SectionForm from "@/components/SectionForm"
import AuthGate from "@/components/AuthGate"
import SaveIndicator from "@/components/SaveIndicator"
import ToastContainer from "@/components/Toast"
import Confetti from "@/components/Confetti"
import HamburgerMenu from "@/components/HamburgerMenu"
import Onboarding from "@/components/Onboarding"
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
  const [confettiTrigger, setConfettiTrigger] = useState(false)
  const [showWelcomeBack, setShowWelcomeBack] = useState(false)
  const [lastSectionName, setLastSectionName] = useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Supabase session takes priority
    if (initialSession?.onboardingDone) return false
    if (typeof window === "undefined") return false
    return !isOnboardingDone(clinicKey)
  })

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

  // section completion confetti
  const prevFilledRef = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const s of getSections(industry)) {
      counts[s.id] = s.fields.filter((f) => values[f.name]?.trim()).length
    }
    return counts
  }, [])

  useEffect(() => {
    if (!currentSection) return
    const section = getSectionById(currentSection)
    if (!section) return
    const filled = section.fields.filter((f) => values[f.name]?.trim()).length
    const total = section.fields.length
    if (filled === total && total > 0 && prevFilledRef[currentSection] < total) {
      setConfettiTrigger(true)
      showToast(`${section.icon} ${section.title} 完了！おめでとうございます！`)
      setTimeout(() => setConfettiTrigger(false), 100)
    }
    prevFilledRef[currentSection] = filled
  }, [values, currentSection])

  // DNA OS Lite submit removed — admin-only via /admin

  // Onboarding complete handler
  function handleOnboardingComplete() {
    setOnboardingDone(clinicKey)
    setShowOnboarding(false)
    if (clinic.id) {
      saveSessionState(clinic.id, { onboardingDone: true })
    }
  }

  const section = currentSection ? getSectionById(currentSection) : null

  return (
    <AuthGate clinic={clinic}>
      <main className={showMission ? "pb-20" : "px-4 py-8 sm:py-12 pb-20"} style={showMission ? { background: "#0a0a0a" } : undefined}>
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
          />
        ) : (
          <Dashboard
            values={values}
            onSelectSection={handleSectionChange}
            industry={industry}
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
      <Confetti trigger={confettiTrigger} />
      {showOnboarding && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}
      {showPresets && (
        <PresetModal
          onApply={(presetData) => setValues((prev) => ({ ...prev, ...presetData }))}
          onClose={() => setShowPresets(false)}
        />
      )}
    </AuthGate>
  )
}
