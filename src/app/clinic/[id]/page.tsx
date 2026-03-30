"use client";

import { useState, useCallback, useEffect, use } from "react";
import { sections, getSectionById, getDefaultValues } from "@/lib/schema";
import { getClinicConfig } from "@/lib/clinics";
import { loadClinicData } from "@/lib/storage";
import { useAutoSave } from "@/hooks/useAutoSave";
import Dashboard from "@/components/Dashboard";
import SectionForm from "@/components/SectionForm";
import AuthGate from "@/components/AuthGate";
import SaveIndicator from "@/components/SaveIndicator";

export default function ClinicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: clinicId } = use(params);
  const clinic = getClinicConfig(clinicId);

  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>(() => {
    // 初期値: localStorage から復元、なければデフォルト
    if (typeof window === "undefined") return getDefaultValues();
    const saved = loadClinicData(clinicId);
    if (saved) return { ...getDefaultValues(), ...saved.data };
    return getDefaultValues();
  });

  // 自動保存
  const { lastSaved, isDirty, saveNow } = useAutoSave({
    clinicId,
    data: values,
  });

  const handleFieldChange = useCallback((fieldName: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }));
  }, []);

  // 存在しないクリニック
  if (!clinic) {
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
          <img src="/ponko.png" alt="ぽん子" className="w-16 h-16 mx-auto mb-4" />
          <h1
            className="text-lg font-medium mb-2"
            style={{ color: "var(--md-on-surface)" }}
          >
            医院が見つかりません
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--md-on-surface-variant)" }}
          >
            URLを確認してください
          </p>
          <p
            className="text-xs mt-4 font-mono"
            style={{ color: "var(--md-on-surface-variant)", opacity: 0.5 }}
          >
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
        {section ? (
          <SectionForm
            section={section}
            values={values}
            onChange={handleFieldChange}
            onBack={() => setCurrentSection(null)}
          />
        ) : (
          <Dashboard
            values={values}
            onSelectSection={setCurrentSection}
          />
        )}
      </main>
      <SaveIndicator lastSaved={lastSaved} isDirty={isDirty} />
    </AuthGate>
  );
}
