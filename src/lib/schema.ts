/**
 * ヒアリングフォームのスキーマ定義（業種別ルーター）
 */

import type { IndustryType } from "./clinics";
import { dentalSections, dentalSteps } from "./industries/dental/schema";
import { corporateSections, corporateSteps } from "./industries/corporate/schema";

// ── 型定義（業種共通） ─────────────────────────────────────

export type FieldType =
  | "text"
  | "textarea"
  | "date"
  | "tel"
  | "url"
  | "select"
  | "weekday-hours"
  | "repeater"
  | "sns"
  | "payment"
  | "checklist"
  | "tone-manner"
  | "staff-repeater"
  | "price-table"
  | "case-study";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  hint?: string;
  dnaSheet: string;
  dnaField: string;
  required?: boolean;
  options?: string[];
  defaultCount?: number;
  suggestions?: { title: string; description: string }[];
  enableAiSuggest?: boolean;
  rows?: number;
  textSuggestions?: { label: string; text: string }[];
  checklistCategories?: { name: string; items: string[] }[];
  toneCategories?: { name: string; key: string; options: string[]; multiple?: boolean; custom?: boolean }[];
}

export interface SectionDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  fields: FieldDef[];
  step: 0 | 1 | 2;
  estimatedMinutes?: number;
}

export interface StepDef {
  step: 0 | 1 | 2;
  title: string;
  description: string;
}

// ── 業種別データ取得 ─────────────────────────────────────

const INDUSTRY_DATA: Record<IndustryType, { sections: SectionDef[]; steps: StepDef[] }> = {
  dental: { sections: dentalSections, steps: dentalSteps },
  corporate: { sections: corporateSections, steps: corporateSteps },
};

/** 現在のindustry（ページ側からsetされる） */
let currentIndustry: IndustryType = "dental";

export function setCurrentIndustry(industry: IndustryType) {
  currentIndustry = industry;
}

/** 現在の業種のセクション一覧 */
export function getSections(industry?: IndustryType): SectionDef[] {
  return INDUSTRY_DATA[industry || currentIndustry].sections;
}

/** 現在の業種のステップ一覧 */
export function getSteps(industry?: IndustryType): StepDef[] {
  return INDUSTRY_DATA[industry || currentIndustry].steps;
}

/** 後方互換: 既存コードが `sections` を参照している箇所用 */
export const sections = dentalSections;
export const steps = dentalSteps;

// ── ヘルパー ─────────────────────────────────────────────

export function getSectionById(id: string, industry?: IndustryType): SectionDef | undefined {
  return getSections(industry).find((s) => s.id === id);
}

export function getAllFieldNames(industry?: IndustryType): string[] {
  return getSections(industry).flatMap((s) => s.fields.map((f) => f.name));
}

/** 全フィールドのデフォルト値（空文字）を生成 */
export function getDefaultValues(industry?: IndustryType): Record<string, string> {
  const values: Record<string, string> = {};
  for (const section of getSections(industry)) {
    for (const field of section.fields) {
      values[field.name] = "";
    }
  }
  return values;
}
