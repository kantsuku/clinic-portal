"use server"

import { createServerSupabase } from "@/lib/supabase/server"

export interface HearingStats {
  client_id: string
  progress: number
  status: string
  updated_at: string | null
}

export async function getHearingStats(): Promise<HearingStats[]> {
  const supabase = await createServerSupabase()

  const { data, error } = await supabase
    .schema("dnaos")
    .from("hearing_sessions")
    .select("client_id, progress, status, updated_at")

  if (error || !data) return []
  return data as HearingStats[]
}
