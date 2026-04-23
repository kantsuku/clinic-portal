"use server"

import { createServerSupabase } from "@/lib/supabase/server"

export interface HearingStats {
  client_id: string
  progress: number
  status: string
  updated_at: string | null
  form_data: Record<string, string> | null
  step2_unlocked: boolean
  visible_categories: string[]
}

export async function getHearingStats(): Promise<HearingStats[]> {
  const supabase = await createServerSupabase()

  const { data, error } = await supabase
    .schema("dnaos")
    .from("hearing_sessions")
    .select("client_id, progress, status, updated_at, form_data, step2_unlocked, visible_categories")

  if (error || !data) return []
  return data.map((d) => ({
    client_id: d.client_id,
    progress: d.progress,
    status: d.status,
    updated_at: d.updated_at,
    form_data: (d.form_data as Record<string, string>) || null,
    step2_unlocked: d.step2_unlocked ?? false,
    visible_categories: (d.visible_categories as string[]) ?? [],
  }))
}
