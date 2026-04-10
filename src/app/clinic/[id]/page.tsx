import { getClinicByParam } from "@/lib/actions/clinics"
import { loadHearingSession } from "@/lib/actions/hearing-data"
import ClinicEditor from "./ClinicEditor"

export default async function ClinicPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const clinic = await getClinicByParam(id)

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
          <p className="text-sm" style={{ color: "var(--md-on-surface-variant)" }}>
            URLを確認してください
          </p>
          <p
            className="text-xs mt-4 font-mono"
            style={{ color: "var(--md-on-surface-variant)" }}
          >
            clinic_id: {id}
          </p>
        </div>
      </div>
    )
  }

  // Load saved hearing session from Supabase
  const session = await loadHearingSession(clinic.id)

  return (
    <ClinicEditor
      clinic={clinic}
      initialData={session?.formData ?? null}
      initialSession={session}
    />
  )
}
