import { getClinicList } from "@/lib/actions/clinics"
import { getHearingStats } from "@/lib/actions/hearing-stats"
import AdminDashboard from "./AdminDashboard"
import AdminAuthGate from "@/components/AdminAuthGate"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const clinics = await getClinicList()
  const stats = await getHearingStats()
  return (
    <AdminAuthGate>
      <AdminDashboard clinics={clinics} hearingStats={stats} />
    </AdminAuthGate>
  )
}
