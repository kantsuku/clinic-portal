import { getClinicList } from "@/lib/actions/clinics"
import { getHearingStats } from "@/lib/actions/hearing-stats"
import AdminDashboard from "./AdminDashboard"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const clinics = await getClinicList()
  const stats = await getHearingStats()
  return <AdminDashboard clinics={clinics} hearingStats={stats} />
}
