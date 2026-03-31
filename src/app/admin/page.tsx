"use client";

import { useState, useEffect, useMemo } from "react";
import { getAllClinics, addClinic, deleteClinic, INDUSTRY_LABELS, type ClinicConfig, type IndustryType } from "@/lib/clinics";
import { loadClinicData } from "@/lib/storage";
import { getSections } from "@/lib/schema";
import { analyzePrimaryInfo } from "@/lib/primary-info-analyzer";
import { exportAsText, exportAsJson } from "@/lib/export";

interface ClinicStats {
  clinic: ClinicConfig;
  totalFields: number;
  filledFields: number;
  progressPct: number;
  primaryScore: number;
  lastUpdated: string | null;
  emptySectons: string[];
}

function getClinicStats(clinic: ClinicConfig): ClinicStats {
  const saved = loadClinicData(clinic.id);
  const data = saved?.data || {};
  const industrySections = getSections(clinic.industry);
  const allFields = industrySections.flatMap((s) => s.fields);
  const filled = allFields.filter((f) => data[f.name]?.trim()).length;
  const pct = allFields.length > 0 ? Math.round((filled / allFields.length) * 100) : 0;

  // 一次情報スコア
  let totalScore = 0;
  let scoreCount = 0;
  for (const field of allFields) {
    if ((field.type === "textarea" || field.type === "repeater") && data[field.name]?.trim()?.length > 10) {
      totalScore += analyzePrimaryInfo(data[field.name]).score;
      scoreCount++;
    }
  }
  const primaryScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

  // 未入力セクション
  const emptySections = industrySections
    .filter((s) => s.fields.every((f) => !data[f.name]?.trim()))
    .map((s) => `${s.icon} ${s.title}`);

  return {
    clinic,
    totalFields: allFields.length,
    filledFields: filled,
    progressPct: pct,
    primaryScore,
    lastUpdated: saved?.updatedAt || null,
    emptySectons: emptySections,
  };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function AdminPage() {
  const [clinics, setClinics] = useState<ClinicConfig[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newIndustry, setNewIndustry] = useState<IndustryType>("dental");
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { setClinics(getAllClinics()); }, []);

  const stats = useMemo(() =>
    clinics.map(getClinicStats).sort((a, b) => b.progressPct - a.progressPct),
    [clinics]
  );

  const avgProgress = stats.length > 0 ? Math.round(stats.reduce((s, c) => s + c.progressPct, 0) / stats.length) : 0;
  const avgPrimary = stats.length > 0 ? Math.round(stats.filter(s => s.primaryScore > 0).reduce((s, c) => s + c.primaryScore, 0) / Math.max(1, stats.filter(s => s.primaryScore > 0).length)) : 0;

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const id = newId.trim().replace(/\s+/g, "_").toUpperCase();
    if (!id || !newName.trim()) { setError("IDと医院名は必須です"); return; }
    try {
      addClinic({ id, name: newName.trim(), password: newPassword, industry: newIndustry });
      setClinics(getAllClinics());
      setNewId(""); setNewName(""); setNewPassword(""); setShowForm(false);
    } catch (e) { setError(e instanceof Error ? e.message : "追加に失敗しました"); }
  }

  function handleDelete(id: string) {
    if (!confirm(`「${id}」を削除しますか？`)) return;
    deleteClinic(id);
    setClinics(getAllClinics());
  }

  return (
    <main className="px-4 py-8 sm:py-12 max-w-2xl mx-auto">
      <a href="/" className="text-sm flex items-center gap-1 mb-4" style={{ color: "var(--md-primary)", textDecoration: "none" }}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        トップに戻る
      </a>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <img src="/ponko.png" alt="ぽん子" className="w-10 h-10" />
        <div>
          <h1 className="text-lg font-medium" style={{ color: "var(--md-on-surface)" }}>制作側ダッシュボード</h1>
          <p className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>{clinics.length} 医院 登録済み</p>
        </div>
      </div>

      {/* Summary cards */}
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

      {/* Clinic list */}
      <div className="space-y-2 mb-6">
        {stats.map(({ clinic, filledFields, totalFields, progressPct, primaryScore, lastUpdated, emptySectons }) => (
          <div
            key={clinic.id}
            className="overflow-hidden"
            style={{ background: "var(--md-surface-container)", borderRadius: "var(--md-shape-corner-lg)", boxShadow: "var(--md-elevation-1)" }}
          >
            {/* Main row */}
            <button
              onClick={() => setExpandedId(expandedId === clinic.id ? null : clinic.id)}
              className="w-full text-left p-4"
              style={{ background: "transparent", border: "none", cursor: "pointer" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center text-lg font-bold shrink-0" style={{ background: "var(--md-primary-container)", color: "var(--md-primary)", borderRadius: "var(--md-shape-corner-md)" }}>
                  {clinic.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm truncate">
                    {clinic.name}
                    <span className="text-[11px] font-normal ml-1.5 px-1.5 py-0.5" style={{ background: "var(--md-secondary-container)", color: "var(--md-on-secondary-container)", borderRadius: "100px" }}>
                      {INDUSTRY_LABELS[clinic.industry || "dental"]}
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
                <svg className="w-5 h-5 shrink-0 transition-transform" style={{ color: "var(--md-on-surface-variant)", transform: expandedId === clinic.id ? "rotate(180deg)" : "" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Expanded detail */}
            {expandedId === clinic.id && (
              <div className="px-4 pb-4 space-y-3" style={{ borderTop: "1px solid var(--md-outline-variant)" }}>
                {/* Empty sections */}
                {emptySectons.length > 0 && (
                  <div className="pt-3">
                    <p className="text-xs font-medium mb-1.5" style={{ color: "var(--md-error)" }}>
                      未入力セクション（{emptySectons.length}）
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {emptySectons.map((s, i) => (
                        <span key={i} className="text-[11px] px-2 py-1" style={{ background: "var(--md-error-container)", color: "var(--md-error)", borderRadius: "100px" }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section breakdown */}
                <div>
                  <p className="text-xs font-medium mb-1.5" style={{ color: "var(--md-on-surface-variant)" }}>セクション別進捗</p>
                  <div className="space-y-1">
                    {getSections(clinic.industry).map((sec) => {
                      const saved = loadClinicData(clinic.id);
                      const data = saved?.data || {};
                      const secFilled = sec.fields.filter((f) => data[f.name]?.trim()).length;
                      const secTotal = sec.fields.length;
                      const secPct = secTotal > 0 ? Math.round((secFilled / secTotal) * 100) : 0;
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
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <a href={`/clinic/${clinic.id}`} className="text-xs font-medium px-3 py-2 flex items-center gap-1" style={{ background: "var(--md-primary)", color: "var(--md-on-primary)", borderRadius: "100px", textDecoration: "none" }}>
                    開く
                  </a>
                  <button onClick={() => exportAsText(clinic.id, loadClinicData(clinic.id)?.data || {})} className="text-xs font-medium px-3 py-2" style={{ background: "var(--md-surface-container-low)", color: "var(--md-on-surface)", borderRadius: "100px", border: "1px solid var(--md-outline-variant)", cursor: "pointer" }}>
                    テキスト出力
                  </button>
                  <button onClick={() => exportAsJson(clinic.id, loadClinicData(clinic.id)?.data || {})} className="text-xs font-medium px-3 py-2" style={{ background: "var(--md-surface-container-low)", color: "var(--md-on-surface)", borderRadius: "100px", border: "1px solid var(--md-outline-variant)", cursor: "pointer" }}>
                    JSON出力
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/clinic/${clinic.id}`); alert("URLをコピーしました"); }} className="text-xs font-medium px-3 py-2" style={{ background: "var(--md-surface-container-low)", color: "var(--md-on-surface)", borderRadius: "100px", border: "1px solid var(--md-outline-variant)", cursor: "pointer" }}>
                    URL共有
                  </button>
                  <button onClick={() => handleDelete(clinic.id)} className="text-xs font-medium px-3 py-2" style={{ background: "transparent", color: "var(--md-error)", borderRadius: "100px", border: "1px solid var(--md-error)", cursor: "pointer" }}>
                    削除
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add form */}
      {showForm ? (
        <form onSubmit={handleAdd} className="p-5 space-y-4" style={{ background: "var(--md-surface-container)", borderRadius: "var(--md-shape-corner-xl)", boxShadow: "var(--md-elevation-2)" }}>
          <h3 className="font-medium text-sm">新しいクリニックを追加</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--md-on-surface-variant)" }}>クリニックID（英数字）</label>
              <input type="text" className="w-full" placeholder="例：KEYAKI_DC" value={newId} onChange={(e) => setNewId(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--md-on-surface-variant)" }}>医院名</label>
              <input type="text" className="w-full" placeholder="例：けやき歯科クリニック" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--md-on-surface-variant)" }}>業種</label>
              <div className="flex gap-2">
                {(Object.entries(INDUSTRY_LABELS) as [IndustryType, string][]).map(([key, label]) => (
                  <button key={key} type="button" onClick={() => setNewIndustry(key)}
                    className="text-xs font-medium px-4 py-2 flex-1"
                    style={{
                      background: newIndustry === key ? "var(--md-primary)" : "var(--md-surface-container-low)",
                      color: newIndustry === key ? "var(--md-on-primary)" : "var(--md-on-surface-variant)",
                      borderRadius: "100px", border: newIndustry === key ? "none" : "1px solid var(--md-outline-variant)", cursor: "pointer",
                    }}
                  >{label}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--md-on-surface-variant)" }}>パスワード（空欄ならなし）</label>
              <input type="text" className="w-full" placeholder="任意" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
          </div>
          {error && <p className="text-xs" style={{ color: "var(--md-error)" }}>{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-2.5 text-sm font-medium" style={{ background: "var(--md-primary)", color: "var(--md-on-primary)", borderRadius: "100px", border: "none", cursor: "pointer" }}>追加する</button>
            <button type="button" onClick={() => { setShowForm(false); setError(""); }} className="px-4 py-2.5 text-sm font-medium" style={{ background: "transparent", color: "var(--md-on-surface-variant)", borderRadius: "100px", border: "1px solid var(--md-outline)", cursor: "pointer" }}>キャンセル</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setShowForm(true)} className="w-full py-3 text-sm font-medium flex items-center justify-center gap-2" style={{ background: "var(--md-primary)", color: "var(--md-on-primary)", borderRadius: "100px", border: "none", cursor: "pointer" }}>
          + クリニックを追加
        </button>
      )}
    </main>
  );
}
