"use client";

import { getAllClinics } from "@/lib/clinics";

export default function Home() {
  const clinics = getAllClinics();

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <img
          src="/ponko.png"
          alt="ぽん子"
          className="w-20 h-20 mx-auto mb-4 ponko-jump"
        />
        <h1
          className="text-[22px] font-medium tracking-tight mb-1"
          style={{ color: "var(--md-on-surface)" }}
        >
          Clinic Portal{" "}
          <span
            className="font-normal text-sm"
            style={{ color: "var(--md-on-surface-variant)" }}
          >
            by Ponko
          </span>
        </h1>
        <p
          className="text-sm mb-8"
          style={{ color: "var(--md-on-surface-variant)" }}
        >
          医院を選んでください
        </p>

        <div className="space-y-2">
          {clinics.map((clinic) => (
            <a
              key={clinic.id}
              href={`/clinic/${clinic.id}`}
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
                  className="w-10 h-10 flex items-center justify-center text-lg font-bold"
                  style={{
                    background: "var(--md-primary-container)",
                    color: "var(--md-primary)",
                    borderRadius: "var(--md-shape-corner-md)",
                  }}
                >
                  {clinic.name[0]}
                </div>
                <div>
                  <p className="font-medium text-sm">{clinic.name}</p>
                  <p
                    className="text-xs font-mono"
                    style={{ color: "var(--md-on-surface-variant)" }}
                  >
                    {clinic.id}
                  </p>
                </div>
                <svg
                  className="w-5 h-5 ml-auto"
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
        </div>

        <a
          href="/admin"
          className="block mt-6 text-xs font-medium py-2"
          style={{
            color: "var(--md-on-surface-variant)",
            textDecoration: "none",
          }}
        >
          管理画面
        </a>
      </div>
    </main>
  );
}
