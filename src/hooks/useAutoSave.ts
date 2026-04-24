"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { saveClinicData } from "@/lib/storage"
import { saveHearingData } from "@/lib/actions/hearing-data"
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
  // Track initial data snapshot to prevent saving unchanged data
  const initialDataRef = useRef<Record<string, string>>({ ...data })
  const hasUserEdited = useRef(false)
  // Track which fields have been changed by this client (for merge)
  const changedFieldsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const serialized = JSON.stringify(data)
    if (serialized !== prevDataRef.current) {
      // Detect which fields changed from initial
      for (const [key, val] of Object.entries(data)) {
        if (val !== initialDataRef.current[key]) {
          changedFieldsRef.current.add(key)
          hasUserEdited.current = true
        }
      }
      prevDataRef.current = serialized
      if (hasUserEdited.current) {
        setIsDirty(true)
      }
    }
  }, [data])

  useEffect(() => {
    if (!isDirty || !clinicId || !hasUserEdited.current) return

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      if (savingRef.current) {
        // Re-arm: another save will be triggered when current one finishes
        setIsDirty(false)
        requestAnimationFrame(() => setIsDirty(true))
        return
      }
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

          const result = await saveHearingData(clientUuid, data, progress, [...changedFieldsRef.current])
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
      if (isDirty && clinicId && hasUserEdited.current) {
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
      await saveHearingData(clientUuid, data, undefined, [...changedFieldsRef.current])
    }
    setLastSaved(new Date())
    setIsDirty(false)
  }, [clinicId, clientUuid, data])

  return { lastSaved, isDirty, saveNow }
}
