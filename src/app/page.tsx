import { getClinicList } from "@/lib/actions/clinics"
import ClinicListClient from "@/components/ClinicListClient"

export const dynamic = "force-dynamic"

export default async function Home() {
  const clinics = await getClinicList()

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

        <ClinicListClient clinics={clinics} />

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
  )
}
