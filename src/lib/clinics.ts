/**
 * クリニック管理（MVP: ハードコード → 将来: Supabase / GAS）
 */

export interface ClinicConfig {
  id: string;
  name: string;
  /** 簡易パスワード（空ならパスワードなし） */
  password: string;
}

/**
 * 登録済みクリニック一覧
 * MVP段階ではここにハードコード。
 * 将来的には Supabase or GAS API から取得する。
 */
const CLINICS: ClinicConfig[] = [
  {
    id: "demo",
    name: "デモ医院",
    password: "",
  },
  // 新しいクリニックを追加するにはここに追加
  // {
  //   id: "KEYAKI_DC",
  //   name: "けやき歯科クリニック",
  //   password: "keyaki2024",
  // },
];

export function getClinicConfig(id: string): ClinicConfig | null {
  return CLINICS.find((c) => c.id === id) || null;
}

export function getAllClinics(): ClinicConfig[] {
  return CLINICS;
}

/** パスワード検証（空パスワードは常にtrue） */
export function verifyPassword(clinicId: string, input: string): boolean {
  const clinic = getClinicConfig(clinicId);
  if (!clinic) return false;
  if (!clinic.password) return true;
  return clinic.password === input;
}
