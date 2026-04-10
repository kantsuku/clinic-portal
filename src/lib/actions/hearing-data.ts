"use server"

import { createServerSupabase } from "@/lib/supabase/server"

// ── Types ───────────────────────────────────────────────────

export interface HearingSession {
  formData: Record<string, string>
  missionDraft: { mission: string; supplement: string; slogan: string; ways: string }
  onboardingDone: boolean
  lastSectionId: string | null
  progress: number
  status: "editing" | "completed" | "submitted"
  updatedAt: string
}

const EMPTY_MISSION = { mission: "", supplement: "", slogan: "", ways: "" }

// ── Save form data (auto-save) ──────────────────────────────

export async function saveHearingData(
  clientId: string,
  formData: Record<string, string>,
  progress?: number,
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createServerSupabase()

  const updates: Record<string, unknown> = {
    client_id: clientId,
    form_data: formData,
    status: "editing",
  }
  if (progress !== undefined) {
    updates.progress = Math.min(100, Math.max(0, progress))
  }

  const { error } = await supabase
    .schema("dnaos")
    .from("hearing_sessions")
    .upsert(updates, { onConflict: "client_id" })

  if (error) return { error: error.message }
  return { ok: true }
}

// ── Save session state (mission draft, onboarding, etc.) ────

export async function saveSessionState(
  clientId: string,
  state: {
    missionDraft?: { mission: string; supplement: string; slogan: string; ways: string }
    onboardingDone?: boolean
    lastSectionId?: string | null
    progress?: number
  },
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createServerSupabase()

  const updates: Record<string, unknown> = { client_id: clientId }
  if (state.missionDraft !== undefined) updates.mission_draft = state.missionDraft
  if (state.onboardingDone !== undefined) updates.onboarding_done = state.onboardingDone
  if (state.lastSectionId !== undefined) updates.last_section_id = state.lastSectionId
  if (state.progress !== undefined) updates.progress = Math.min(100, Math.max(0, state.progress))

  const { error } = await supabase
    .schema("dnaos")
    .from("hearing_sessions")
    .upsert(updates, { onConflict: "client_id" })

  if (error) return { error: error.message }
  return { ok: true }
}

// ── Load full session ───────────────────────────────────────

export async function loadHearingSession(
  clientId: string,
): Promise<HearingSession | null> {
  const supabase = await createServerSupabase()

  const { data, error } = await supabase
    .schema("dnaos")
    .from("hearing_sessions")
    .select("form_data, mission_draft, onboarding_done, last_section_id, progress, status, updated_at")
    .eq("client_id", clientId)
    .maybeSingle()

  if (error || !data) return null

  return {
    formData: (data.form_data as Record<string, string>) || {},
    missionDraft: (data.mission_draft as HearingSession["missionDraft"]) || EMPTY_MISSION,
    onboardingDone: data.onboarding_done ?? false,
    lastSectionId: data.last_section_id ?? null,
    progress: data.progress ?? 0,
    status: data.status as HearingSession["status"],
    updatedAt: data.updated_at,
  }
}

// ── Submit to DNA OS Lite ───────────────────────────────────

export async function submitToDnaOsLite(
  clientId: string,
  data: Record<string, string>,
  sectionMapping: { fieldName: string; label: string; category: string; subCategory?: string }[],
): Promise<{ ok: true; count: number } | { error: string }> {
  const supabase = await createServerSupabase()

  // 1. Update hearing_sessions status to 'submitted'
  const now = new Date().toISOString()
  const { error: statusError } = await supabase
    .schema("dnaos")
    .from("hearing_sessions")
    .update({ status: "submitted", submitted_at: now })
    .eq("client_id", clientId)

  if (statusError) return { error: statusError.message }

  // 2. Build readable content for hearing_raw record
  const contentLines: string[] = []
  for (const [key, val] of Object.entries(data)) {
    if (val?.trim()) {
      contentLines.push(`【${key}】\n${val}`)
    }
  }
  const hearingContent = contentLines.join("\n\n")

  // 3. Upsert hearing_raw summary to clinic_data
  await supabase
    .schema("dnaos")
    .from("clinic_data")
    .upsert(
      {
        client_id: clientId,
        category: "hearing_raw",
        title: "ヒアリングデータ",
        content: hearingContent,
        source_type: "hearing",
        status: "confirmed",
        metadata: {
          source: "clinic-portal",
          submitted_at: now,
        },
      },
      { onConflict: "client_id,category,title" }
    )

  // 4. Split into category-specific records
  const batchId = crypto.randomUUID()

  const rows: {
    client_id: string
    category: string
    title: string
    content: string
    source_type: string
    status: string
    metadata: Record<string, unknown>
  }[] = []

  for (const mapping of sectionMapping) {
    const value = data[mapping.fieldName]
    if (!value?.trim()) continue

    rows.push({
      client_id: clientId,
      category: mapping.category,
      title: mapping.label,
      content: value,
      source_type: "hearing",
      status: "confirmed",
      metadata: {
        import_batch_id: batchId,
        import_label: "ぽん子ヒアリング",
        import_at: now,
        source: "clinic-portal",
        field_name: mapping.fieldName,
        ...(mapping.subCategory ? { sub_category: mapping.subCategory } : {}),
      },
    })
  }

  if (rows.length === 0) return { ok: true, count: 0 }

  const { error: insertError } = await supabase
    .schema("dnaos")
    .from("clinic_data")
    .insert(rows)

  if (insertError) return { error: insertError.message }

  return { ok: true, count: rows.length }
}
