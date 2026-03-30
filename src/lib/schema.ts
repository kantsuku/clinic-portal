/**
 * ヒアリングフォームのセクション・フィールド定義
 * DNA-OS の SHEET_FIELD_SCHEMA と対応
 */

export type FieldType =
  | "text"
  | "textarea"
  | "date"
  | "tel"
  | "url"
  | "select"
  | "weekday-hours"
  | "repeater"
  | "sns"
  | "payment";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  hint?: string;
  dnaSheet: string;
  dnaField: string;
  required?: boolean;
  options?: string[];
}

export interface SectionDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  fields: FieldDef[];
}

// ── セクション定義 ─────────────────────────────────────────

export const sections: SectionDef[] = [
  {
    id: "basic",
    title: "基本情報",
    description: "医院の基本的な情報を入力してください",
    icon: "🏥",
    fields: [
      {
        name: "clinic_name",
        label: "医院名",
        type: "text",
        placeholder: "例：〇〇歯科クリニック",
        dnaSheet: "00_Clinic",
        dnaField: "clinic_name",
        required: true,
      },
      {
        name: "opening_date",
        label: "開院年月日",
        type: "date",
        dnaSheet: "00_Clinic",
        dnaField: "opening_date",
      },
      {
        name: "address",
        label: "医院住所",
        type: "text",
        placeholder: "例：東京都渋谷区〇〇1-2-3 〇〇ビル2F",
        dnaSheet: "00_Clinic",
        dnaField: "address",
      },
      {
        name: "area_secondary",
        label: "アクセス",
        type: "text",
        placeholder: "例：〇〇線〇〇駅 徒歩5分",
        dnaSheet: "00_Clinic",
        dnaField: "area_secondary",
      },
      {
        name: "phone",
        label: "予約電話番号",
        type: "tel",
        placeholder: "例：03-1234-5678",
        dnaSheet: "00_Clinic",
        dnaField: "phone",
      },
      {
        name: "clinic_url",
        label: "医院URL（既存サイトがあれば）",
        type: "url",
        placeholder: "例：https://example-dental.com",
        dnaSheet: "00_Clinic",
        dnaField: "clinic_url",
      },
      {
        name: "reservation_flow",
        label: "ネット予約URL（有・無）",
        type: "text",
        placeholder: "例：あり（URL未定）",
        dnaSheet: "00_Clinic",
        dnaField: "reservation_flow",
      },
      {
        name: "clinic_hours",
        label: "診療時間",
        type: "weekday-hours",
        hint: "各曜日の診療時間を入力してください",
        dnaSheet: "00_Clinic",
        dnaField: "clinic_hours",
      },
      {
        name: "sns_accounts",
        label: "SNSアカウント",
        type: "sns",
        hint: "利用しているSNSのURLを入力してください",
        dnaSheet: "00_Clinic",
        dnaField: "sns_accounts",
      },
      {
        name: "payment_methods",
        label: "お支払い方法",
        type: "payment",
        hint: "利用可能な支払い方法を選択してください",
        dnaSheet: "00_Clinic",
        dnaField: "payment_methods",
      },
    ],
  },
  {
    id: "director",
    title: "院長プロフィール",
    description: "院長先生の情報を入力してください",
    icon: "👨‍⚕️",
    fields: [
      {
        name: "director_name",
        label: "院長先生のお名前",
        type: "text",
        placeholder: "例：山田 太郎（やまだ たろう）",
        dnaSheet: "10_Staff_Master",
        dnaField: "name",
        required: true,
      },
      {
        name: "director_origin",
        label: "院長先生のご出身",
        type: "text",
        placeholder: "例：東京都出身",
        dnaSheet: "10_Staff_Master",
        dnaField: "career_summary",
      },
      {
        name: "director_career",
        label: "院長先生のご経歴",
        type: "textarea",
        placeholder:
          "例：\n〇〇大学卒業\n〇〇医院勤務\n2020年 〇〇歯科クリニック開院",
        dnaSheet: "10_Staff_Master",
        dnaField: "career_summary",
      },
      {
        name: "director_qualifications",
        label: "資格・所属学会",
        type: "textarea",
        placeholder:
          "例：\nインプラント専門医\n日本口腔インプラント学会 所属",
        dnaSheet: "10_Staff_Master",
        dnaField: "qualification_summary",
      },
    ],
  },
  {
    id: "philosophy",
    title: "理念・想い",
    description: "医院の理念や先生の想いを教えてください",
    icon: "💡",
    fields: [
      {
        name: "motivation",
        label: "歯科医師を目指したきっかけ",
        type: "textarea",
        placeholder: "自由にお書きください",
        hint: "先生の原点となるエピソードを教えてください",
        dnaSheet: "03_DNA_Master",
        dnaField: "content",
      },
      {
        name: "memorable_episode",
        label: "印象に残っている患者さんエピソード",
        type: "textarea",
        placeholder: "自由にお書きください",
        hint: "先生の診療への想いが伝わるエピソードがあれば",
        dnaSheet: "03_DNA_Master",
        dnaField: "content",
      },
      {
        name: "philosophy",
        label: "診療理念・方針",
        type: "textarea",
        placeholder:
          "例：当医院では、親身な医療をプロの立場で行うことが診療理念です。患者さんに対し親身であること、プロであることを大事にしています。",
        hint: "医院として大切にしている考えを教えてください",
        dnaSheet: "03_DNA_Master",
        dnaField: "content",
      },
      {
        name: "director_greeting",
        label: "院長先生のご挨拶文",
        type: "textarea",
        placeholder:
          "例：当院では多くの方にストレスなく通院いただけるよう、お一人おひとりのご要望をしっかりと伺い、ライフスタイルや価値観に沿った治療を行っています。",
        hint: "HPに掲載する院長メッセージです",
        dnaSheet: "00_Clinic",
        dnaField: "director_greeting",
      },
    ],
  },
  {
    id: "features",
    title: "医院の特徴・設備",
    description: "クリニックの特徴や設備をアピールしてください",
    icon: "⭐",
    fields: [
      {
        name: "clinic_features",
        label: "クリニックの特徴（6つほど）",
        type: "repeater",
        placeholder: "特徴を入力",
        hint: "直感的な言葉でOKです。それぞれ簡単な説明もお願いします",
        dnaSheet: "00_Clinic",
        dnaField: "notes",
      },
      {
        name: "treatment_flow",
        label: "診療の流れ（初診の方向け）",
        type: "textarea",
        placeholder:
          "例：\n1. ご来院・受付\n2. 問診・カウンセリング\n3. 検査（レントゲン・CT等）\n4. 治療計画の説明\n5. 治療\n6. メインテナンス・定期検診",
        dnaSheet: "00_Clinic",
        dnaField: "treatment_flow",
      },
      {
        name: "equipment_summary",
        label: "アピールしたい設備や機器",
        type: "repeater",
        placeholder: "設備名を入力",
        hint: "設備名と簡単な説明を入力してください",
        dnaSheet: "00_Clinic",
        dnaField: "equipment_summary",
      },
    ],
  },
];

// ── ヘルパー ─────────────────────────────────────────────

export function getSectionById(id: string): SectionDef | undefined {
  return sections.find((s) => s.id === id);
}

export function getAllFieldNames(): string[] {
  return sections.flatMap((s) => s.fields.map((f) => f.name));
}

/** 全フィールドのデフォルト値（空文字）を生成 */
export function getDefaultValues(): Record<string, string> {
  const values: Record<string, string> = {};
  for (const section of sections) {
    for (const field of section.fields) {
      values[field.name] = "";
    }
  }
  return values;
}
