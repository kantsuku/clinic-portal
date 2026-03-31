"use client";

import { useState, useCallback, useEffect, useMemo, use } from "react";
import { getSections, getSteps, getSectionById, getDefaultValues } from "@/lib/schema";
import { getClinicConfig } from "@/lib/clinics";
import { loadClinicData, saveLastSection, getLastSection, isOnboardingDone, setOnboardingDone } from "@/lib/storage";
import { DEMO_DATA } from "@/lib/seed-data";
import { useAutoSave } from "@/hooks/useAutoSave";
import { exportAsJson, exportAsText } from "@/lib/export";
import Dashboard from "@/components/Dashboard";
import SectionForm from "@/components/SectionForm";
import AuthGate from "@/components/AuthGate";
import SaveIndicator from "@/components/SaveIndicator";
import ToastContainer, { showToast } from "@/components/Toast";
import Confetti from "@/components/Confetti";
import HamburgerMenu from "@/components/HamburgerMenu";
import Onboarding from "@/components/Onboarding";
import MissionBuilder from "@/components/MissionBuilder";
import PresetModal from "@/components/PresetModal";

export default function ClinicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: clinicId } = use(params);
  const clinic = getClinicConfig(clinicId);

  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return getDefaultValues(clinic?.industry);
    const saved = loadClinicData(clinicId);
    if (saved) return { ...getDefaultValues(clinic?.industry), ...saved.data };
    // デモ医院はシードデータを初期表示
    if (clinicId === "demo") return { ...getDefaultValues(clinic?.industry), ...DEMO_DATA };
    return getDefaultValues(clinic?.industry);
  });
  const [showPresets, setShowPresets] = useState(false);
  const [showMissionBuilder, setShowMissionBuilder] = useState(false);
  const [showMission, setShowMission] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [lastSectionName, setLastSectionName] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === "undefined") return false;
    return !isOnboardingDone(clinicId);
  });

  // 自動保存
  const { lastSaved, isDirty } = useAutoSave({ clinicId, data: values });

  // 途中復帰ガイド
  useEffect(() => {
    if (typeof window === "undefined") return;
    const lastId = getLastSection(clinicId);
    if (lastId) {
      const sec = getSectionById(lastId);
      if (sec) {
        setLastSectionName(sec.title);
        setShowWelcomeBack(true);
        setTimeout(() => setShowWelcomeBack(false), 8000);
      }
    }
  }, [clinicId]);

  // セクション変更時に保存
  function handleSectionChange(sectionId: string | null) {
    setCurrentSection(sectionId);
    if (sectionId) saveLastSection(clinicId, sectionId);
  }

  const handleFieldChange = useCallback((fieldName: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }));
  }, []);

  // セクション完了検知 → 紙吹雪
  const prevFilledRef = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of getSections(clinic?.industry)) {
      counts[s.id] = s.fields.filter((f) => values[f.name]?.trim()).length;
    }
    return counts;
  }, []);

  useEffect(() => {
    if (!currentSection) return;
    const section = getSectionById(currentSection);
    if (!section) return;
    const filled = section.fields.filter((f) => values[f.name]?.trim()).length;
    const total = section.fields.length;
    if (filled === total && total > 0 && prevFilledRef[currentSection] < total) {
      setConfettiTrigger(true);
      showToast(`${section.icon} ${section.title} 完了！おめでとうございます！`);
      setTimeout(() => setConfettiTrigger(false), 100);
    }
    prevFilledRef[currentSection] = filled;
  }, [values, currentSection]);

  // 存在しないクリニック
  if (!clinic) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm p-8 text-center"
          style={{
            background: "var(--md-surface-container)",
            borderRadius: "var(--md-shape-corner-xl)",
            boxShadow: "var(--md-elevation-2)",
          }}
        >
          <img src="/ponko.png" alt="ぽん子" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-lg font-medium mb-2" style={{ color: "var(--md-on-surface)" }}>
            医院が見つかりません
          </h1>
          <p className="text-sm" style={{ color: "var(--md-on-surface-variant)" }}>URLを確認してください</p>
          <p className="text-xs mt-4 font-mono" style={{ color: "var(--md-on-surface-variant)", }}>
            clinic_id: {clinicId}
          </p>
        </div>
      </div>
    );
  }

  const section = currentSection ? getSectionById(currentSection) : null;

  return (
    <AuthGate clinic={clinic}>
      <main className="px-4 py-8 sm:py-12 pb-20">
        {/* 途中復帰バナー */}
        {showWelcomeBack && !currentSection && lastSectionName && (
          <div
            className="max-w-lg mx-auto mb-4 flex items-center gap-3 p-3 cursor-pointer animate-slide-down"
            style={{
              background: "var(--md-primary-container)",
              borderRadius: "var(--md-shape-corner-lg)",
            }}
            onClick={() => {
              const lastId = getLastSection(clinicId);
              if (lastId) handleSectionChange(lastId);
              setShowWelcomeBack(false);
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
            <svg className="w-5 h-5 shrink-0" style={{ color: "var(--md-primary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}

        {showMission ? (
          <MissionBuilder
            clinicId={clinicId}
            onComplete={(result) => {
              setValues((prev) => ({ ...prev, philosophy: result }));
              setShowMission(false);
            }}
            onBack={() => setShowMission(false)}
          />
        ) : section ? (
          <SectionForm
            section={section}
            values={values}
            onChange={handleFieldChange}
            onBack={() => handleSectionChange(null)}
            onNavigate={handleSectionChange}
            industry={clinic?.industry}
          />
        ) : (
          <Dashboard
            values={values}
            onSelectSection={handleSectionChange}
            clinicId={clinicId}
            industry={clinic?.industry}
          />
        )}
      </main>

      <HamburgerMenu
        clinicId={clinicId}
        onOpenPresets={() => setShowPresets(true)}
        onOpenMissionBuilder={() => setShowMission(true)}
        onExportText={() => exportAsText(clinicId, values)}
        onExportJson={() => exportAsJson(clinicId, values)}
      />
      <SaveIndicator lastSaved={lastSaved} isDirty={isDirty} />
      <ToastContainer />
      <Confetti trigger={confettiTrigger} />
      {showOnboarding && (
        <Onboarding
          onComplete={() => {
            setOnboardingDone(clinicId);
            setShowOnboarding(false);
          }}
        />
      )}
      {showPresets && (
        <PresetModal
          onApply={(presetData) => setValues((prev) => ({ ...prev, ...presetData }))}
          onClose={() => setShowPresets(false)}
        />
      )}
    </AuthGate>
  );
}
