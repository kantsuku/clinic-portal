"use server"

import { createServerSupabase } from "@/lib/supabase/server"

export interface ClinicMaster {
  id: string
  clinic_name: string
  contract_no: string | null
  icon_emoji: string
  industry: "dental" | "corporate"
  hearing_password: string | null
  created_at: string
  updated_at: string
}

const CLIENT_MASTER_SELECT =
  "id, clinic_name:project_name, contract_no, icon_emoji, industry, hearing_password, created_at, updated_at"

/**
 * kantsuku-hub の client_master からクリニック一覧を取得
 * hearing_password は client_master に直接格納
 */
export async function getClinicList(): Promise<ClinicMaster[]> {
  const supabase = await createServerSupabase()

  const { data: rows, error } = await supabase
    .from("client_master")
    .select(CLIENT_MASTER_SELECT)
    .order("updated_at", { ascending: false })

  if (error || !rows) return []

  return rows as ClinicMaster[]
}

/**
 * UUID or contract_no でクリニックを1件取得
 */
export async function getClinicByParam(param: string): Promise<ClinicMaster | null> {
  const supabase = await createServerSupabase()
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(param)

  let query = supabase.from("client_master").select(CLIENT_MASTER_SELECT)
  if (isUuid) {
    query = query.eq("id", param)
  } else {
    query = query.or(`slug.eq.${param},contract_no.eq.${param}`)
  }

  const { data, error } = await query.maybeSingle()
  if (error || !data) return null

  return data as ClinicMaster
}
