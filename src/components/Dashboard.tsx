"use client";

import { sections } from "@/lib/schema";

interface DashboardProps {
  values: Record<string, string>;
  onSelectSection: (sectionId: string) => void;
}

export default function Dashboard({ values, onSelectSection }: DashboardProps) {
  const sectionStats = sections.map((section) => {
    const filled = section.fields.filter(
      (f) => values[f.name]?.trim()
    ).length;
    const total = section.fields.length;
    const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
    return { section, filled, total, pct };
  });

  const totalFilled = sectionStats.reduce((sum, s) => sum + s.filled, 0);
  const totalFields = sectionStats.reduce((sum, s) => sum + s.total, 0);
  const overallPct =
    totalFields > 0 ? Math.round((totalFilled / totalFields) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Clinic Portal</h1>
        <p className="text-gray-500 text-sm">
          医院の情報を入力してください
        </p>
      </div>

      {/* 全体進捗 */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-600">
            全体の入力進捗
          </span>
          <span className="text-2xl font-bold text-blue-600">
            {overallPct}%
          </span>
        </div>
        <div className="bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${overallPct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {totalFilled} / {totalFields} 項目入力済み
        </p>
      </div>

      {/* セクション一覧 */}
      <div className="space-y-3">
        {sectionStats.map(({ section, filled, total, pct }) => (
          <button
            key={section.id}
            onClick={() => onSelectSection(section.id)}
            className="w-full bg-white rounded-xl shadow-sm border p-4 hover:shadow-md hover:border-blue-200 transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl group-hover:scale-110 transition-transform">
                {section.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm">{section.title}</h3>
                  <span className="text-xs text-gray-400">
                    {filled}/{total}
                  </span>
                </div>
                <div className="bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      pct === 100
                        ? "bg-green-500"
                        : pct > 0
                          ? "bg-blue-500"
                          : "bg-gray-300"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {section.description}
                </p>
              </div>
              <svg
                className="w-5 h-5 text-gray-300 group-hover:text-blue-400 transition-colors shrink-0"
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
          </button>
        ))}
      </div>
    </div>
  );
}
