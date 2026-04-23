"use server"

import { createServerSupabase } from "@/lib/supabase/server"

export interface Subcategory {
  name: string
  question: string
  items: string[]
}

export interface TreatmentCategory {
  id: string
  categoryName: string
  subcategories: Subcategory[]
  sortOrder: number
  updatedAt: string
}

export async function loadAllTreatmentCategories(): Promise<TreatmentCategory[]> {
  const supabase = await createServerSupabase()

  const { data, error } = await supabase
    .schema("dnaos")
    .from("treatment_categories")
    .select("id, category_name, subcategories, sort_order, updated_at")
    .order("sort_order")

  if (error || !data) return []

  return data.map((r) => ({
    id: r.id,
    categoryName: r.category_name,
    subcategories: (r.subcategories as Subcategory[]) || [],
    sortOrder: r.sort_order,
    updatedAt: r.updated_at,
  }))
}

export async function saveTreatmentCategory(
  categoryName: string,
  subcategories: Subcategory[],
  sortOrder: number,
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createServerSupabase()

  const { error } = await supabase
    .schema("dnaos")
    .from("treatment_categories")
    .upsert(
      {
        category_name: categoryName,
        subcategories,
        sort_order: sortOrder,
      },
      { onConflict: "category_name" },
    )

  if (error) return { error: error.message }
  return { ok: true }
}

export async function updateTreatmentSubcategories(
  categoryName: string,
  subcategories: Subcategory[],
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createServerSupabase()

  const { error } = await supabase
    .schema("dnaos")
    .from("treatment_categories")
    .update({ subcategories })
    .eq("category_name", categoryName)

  if (error) return { error: error.message }
  return { ok: true }
}

export async function bulkSaveTreatmentCategories(
  categories: { categoryName: string; subcategories: Subcategory[]; sortOrder: number }[],
): Promise<{ ok: true; count: number } | { error: string }> {
  const supabase = await createServerSupabase()

  const rows = categories.map((c) => ({
    category_name: c.categoryName,
    subcategories: c.subcategories,
    sort_order: c.sortOrder,
  }))

  const { error } = await supabase
    .schema("dnaos")
    .from("treatment_categories")
    .upsert(rows, { onConflict: "category_name" })

  if (error) return { error: error.message }
  return { ok: true, count: rows.length }
}
