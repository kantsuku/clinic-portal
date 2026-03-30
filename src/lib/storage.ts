/**
 * clinic_id 別のローカルストレージ管理
 */

const STORAGE_PREFIX = "clinic-portal";

function getKey(clinicId: string): string {
  return `${STORAGE_PREFIX}:${clinicId}:data`;
}

function getAuthKey(clinicId: string): string {
  return `${STORAGE_PREFIX}:${clinicId}:auth`;
}

/** 保存 */
export function saveClinicData(
  clinicId: string,
  data: Record<string, string>
): void {
  try {
    const payload = {
      data,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(getKey(clinicId), JSON.stringify(payload));
  } catch (e) {
    console.error("Failed to save:", e);
  }
}

/** 読み込み */
export function loadClinicData(
  clinicId: string
): { data: Record<string, string>; updatedAt: string } | null {
  try {
    const raw = localStorage.getItem(getKey(clinicId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load:", e);
    return null;
  }
}

/** 認証トークン保存 */
export function saveAuthToken(clinicId: string, token: string): void {
  try {
    localStorage.setItem(getAuthKey(clinicId), token);
  } catch (e) {
    console.error("Failed to save auth:", e);
  }
}

/** 認証トークン読み込み */
export function loadAuthToken(clinicId: string): string | null {
  try {
    return localStorage.getItem(getAuthKey(clinicId));
  } catch (e) {
    return null;
  }
}

/** 最終保存日時を取得 */
export function getLastSavedAt(clinicId: string): string | null {
  const saved = loadClinicData(clinicId);
  return saved?.updatedAt || null;
}
