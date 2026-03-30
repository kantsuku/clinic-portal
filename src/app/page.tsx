"use client";

import { useState, useCallback } from "react";
import { sections, getSectionById, getDefaultValues } from "@/lib/schema";
import Dashboard from "@/components/Dashboard";
import SectionForm from "@/components/SectionForm";

export default function Home() {
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>(getDefaultValues);

  const handleFieldChange = useCallback((fieldName: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }));
  }, []);

  const section = currentSection ? getSectionById(currentSection) : null;

  return (
    <main className="px-4 py-8 sm:py-12">
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
  );
}
