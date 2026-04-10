"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { saveClinicData } from "@/lib/storage"
import { saveHearingData, saveSessionState } from "@/lib/actions/hearing-data"
import { showToast } from "@/components/Toast"
import { getSections } from "@/lib/schema"

interface UseAutoSaveOptions {
  clinicId: string
  data: Record<string, string>
  clientUuid: string | null
  industry?: "dental" | "corporate"
  interval?: number
}

export function useAutoSave({ clinicId, data, clientUuid, industry, interval = 3000 }: UseAutoSaveOptions) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const prevDataRef = useRef<string>("")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savingRef = useRef(false)

  useEffect(() => {
    const serialized = JSON.stringify(data)
    if (serialized !== prevDataRef.current) {
      prevDataRef.current = serialized
      setIsDirty(true)
    }
  }, [data])

  useEffect(() => {
    if (!isDirty || !clinicId) return

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      if (savingRef.current) return
      savingRef.current = true

      try {
        saveClinicData(clinicId, data)

        if (clientUuid) {
          // Calculate progress
          const sections = getSections(industry)
          const totalFields = sections.reduce((sum, s) => sum + s.fields.length, 0)
          const filledFields = sections.reduce(
            (sum, s) => sum + s.fields.filter((f) => data[f.name]?.trim()).length, 0
          )
          const progress = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0

          const result = await saveHearingData(clientUuid, data, progress)
          if ("error" in result) {
            console.error("Supabase save failed:", result.error)
            showToast("ローカル保存しました（サーバー保存失敗）")
          } else {
            showToast("保存しました")
          }
        } else {
          showToast("自動保存しました")
        }

        setLastSaved(new Date())
        setIsDirty(false)
      } finally {
        savingRef.current = false
      }
    }, interval)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isDirty, data, clinicId, clientUuid, industry, interval])

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty && clinicId) {
        saveClinicData(clinicId, data)
        e.preventDefault()
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDirty, data, clinicId])

  const saveNow = useCallback(async () => {
    if (!clinicId) return
    saveClinicData(clinicId, data)
    if (clientUuid) {
      await saveHearingData(clientUuid, data)
    }
    setLastSaved(new Date())
    setIsDirty(false)
  }, [clinicId, clientUuid, data])

  return { lastSaved, isDirty, saveNow }
}
