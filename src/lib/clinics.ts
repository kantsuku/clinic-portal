/**
 * クリニック管理
 * localStorage ベースで動的に追加・編集可能
 */

export interface ClinicConfig {
  id: string;
  name: string;
  password: string;
  createdAt?: string;
}

const STORAGE_KEY = "clinic-portal:clinics";

/** デフォルトクリニック */
const DEFAULT_CLINICS: ClinicConfig[] = [
  { id: "demo", name: "デモ医院", password: "" },
];

/** クリニック一覧を取得 */
export function getAllClinics(): ClinicConfig[] {
  if (typeof window === "undefined") return DEFAULT_CLINICS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // 初回はデフォルトを保存
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CLINICS));
      return DEFAULT_CLINICS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CLINICS;
  }
}

/** クリニックを取得 */
export function getClinicConfig(id: string): ClinicConfig | null {
  return getAllClinics().find((c) => c.id === id) || null;
}

/** クリニックを追加 */
export function addClinic(clinic: ClinicConfig): void {
  const clinics = getAllClinics();
  if (clinics.find((c) => c.id === clinic.id)) {
    throw new Error(`ID "${clinic.id}" は既に使われています`);
  }
  clinic.createdAt = new Date().toISOString();
  clinics.push(clinic);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clinics));
}

/** クリニックを更新 */
export function updateClinic(id: string, updates: Partial<ClinicConfig>): void {
  const clinics = getAllClinics();
  const idx = clinics.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error(`ID "${id}" が見つかりません`);
  clinics[idx] = { ...clinics[idx], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clinics));
}

/** クリニックを削除 */
export function deleteClinic(id: string): void {
  const clinics = getAllClinics().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clinics));
}

/** パスワード検証 */
export function verifyPassword(clinicId: string, input: string): boolean {
  const clinic = getClinicConfig(clinicId);
  if (!clinic) return false;
  if (!clinic.password) return true;
  return clinic.password === input;
}
