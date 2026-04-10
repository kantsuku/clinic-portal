"use client"

import type { ClinicMaster } from "@/lib/actions/clinics"

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
              className="w-10 h-10 flex items-center justify-center text-lg"
              style={{
                background: "var(--md-primary-container)",
                color: "var(--md-primary)",
                borderRadius: "var(--md-shape-corner-md)",
              }}
            >
              {clinic.icon_emoji || clinic.clinic_name[0]}
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
            <svg
              className="w-5 h-5 shrink-0"
              style={{ color: "var(--md-on-surface-variant)" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
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
