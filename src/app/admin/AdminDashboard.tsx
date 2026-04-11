"use client"

import { useState, useMemo } from "react"
import { loadClinicData } from "@/lib/storage"
import type { HearingStats } from "@/lib/actions/hearing-stats"
import { getSections } from "@/lib/schema"
import { analyzePrimaryInfo } from "@/lib/primary-info-analyzer"
import { exportAsText, exportAsJson } from "@/lib/export"
import type { ClinicMaster } from "@/lib/actions/clinics"
import { ChevronDown, ChevronUp, ArrowLeft } from "lucide-react"
import Icon, { normalizeIconName } from "@/components/Icon"

type IndustryType = "dental" | "corporate"

const INDUSTRY_LABELS: Record<IndustryType, string> = {
  dental: "歯科医院",
  corporate: "一般企業",
}

interface ClinicStats {
  clinic: ClinicMaster
  totalFields: number
  filledFields: number
  progressPct: number
  primaryScore: number
  lastUpdated: string | null
  emptySections: string[]
}

function getClinicStats(clinic: ClinicMaster): ClinicStats {
  const clinicKey = clinic.contract_no || clinic.id
  const saved = loadClinicData(clinicKey)
  const data = saved?.data || {}
  const industry = clinic.industry || "dental"
  const industrySections = getSections(industry)
  const allFields = industrySections.flatMap((s) => s.fields)
  const filled = allFields.filter((f) => data[f.name]?.trim()).length
  const pct = allFields.length > 0 ? Math.round((filled / allFields.length) * 100) : 0

  let totalScore = 0
  let scoreCount = 0
  for (const field of allFields) {
    if ((field.type === "textarea" || field.type === "repeater") && data[field.name]?.trim()?.length > 10) {
      totalScore += analyzePrimaryInfo(data[field.name]).score
      scoreCount++
    }
  }
  const primaryScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0

  const emptySections = industrySections
    .filter((s) => s.fields.every((f) => !data[f.name]?.trim()))
    .map((s) => s.title)

  return {
    clinic,
    totalFields: allFields.length,
    filledFields: filled,
    progressPct: pct,
    primaryScore,
    lastUpdated: saved?.updatedAt || null,
    emptySections,
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`
}

export default function AdminDashboard({ clinics, hearingStats = [] }: { clinics: ClinicMaster[]; hearingStats?: HearingStats[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const stats = useMemo(
    () => clinics.map(getClinicStats).sort((a, b) => b.progressPct - a.progressPct),
    [clinics]
  )

  const avgProgress = stats.length > 0 ? Math.round(stats.reduce((s, c) => s + c.progressPct, 0) / stats.length) : 0
  const avgPrimary = stats.length > 0 ? Math.round(stats.filter((s) => s.primaryScore > 0).reduce((s, c) => s + c.primaryScore, 0) / Math.max(1, stats.filter((s) => s.primaryScore > 0).length)) : 0

  return (
    <main className="px-4 py-8 sm:py-12 max-w-2xl mx-auto">
      <a href="/" className="text-sm flex items-center gap-1 mb-4" style={{ color: "var(--md-primary)", textDecoration: "none" }}>
        <ArrowLeft size={20} />
        トップに戻る
      </a>

      <div className="flex items-center gap-3 mb-6">
        <img src="/ponko.png" alt="ぽん子" className="w-10 h-10" />
        <div>
          <h1 className="text-lg font-medium" style={{ color: "var(--md-on-surface)" }}>制作側ダッシュボード</h1>
          <p className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>{clinics.length} 医院 登録済み</p>
        </div>
      </div>

      {stats.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="p-3 text-center" style={{ background: "var(--md-primary-container)", borderRadius: "var(--md-shape-corner-lg)" }}>
            <p className="text-2xl font-bold" style={{ color: "var(--md-primary)" }}>{stats.length}</p>
            <p className="text-[11px]" style={{ color: "var(--md-on-primary-container)" }}>医院数</p>
          </div>
          <div className="p-3 text-center" style={{ background: "var(--md-primary-container)", borderRadius: "var(--md-shape-corner-lg)" }}>
            <p className="text-2xl font-bold" style={{ color: "var(--md-primary)" }}>{avgProgress}%</p>
            <p className="text-[11px]" style={{ color: "var(--md-on-primary-container)" }}>平均進捗</p>
          </div>
          <div className="p-3 text-center" style={{ background: avgPrimary >= 50 ? "var(--md-tertiary-container)" : "var(--md-secondary-container)", borderRadius: "var(--md-shape-corner-lg)" }}>
            <p className="text-2xl font-bold" style={{ color: avgPrimary >= 50 ? "var(--md-tertiary)" : "var(--md-on-surface-variant)" }}>{avgPrimary}%</p>
            <p className="text-[11px]" style={{ color: "var(--md-on-surface-variant)" }}>平均一次情報</p>
          </div>
        </div>
      )}

      <div className="space-y-2 mb-6">
        {stats.map(({ clinic, filledFields, totalFields, progressPct, primaryScore, lastUpdated, emptySections }) => {
          const clinicKey = clinic.contract_no || clinic.id
          const industry = clinic.industry || "dental"
          return (
            <div
              key={clinic.id}
              className="overflow-hidden"
              style={{ background: "var(--md-surface-container)", borderRadius: "var(--md-shape-corner-lg)", boxShadow: "var(--md-elevation-1)" }}
            >
              <button
                onClick={() => setExpandedId(expandedId === clinic.id ? null : clinic.id)}
                className="w-full text-left p-4"
                style={{ background: "transparent", border: "none", cursor: "pointer" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center shrink-0" style={{ background: "var(--md-primary-container)", color: "var(--md-primary)", borderRadius: "var(--md-shape-corner-md)" }}>
                    <Icon name={normalizeIconName(clinic.icon_emoji)} size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">
                        {clinic.clinic_name}
                        <span className="text-[11px] font-normal ml-1.5 px-1.5 py-0.5" style={{ background: "var(--md-secondary-container)", color: "var(--md-on-secondary-container)", borderRadius: "100px" }}>
                          {INDUSTRY_LABELS[industry]}
                        </span>
                      </p>
                      <span className="text-xs font-bold ml-2" style={{ color: progressPct === 100 ? "var(--md-tertiary)" : "var(--md-primary)" }}>
                        {progressPct}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 overflow-hidden" style={{ background: "var(--md-outline-variant)", borderRadius: "100px" }}>
                        <div className="h-full" style={{ width: `${progressPct}%`, background: progressPct === 100 ? "var(--md-tertiary)" : "var(--md-primary)", borderRadius: "100px" }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px]" style={{ color: "var(--md-on-surface-variant)" }}>
                        {filledFields}/{totalFields}項目
                      </span>
                      {primaryScore > 0 && (
                        <span className="text-[11px]" style={{ color: primaryScore >= 50 ? "var(--md-tertiary)" : "var(--md-on-surface-variant)" }}>
                          一次情報 {primaryScore}%
                        </span>
                      )}
                      {lastUpdated && (
                        <span className="text-[11px]" style={{ color: "var(--md-on-surface-variant)" }}>
                          更新 {formatDate(lastUpdated)}
                        </span>
                      )}
                    </div>
                  </div>
                  {expandedId === clinic.id
                    ? <ChevronUp size={20} className="shrink-0" style={{ color: "var(--md-on-surface-variant)" }} />
                    : <ChevronDown size={20} className="shrink-0" style={{ color: "var(--md-on-surface-variant)" }} />
                  }
                </div>
              </button>

              {expandedId === clinic.id && (
                <div className="px-4 pb-4 space-y-3" style={{ borderTop: "1px solid var(--md-outline-variant)" }}>
                  {emptySections.length > 0 && (
                    <div className="pt-3">
                      <p className="text-xs font-medium mb-1.5" style={{ color: "var(--md-error)" }}>
                        未入力セクション（{emptySections.length}）
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {emptySections.map((s, i) => (
                          <span key={i} className="text-[11px] px-2 py-1" style={{ background: "var(--md-error-container)", color: "var(--md-error)", borderRadius: "100px" }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-medium mb-1.5" style={{ color: "var(--md-on-surface-variant)" }}>セクション別進捗</p>
                    <div className="space-y-1">
                      {getSections(industry).map((sec) => {
                        const saved = loadClinicData(clinicKey)
                        const data = saved?.data || {}
                        const secFilled = sec.fields.filter((f) => data[f.name]?.trim()).length
                        const secTotal = sec.fields.length
                        const secPct = secTotal > 0 ? Math.round((secFilled / secTotal) * 100) : 0
                        return (
                          <div key={sec.id} className="flex items-center gap-2">
                            <span className="text-xs w-5">{sec.icon}</span>
                            <span className="text-[11px] flex-1 truncate" style={{ color: "var(--md-on-surface)" }}>{sec.title}</span>
                            <div className="w-16 h-1 overflow-hidden" style={{ background: "var(--md-outline-variant)", borderRadius: "100px" }}>
                              <div className="h-full" style={{ width: `${secPct}%`, background: secPct === 100 ? "var(--md-tertiary)" : "var(--md-primary)", borderRadius: "100px" }} />
                            </div>
                            <span className="text-[11px] w-8 text-right font-bold" style={{ color: secPct === 100 ? "var(--md-tertiary)" : "var(--md-on-surface-variant)" }}>
                              {secPct}%
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <a href={`/clinic/${clinicKey}`} className="text-xs font-medium px-3 py-2 flex items-center gap-1" style={{ background: "var(--md-primary)", color: "var(--md-on-primary)", borderRadius: "100px", textDecoration: "none" }}>
                      開く
                    </a>
                    <button onClick={() => exportAsText(clinicKey, loadClinicData(clinicKey)?.data || {}, industry)} className="text-xs font-medium px-3 py-2" style={{ background: "var(--md-surface-container-low)", color: "var(--md-on-surface)", borderRadius: "100px", border: "1px solid var(--md-outline-variant)", cursor: "pointer" }}>
                      テキスト出力
                    </button>
                    <button onClick={() => exportAsJson(clinicKey, loadClinicData(clinicKey)?.data || {}, industry)} className="text-xs font-medium px-3 py-2" style={{ background: "var(--md-surface-container-low)", color: "var(--md-on-surface)", borderRadius: "100px", border: "1px solid var(--md-outline-variant)", cursor: "pointer" }}>
                      JSON出力
                    </button>
                    <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/clinic/${clinicKey}`); alert("URLをコピーしました"); }} className="text-xs font-medium px-3 py-2" style={{ background: "var(--md-surface-container-low)", color: "var(--md-on-surface)", borderRadius: "100px", border: "1px solid var(--md-outline-variant)", cursor: "pointer" }}>
                      URL共有
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-xs text-center py-4" style={{ color: "var(--md-on-surface-variant)" }}>
        クリニックの追加・削除は kantsuku-hub から行ってください
      </p>
    </main>
  )
}
