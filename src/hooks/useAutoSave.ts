"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { saveClinicData } from "@/lib/storage";
import { showToast } from "@/components/Toast";

interface UseAutoSaveOptions {
  clinicId: string;
  data: Record<string, string>;
  /** 自動保存の間隔（ミリ秒）デフォルト2秒 */
  interval?: number;
}

export function useAutoSave({ clinicId, data, interval = 2000 }: UseAutoSaveOptions) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const prevDataRef = useRef<string>("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // データ変更検知 → dirty フラグ
  useEffect(() => {
    const serialized = JSON.stringify(data);
    if (serialized !== prevDataRef.current) {
      prevDataRef.current = serialized;
      setIsDirty(true);
    }
  }, [data]);

  // dirty なら interval 後に保存
  useEffect(() => {
    if (!isDirty || !clinicId) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      saveClinicData(clinicId, data);
      setLastSaved(new Date());
      setIsDirty(false);
      showToast("自動保存しました");
    }, interval);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isDirty, data, clinicId, interval]);

  // ページ離脱時に未保存があれば即保存 + 警告
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty && clinicId) {
        // 離脱前に即保存
        saveClinicData(clinicId, data);
        e.preventDefault();
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, data, clinicId]);

  // 手動保存
  const saveNow = useCallback(() => {
    if (!clinicId) return;
    saveClinicData(clinicId, data);
    setLastSaved(new Date());
    setIsDirty(false);
  }, [clinicId, data]);

  return { lastSaved, isDirty, saveNow };
}
