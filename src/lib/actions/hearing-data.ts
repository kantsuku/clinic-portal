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
  step2Unlocked: boolean
  unlockedSteps: number[]
  visibleCategories: string[]
  updatedAt: string
}

const EMPTY_MISSION = { mission: "", supplement: "", slogan: "", ways: "" }

// ── Save form data (auto-save) ──────────────────────────────

export async function saveHearingData(
  clientId: string,
  formData: Record<string, string>,
  progress?: number,
  changedFields?: string[] | Set<string>,
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createServerSupabase()

  let mergedData = formData

  // Field-level merge when we know which fields this client changed
  const changedSet = changedFields instanceof Set ? changedFields : new Set(changedFields || [])
  if (changedSet.size > 0) {
    const { data: existing } = await supabase
      .schema("dnaos")
      .from("hearing_sessions")
      .select("form_data")
      .eq("client_id", clientId)
      .maybeSingle()

    if (existing?.form_data) {
      const serverData = existing.form_data as Record<string, string>
      mergedData = { ...serverData }
      for (const key of changedSet) {
        mergedData[key] = formData[key] ?? ""
      }
    }
  }

  const updates: Record<string, unknown> = {
    client_id: clientId,
    form_data: mergedData,
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

  // Check if row exists first to avoid creating sparse rows with null form_data
  const { data: existing } = await supabase
    .schema("dnaos")
    .from("hearing_sessions")
    .select("client_id")
    .eq("client_id", clientId)
    .maybeSingle()

  const updates: Record<string, unknown> = { client_id: clientId }
  if (!existing) updates.form_data = {} // prevent null form_data on new rows
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
    .select("form_data, mission_draft, onboarding_done, last_section_id, progress, status, step2_unlocked, unlocked_steps, visible_categories, updated_at")
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
    step2Unlocked: data.step2_unlocked ?? false,
    unlockedSteps: (data.unlocked_steps as number[]) ?? [0],
    visibleCategories: (data.visible_categories as string[]) ?? [],
    updatedAt: data.updated_at,
  }
}

// ── Toggle step2 lock ───────────────────────────────────────

export async function setStep2Unlocked(
  clientId: string,
  unlocked: boolean,
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createServerSupabase()

  const { error } = await supabase
    .schema("dnaos")
    .from("hearing_sessions")
    .upsert(
      { client_id: clientId, step2_unlocked: unlocked },
      { onConflict: "client_id" },
    )

  if (error) return { error: error.message }
  return { ok: true }
}

// ── Toggle step lock ────────────────────────────────────────

export async function setUnlockedSteps(
  clientId: string,
  steps: number[],
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createServerSupabase()

  const { error } = await supabase
    .schema("dnaos")
    .from("hearing_sessions")
    .upsert(
      { client_id: clientId, unlocked_steps: steps },
      { onConflict: "client_id" },
    )

  if (error) return { error: error.message }
  return { ok: true }
}

// ── Save visible categories ─────────────────────────────────

export async function setVisibleCategories(
  clientId: string,
  categories: string[],
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createServerSupabase()

  const { error } = await supabase
    .schema("dnaos")
    .from("hearing_sessions")
    .upsert(
      { client_id: clientId, visible_categories: categories },
      { onConflict: "client_id" },
    )

  if (error) return { error: error.message }
  return { ok: true }
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
