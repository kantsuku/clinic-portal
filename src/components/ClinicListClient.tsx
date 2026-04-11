"use client"

import type { ClinicMaster } from "@/lib/actions/clinics"
import { ChevronRight } from "lucide-react"
import Icon, { normalizeIconName } from "./Icon"

export default function ClinicListClient({ clinics }: { clinics: ClinicMaster[] }) {
  return (
    <div className="space-y-2">
      {clinics.map((clinic) => (
        <a
          key={clinic.id}
          href={`/clinic/${clinic.contract_no || clinic.id}`}
          className="block w-full text-left p-4 md-state-layer"
          style={{
            background: "var(--md-surface-container)",
            borderRadius: "var(--md-shape-corner-lg)",
            boxShadow: "var(--md-elevation-1)",
            textDecoration: "none",
            color: "var(--md-on-surface)",
            transition: "box-shadow 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.boxShadow = "var(--md-elevation-2)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.boxShadow = "var(--md-elevation-1)")
          }
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 flex items-center justify-center"
              style={{
                background: "var(--md-primary-container)",
                color: "var(--md-primary)",
                borderRadius: "var(--md-shape-corner-md)",
              }}
            >
              <Icon name={normalizeIconName(clinic.icon_emoji)} size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">{clinic.clinic_name}</p>
              <p
                className="text-xs font-mono"
                style={{ color: "var(--md-on-surface-variant)" }}
              >
                {clinic.contract_no || clinic.id.slice(0, 8)}
              </p>
            </div>
            <ChevronRight
              size={20}
              className="shrink-0"
              style={{ color: "var(--md-on-surface-variant)" }}
            />
          </div>
        </a>
      ))}

      {clinics.length === 0 && (
        <p
          className="text-sm py-8"
          style={{ color: "var(--md-on-surface-variant)" }}
        >
          登録されている医院がありません
        </p>
      )}
    </div>
  )
}
