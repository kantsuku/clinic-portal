"use server"

import { createServerSupabase } from "@/lib/supabase/server"

export interface HearingStats {
  client_id: string
  progress: number
  status: string
  updated_at: string | null
  form_data: Record<string, string> | null
  step2_unlocked: boolean
  unlocked_steps: number[]
  visible_categories: string[]
  step_deadlines: Record<string, string>
}

const STATS_SELECT_FULL =
  "client_id, progress, status, updated_at, form_data, step2_unlocked, unlocked_steps, visible_categories, step_deadlines"
const STATS_SELECT_SAFE =
  "client_id, progress, status, updated_at, form_data, step2_unlocked, unlocked_steps, visible_categories"

function mapStats(d: Record<string, unknown>): HearingStats {
  return {
    client_id: d.client_id as string,
    progress: d.progress as number,
    status: d.status as string,
    updated_at: d.updated_at as string | null,
    form_data: (d.form_data as Record<string, string>) || null,
    step2_unlocked: (d.step2_unlocked as boolean) ?? false,
    unlocked_steps: (d.unlocked_steps as number[]) ?? [0],
    visible_categories: (d.visible_categories as string[]) ?? [],
    step_deadlines: (d.step_deadlines as Record<string, string>) ?? {},
  }
}

export async function getHearingStats(): Promise<HearingStats[]> {
  const supabase = await createServerSupabase()

  const { data, error } = await supabase
    .schema("dnaos")
    .from("hearing_sessions")
    .select(STATS_SELECT_FULL)

  if (!error && data) return data.map((d) => mapStats(d as Record<string, unknown>))

  // Fallback: retry without newer columns to protect existing data
  if (error) {
    console.warn("[getHearingStats] Full select failed, retrying safe select:", error.message)
    const { data: safeData, error: safeError } = await supabase
      .schema("dnaos")
      .from("hearing_sessions")
      .select(STATS_SELECT_SAFE)

    if (!safeError && safeData) return safeData.map((d) => mapStats(d as Record<string, unknown>))
  }

  return []
}
