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

/** 最後にアクセスしたセクションを保存 */
export function saveLastSection(clinicId: string, sectionId: string): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}:${clinicId}:lastSection`, sectionId);
  } catch {}
}

/** 最後にアクセスしたセクションを取得 */
export function getLastSection(clinicId: string): string | null {
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}:${clinicId}:lastSection`);
  } catch {
    return null;
  }
}

/** 変更ログを追加 */
export function addChangeLog(clinicId: string, fieldName: string, label: string): void {
  try {
    const key = `${STORAGE_PREFIX}:${clinicId}:changelog`;
    const raw = localStorage.getItem(key);
    const logs: { field: string; label: string; at: string }[] = raw ? JSON.parse(raw) : [];
    logs.unshift({ field: fieldName, label, at: new Date().toISOString() });
    // 最新100件まで保持
    localStorage.setItem(key, JSON.stringify(logs.slice(0, 100)));
  } catch {}
}

/** 前回保存時のスナップショットを保存（diff用） */
export function saveSnapshot(clinicId: string, data: Record<string, string>): void {
  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}:${clinicId}:snapshot`,
      JSON.stringify(data)
    );
  } catch {}
}

/** 前回スナップショットを取得 */
export function getSnapshot(clinicId: string): Record<string, string> | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}:${clinicId}:snapshot`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** チャット履歴を保存 */
export function saveChatHistory(clinicId: string, messages: { role: string; content: string }[]): void {
  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}:${clinicId}:chat`,
      JSON.stringify(messages.slice(-50)) // 最新50件
    );
  } catch {}
}

/** チャット履歴を取得 */
export function loadChatHistory(clinicId: string): { role: string; content: string }[] | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}:${clinicId}:chat`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** オンボーディング完了フラグ */
export function isOnboardingDone(clinicId: string): boolean {
  try {
    return !!localStorage.getItem(`${STORAGE_PREFIX}:${clinicId}:onboarded`);
  } catch {
    return false;
  }
}

export function setOnboardingDone(clinicId: string): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}:${clinicId}:onboarded`, "1");
  } catch {}
}

/** 変更ログを取得 */
export function getChangeLogs(clinicId: string): { field: string; label: string; at: string }[] {
  try {
    const key = `${STORAGE_PREFIX}:${clinicId}:changelog`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
