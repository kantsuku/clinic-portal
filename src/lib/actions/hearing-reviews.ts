"use server"

import { createServerSupabase } from "@/lib/supabase/server"

// ── Types ───────────────────────────────────────────────────

export interface HearingReview {
  id: string
  clientId: string
  fieldName: string
  comment: string
  source: "ai" | "staff"
  status: "active" | "resolved" | "dismissed"
  visible: boolean
  updatedAt: string
}

// ── Load reviews for a client (visible only — for client side) ──

export async function loadVisibleReviews(
  clientId: string,
): Promise<HearingReview[]> {
  const supabase = await createServerSupabase()

  const { data, error } = await supabase
    .schema("dnaos")
    .from("hearing_reviews")
    .select("id, client_id, field_name, comment, source, status, visible, updated_at")
    .eq("client_id", clientId)
    .eq("status", "active")
    .eq("visible", true)
    .order("field_name")

  if (error || !data) return []

  return data.map((r) => ({
    id: r.id,
    clientId: r.client_id,
    fieldName: r.field_name,
    comment: r.comment,
    source: r.source as HearingReview["source"],
    status: r.status as HearingReview["status"],
    visible: r.visible,
    updatedAt: r.updated_at,
  }))
}

// ── Load all reviews for a client (for admin) ───────────────

export async function loadAllReviews(
  clientId: string,
): Promise<HearingReview[]> {
  const supabase = await createServerSupabase()

  const { data, error } = await supabase
    .schema("dnaos")
    .from("hearing_reviews")
    .select("id, client_id, field_name, comment, source, status, visible, updated_at")
    .eq("client_id", clientId)
    .eq("status", "active")
    .order("field_name")

  if (error || !data) return []

  return data.map((r) => ({
    id: r.id,
    clientId: r.client_id,
    fieldName: r.field_name,
    comment: r.comment,
    source: r.source as HearingReview["source"],
    status: r.status as HearingReview["status"],
    visible: r.visible,
    updatedAt: r.updated_at,
  }))
}

// ── Save/update a single review ─────────────────────────────

export async function saveReview(
  clientId: string,
  fieldName: string,
  comment: string,
  source: "ai" | "staff" = "staff",
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createServerSupabase()

  const { error } = await supabase
    .schema("dnaos")
    .from("hearing_reviews")
    .upsert(
      {
        client_id: clientId,
        field_name: fieldName,
        comment,
        source,
        status: "active",
        visible: false,
      },
      { onConflict: "client_id,field_name" },
    )

  if (error) return { error: error.message }
  return { ok: true }
}

// ── Update review comment (admin edit) ──────────────────────

export async function updateReviewComment(
  clientId: string,
  fieldName: string,
  comment: string,
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createServerSupabase()

  const { error } = await supabase
    .schema("dnaos")
    .from("hearing_reviews")
    .update({ comment, source: "staff" as const })
    .eq("client_id", clientId)
    .eq("field_name", fieldName)

  if (error) return { error: error.message }
  return { ok: true }
}

// ── Toggle visibility ───────────────────────────────────────

export async function setReviewVisibility(
  clientId: string,
  fieldName: string,
  visible: boolean,
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createServerSupabase()

  const { error } = await supabase
    .schema("dnaos")
    .from("hearing_reviews")
    .update({ visible })
    .eq("client_id", clientId)
    .eq("field_name", fieldName)

  if (error) return { error: error.message }
  return { ok: true }
}

// ── Bulk publish all reviews ────────────────────────────────

export async function publishAllReviews(
  clientId: string,
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createServerSupabase()

  const { error } = await supabase
    .schema("dnaos")
    .from("hearing_reviews")
    .update({ visible: true })
    .eq("client_id", clientId)
    .eq("status", "active")

  if (error) return { error: error.message }
  return { ok: true }
}

// ── Delete a review ─────────────────────────────────────────

export async function deleteReview(
  clientId: string,
  fieldName: string,
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createServerSupabase()

  const { error } = await supabase
    .schema("dnaos")
    .from("hearing_reviews")
    .delete()
    .eq("client_id", clientId)
    .eq("field_name", fieldName)

  if (error) return { error: error.message }
  return { ok: true }
}

// ── Bulk save AI-generated reviews (visible=false by default) ──

export async function bulkSaveReviews(
  clientId: string,
  reviews: { fieldName: string; comment: string }[],
): Promise<{ ok: true; count: number } | { error: string }> {
  const supabase = await createServerSupabase()

  const rows = reviews.map((r) => ({
    client_id: clientId,
    field_name: r.fieldName,
    comment: r.comment,
    source: "ai" as const,
    status: "active" as const,
    visible: false,
  }))

  const { error } = await supabase
    .schema("dnaos")
    .from("hearing_reviews")
    .upsert(rows, { onConflict: "client_id,field_name" })

  if (error) return { error: error.message }
  return { ok: true, count: rows.length }
}
