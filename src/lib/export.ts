/**
 * 入力データのエクスポート
 */

import { getSections } from "./schema";

type IndustryType = "dental" | "corporate";

/** JSON形式でダウンロード */
export function exportAsJson(clinicId: string, data: Record<string, string>, industry?: IndustryType) {
  const industrySections = getSections(industry);
  const exportData = {
    clinicId,
    exportedAt: new Date().toISOString(),
    sections: industrySections.map((section) => ({
      id: section.id,
      title: section.title,
      step: section.step,
      fields: section.fields.map((field) => ({
        name: field.name,
        label: field.label,
        dnaSheet: field.dnaSheet,
        dnaField: field.dnaField,
        value: data[field.name] || "",
      })).filter((f) => f.value),
    })).filter((s) => s.fields.length > 0),
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  downloadBlob(blob, `clinic-portal-${clinicId}-${dateStr()}.json`);
}

/** テキスト形式でダウンロード */
export function exportAsText(clinicId: string, data: Record<string, string>, industry?: IndustryType) {
  const industrySections = getSections(industry);
  const lines: string[] = [
    `=== Clinic Portal データエクスポート ===`,
    `医院ID: ${clinicId}`,
    `出力日: ${new Date().toLocaleString("ja-JP")}`,
    ``,
  ];

  for (const section of industrySections) {
    const filledFields = section.fields.filter((f) => data[f.name]?.trim());
    if (filledFields.length === 0) continue;

    lines.push(`━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`${section.icon} ${section.title}`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━`);
    lines.push(``);

    for (const field of filledFields) {
      lines.push(`【${field.label}】`);
      lines.push(data[field.name]);
      lines.push(``);
    }
  }

  const blob = new Blob([lines.join("\n")], { type: "text/plain; charset=utf-8" });
  downloadBlob(blob, `clinic-portal-${clinicId}-${dateStr()}.txt`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function dateStr(): string {
  return new Date().toISOString().slice(0, 10);
}
