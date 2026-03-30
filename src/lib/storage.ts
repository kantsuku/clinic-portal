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
    if (e instanceof DOMException && (e.code === 22 || e.name === "QuotaExceededError")) {
      console.error("localStorage quota exceeded");
    } else {
      console.error("Failed to save:", e);
    }
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

/** 認証済みフラグ保存（パスワード自体は保存しない） */
export function saveAuthFlag(clinicId: string): void {
  try {
    const hash = btoa(clinicId + ":authed:" + Date.now());
    localStorage.setItem(getAuthKey(clinicId), hash);
  } catch (e) {
    console.error("Failed to save auth:", e);
  }
}

/** 認証済みかチェック */
export function isAuthenticated(clinicId: string): boolean {
  try {
    return !!localStorage.getItem(getAuthKey(clinicId));
  } catch {
    return false;
  }
}

/** 認証をクリア */
export function clearAuth(clinicId: string): void {
  try {
    localStorage.removeItem(getAuthKey(clinicId));
  } catch {}
}

/** 最終保存日時を取得 */
export function getLastSavedAt(clinicId: string): string | null {
  const saved = loadClinicData(clinicId);
  return saved?.updatedAt || null;
}
