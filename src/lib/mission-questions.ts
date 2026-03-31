/**
 * 診療理念ツクール — 質問定義
 * 性格診断レベルの深いヒアリング
 */

export type QType = "text" | "select" | "multi";

export interface MissionQuestion {
  key: string;
  label: string;
  type: QType;
  placeholder?: string;
  options?: string[];
}

export interface MissionCategory {
  id: string;
  title: string;
  icon: string;
  questions: MissionQuestion[];
}

export const MISSION_CATEGORIES: MissionCategory[] = [
  {
    id: "profile", title: "先生について", icon: "👤",
    questions: [
      { key: "p_personality", label: "自分の性格を一言で表すと？", type: "select", options: ["慎重派", "挑戦派", "職人気質", "情熱的", "穏やか", "合理的", "繊細", "大胆"] },
      { key: "p_strength", label: "自分の一番の強みは？", type: "select", options: ["技術力", "説明力", "人柄・信頼感", "判断力", "学び続ける姿勢", "チームづくり", "患者との距離感", "経営センス"] },
      { key: "p_hobby", label: "仕事以外で夢中になれることは？", type: "text", placeholder: "趣味や情熱を注いでいること" },
      { key: "p_role_model", label: "影響を受けた人は？", type: "text", placeholder: "恩師・先輩・家族など" },
    ],
  },
  {
    id: "origin", title: "原点・動機", icon: "🌱",
    questions: [
      { key: "o_why_dentist", label: "なぜ歯科医師に？", type: "text", placeholder: "原体験やきっかけ" },
      { key: "o_opening_type", label: "開業の形態は？", type: "select", options: ["新規開業", "継承（親族）", "継承（第三者）", "分院展開"] },
      { key: "o_opening_reason", label: "開業を決意した理由は？", type: "text", placeholder: "自分の医院を持ちたいと思ったきっかけ" },
      { key: "o_regret", label: "歯科医師として一番悔しかった経験は？", type: "text", placeholder: "今の診療に影響を与えた経験" },
      { key: "o_joy", label: "一番嬉しかった経験は？", type: "text", placeholder: "この瞬間のためにやっている、ということ" },
      { key: "o_prev_frustration", label: "勤務医時代に「自分ならこうする」と思ったことは？", type: "text", placeholder: "開業後に実現したこと" },
    ],
  },
  {
    id: "area", title: "地域・立地", icon: "📍",
    questions: [
      { key: "a_local_love", label: "この地域への想いは？", type: "select", options: ["地元で育った", "縁があって選んだ", "市場を見て選んだ", "たまたまだが今は愛着がある"] },
      { key: "a_area_role", label: "この地域で医院が果たすべき役割は？", type: "text", placeholder: "地域にとってどんな存在でありたいか" },
      { key: "a_community", label: "地域活動への関わりは？", type: "multi", options: ["学校歯科", "地域イベント", "高齢者施設連携", "子育て支援", "特になし"] },
    ],
  },
  {
    id: "target", title: "ターゲット・患者像", icon: "👥",
    questions: [
      { key: "t_main_age", label: "メインの患者層は？", type: "multi", options: ["小児（0-12歳）", "中高生", "20-30代", "40-50代", "60代以上", "特に絞っていない"] },
      { key: "t_main_concern", label: "患者さんの一番多い悩みは？", type: "multi", options: ["虫歯", "歯周病", "見た目・審美", "歯並び", "入れ歯", "歯科恐怖症", "メンテナンス", "親知らず"] },
      { key: "t_ideal_patient", label: "「この患者さんのためにこの医院がある」と思える人は？", type: "text", placeholder: "具体的な人物像を1人" },
      { key: "t_relationship", label: "患者さんとの理想の距離感は？", type: "select", options: ["かかりつけの先生", "頼れる専門家", "家族のような存在", "人生のパートナー"] },
      { key: "t_not_for", label: "逆に「うちに合わない」と感じるタイプは？", type: "text", placeholder: "正直に" },
    ],
  },
  {
    id: "style", title: "診療スタイル", icon: "🦷",
    questions: [
      { key: "s_priority", label: "治療で最優先にすることは？", type: "select", options: ["痛みの軽減", "歯の保存", "長期的な予後", "見た目の美しさ", "患者の希望", "エビデンス重視"] },
      { key: "s_approach", label: "診療のアプローチは？", type: "select", options: ["予防重視", "治療重視", "審美重視", "総合的にバランス", "専門特化"] },
      { key: "s_counseling", label: "カウンセリングのスタイルは？", type: "select", options: ["じっくり時間をかける", "要点を端的に伝える", "選択肢を全て提示する", "最善を1つ提案する"] },
      { key: "s_tech_stance", label: "新しい技術への姿勢は？", type: "select", options: ["最新を積極導入", "実績が出てから導入", "必要最低限", "患者ニーズがあれば"] },
      { key: "s_difference", label: "他の医院がやっていなくてうちがやっていることは？", type: "text", placeholder: "小さなことでもOK" },
    ],
  },
  {
    id: "value", title: "価値観・こだわり", icon: "💎",
    questions: [
      { key: "v_most_important", label: "一番大切にしていることは？", type: "text", placeholder: "医院経営で絶対に譲れないこと" },
      { key: "v_quality_std", label: "「これだけは譲れない」品質基準は？", type: "text", placeholder: "例：マイクロスコープを必ず使う" },
      { key: "v_unique_value", label: "治療の質以外で提供したい価値は？", type: "multi", options: ["安心感", "教育・啓発", "人生の質向上", "美の追求", "時間の節約", "恐怖心の克服", "家族の健康"] },
      { key: "v_insurance_vs_self", label: "保険 vs 自費、力を入れたいのは？", type: "select", options: ["保険中心", "自費を積極提案", "患者に合わせて使い分け", "こだわりなし"] },
    ],
  },
  {
    id: "not", title: "やらないこと", icon: "🚫",
    questions: [
      { key: "n_never_patient", label: "患者さんに絶対にしないことは？", type: "text", placeholder: "どんな状況でも譲れない一線" },
      { key: "n_never_profit", label: "売上のためにやりたくないことは？", type: "text", placeholder: "経営と理念の境界線" },
      { key: "n_never_others", label: "他院がやっていて自分はやらないことは？", type: "text", placeholder: "意識的にやらない判断" },
      { key: "n_dilemma", label: "2つの正しさがぶつかったらどちらを優先する？", type: "select", options: ["患者の希望 > 医学的正解", "医学的正解 > 患者の希望", "ケースバイケース", "とことん話し合う"] },
    ],
  },
  {
    id: "vision", title: "ビジョン・未来", icon: "🔭",
    questions: [
      { key: "vi_5year", label: "5年後の医院の姿は？", type: "text", placeholder: "規模・評判・診療内容・地域での立ち位置" },
      { key: "vi_10year", label: "10年後、先生個人としてどうなっていたい？", type: "text", placeholder: "医院だけでなく人生として" },
      { key: "vi_success", label: "「成功した」と思える状態は？", type: "text", placeholder: "数字ではなく状態や感情として" },
      { key: "vi_legacy", label: "医院を通じて残したいものは？", type: "select", options: ["地域の健康文化", "次世代の育成", "患者との絆", "技術の継承", "新しい歯科のあり方"] },
    ],
  },
  {
    id: "emotion", title: "感情・葛藤", icon: "💭",
    questions: [
      { key: "e_hardest", label: "開院して一番大変だったことは？", type: "text", placeholder: "どう乗り越えたかも" },
      { key: "e_tension", label: "診療中に一番緊張する瞬間は？", type: "text", placeholder: "その緊張とどう向き合うか" },
      { key: "e_good_day", label: "「今日は良い一日だった」の基準は？", type: "text", placeholder: "何があれば良い一日？" },
      { key: "e_motivation", label: "モチベーションの源は？", type: "select", options: ["患者の笑顔", "技術の向上", "スタッフの成長", "経営の成長", "学びと挑戦", "家族のため"] },
    ],
  },
  {
    id: "team", title: "チーム・組織", icon: "🤝",
    questions: [
      { key: "tm_message", label: "スタッフに一番伝えたいことは？", type: "text", placeholder: "毎日の行動に影響する言葉" },
      { key: "tm_hire_priority", label: "採用で最重視するポイントは？", type: "select", options: ["人柄・素直さ", "スキル・経験", "価値観の一致", "成長意欲", "コミュニケーション力"] },
      { key: "tm_culture", label: "理想のチーム像は？", type: "select", options: ["家族のような温かさ", "プロ集団の緊張感", "フラットで意見を言い合える", "規律正しく統制がとれた", "自由で創造的"] },
      { key: "tm_growth", label: "スタッフの成長にどう関わる？", type: "select", options: ["積極的に教える", "自主性に任せる", "外部研修を推奨", "背中を見せる"] },
    ],
  },
  {
    id: "comm", title: "コミュニケーション", icon: "💬",
    questions: [
      { key: "c_first_impression", label: "初診の患者さんに一番伝えたいことは？", type: "text", placeholder: "最初の5分で何を伝えたいか" },
      { key: "c_explain_style", label: "説明のスタイルは？", type: "select", options: ["図や写真で視覚的に", "数字とデータで論理的に", "例え話でわかりやすく", "結論を先に端的に"] },
      { key: "c_bad_news", label: "悪い診断結果の伝え方は？", type: "select", options: ["正直にストレートに", "希望を持てるように配慮して", "選択肢と一緒に提示して", "段階的にゆっくり"] },
    ],
  },
];

export const ALL_MISSION_QUESTIONS = MISSION_CATEGORIES.flatMap((c) => c.questions);
