/**
 * clinic-portal の dnaSheet → DNA OS Lite の category マッピング
 */

import type { SectionDef } from "./schema"

/** DNA-OS のシート名 → DNA OS Lite の category */
const SHEET_TO_CATEGORY: Record<string, string> = {
  "00_Clinic": "basic_info",
  "03_DNA_Master": "philosophy",
  "04_Treatment_Policy": "treatment",
  "10_Staff_Master": "staff",
  "31_Tone_And_Manner": "tone",
  "11_Recruitment_Policy": "recruitment",
}

export interface FieldMapping {
  fieldName: string
  label: string
  category: string
  subCategory?: string
}

/**
 * セクション定義からフィールド→DNA OS Lite カテゴリのマッピングを生成
 */
export function buildFieldMappings(sections: SectionDef[]): FieldMapping[] {
  const mappings: FieldMapping[] = []

  for (const section of sections) {
    for (const field of section.fields) {
      const category = SHEET_TO_CATEGORY[field.dnaSheet] || "other"
      mappings.push({
        fieldName: field.name,
        label: field.label,
        category,
        subCategory: section.id,
      })
    }
  }

  return mappings
}
