import { loadAllTreatmentCategories } from "@/lib/actions/treatment-categories"
import TreatmentEditorClient from "./TreatmentEditorClient"
import AdminAuthGate from "@/components/AdminAuthGate"
import { dentalSections } from "@/lib/industries/dental/schema"

export const dynamic = "force-dynamic"

export default async function TreatmentEditorPage() {
  const categories = await loadAllTreatmentCategories()

  // Get the current schema checklist categories as seed data
  const treatmentSection = dentalSections.find((s) => s.id === "treatment-menu")
  const schemaCategories = treatmentSection?.fields[0]?.checklistCategories || []

  return (
    <AdminAuthGate>
      <TreatmentEditorClient
        initialCategories={categories}
        schemaCategories={schemaCategories}
      />
    </AdminAuthGate>
  )
}
