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
  | "payment"
  | "checklist"
  | "tone-manner"
  | "staff-repeater";

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
  /** repeater: デフォルト表示件数 */
  defaultCount?: number;
  /** repeater: テンプレートサジェスション */
  suggestions?: { title: string; description: string }[];
  /** repeater: AIサジェスト（機器名→説明文） */
  enableAiSuggest?: boolean;
  /** textarea: 表示行数 */
  rows?: number;
  /** textarea: テキストサジェスション（タップで挿入） */
  textSuggestions?: { label: string; text: string }[];
  /** checklist: カテゴリ別チェックリスト */
  checklistCategories?: { name: string; items: string[] }[];
  /** tone-manner: トーン&マナー選択カテゴリ */
  toneCategories?: { name: string; key: string; options: string[]; multiple?: boolean; custom?: boolean }[];
}

export interface SectionDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  fields: FieldDef[];
  /** ステップ番号（1 or 2） */
  step: 1 | 2;
  /** 推定所要時間（分） */
  estimatedMinutes?: number;
}

export interface StepDef {
  step: 1 | 2;
  title: string;
  description: string;
}

export const steps: StepDef[] = [
  { step: 1, title: "ステップ1", description: "まずはここから！医院の基本情報と方針を固めましょう" },
  { step: 2, title: "ステップ2", description: "深掘りタイム！先生のエピソードと詳細情報を聞かせてください" },
];

// ── セクション定義 ─────────────────────────────────────────

export const sections: SectionDef[] = [
  {
    id: "tone-manner",
    title: "トーン&マナー",
    description: "HPの文章のルールを最初に決めておきましょう！",
    icon: "🎨",
    step: 1, estimatedMinutes: 3,
    fields: [
      {
        name: "tone_settings",
        label: "文章のトーン&マナー設定",
        type: "tone-manner",
        hint: "ここで決めたルールが、HP全体の文章に統一感を持たせます！",
        dnaSheet: "31_Tone_And_Manner",
        dnaField: "brand_voice_summary",
        toneCategories: [
          {
            name: "文体",
            key: "文体",
            options: ["ですます調", "である調"],
          },
          {
            name: "トーンの温度感",
            key: "温度感",
            options: ["親しみやすい", "やさしい", "プロフェッショナル", "落ち着いた", "明るく元気"],
          },
          {
            name: "一人称",
            key: "一人称",
            options: ["当院", "私たち", "当クリニック", "私（院長）"],
          },
          {
            name: "患者さんの呼び方",
            key: "患者呼称",
            options: ["患者さま", "患者さん", "患者様", "皆さま"],
          },
          {
            name: "歯科表記ルール",
            key: "表記ルール",
            options: ["むし歯", "虫歯", "ムシ歯"],
            multiple: true,
            custom: true,
          },
          {
            name: "カタカナ表記",
            key: "カタカナ表記",
            options: ["メインテナンス", "メンテナンス", "クリーニング", "ケア"],
            multiple: true,
            custom: true,
          },
          {
            name: "推奨する表現",
            key: "推奨表現",
            options: [
              "お口の健康",
              "歯の健康",
              "お気軽にご相談ください",
              "まずはご相談ください",
              "安心してお任せください",
              "丁寧にご説明します",
            ],
            multiple: true,
            custom: true,
          },
          {
            name: "避ける表現（医療広告GL対応）",
            key: "NG表現",
            options: [
              "最高の治療",
              "絶対に治る",
              "痛くない（断言）",
              "日本一",
              "最先端",
              "他院より優れた",
              "必ず満足",
              "100%成功",
            ],
            multiple: true,
            custom: true,
          },
        ],
      },
    ],
  },
  {
    id: "basic",
    title: "基本情報",
    description: "まずは医院の基本情報からお願いします！",
    icon: "🏥",
    step: 1, estimatedMinutes: 5,
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
        hint: "各曜日の診療時間を入力してくださいね！",
        dnaSheet: "00_Clinic",
        dnaField: "clinic_hours",
      },
      {
        name: "sns_accounts",
        label: "SNSアカウント",
        type: "sns",
        hint: "SNSやってたら教えてください！",
        dnaSheet: "00_Clinic",
        dnaField: "sns_accounts",
      },
      {
        name: "payment_methods",
        label: "お支払い方法",
        type: "payment",
        hint: "使えるお支払い方法をチェックしてください！",
        dnaSheet: "00_Clinic",
        dnaField: "payment_methods",
      },
    ],
  },
  {
    id: "director",
    title: "院長プロフィール",
    description: "院長先生のこと、教えてください！",
    icon: "👨‍⚕️",
    step: 1, estimatedMinutes: 5,
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
      {
        name: "other_staff",
        label: "その他のスタッフ",
        type: "staff-repeater",
        hint: "院長先生以外のスタッフ情報を追加できます！採用ページにも使えますよ！",
        dnaSheet: "10_Staff_Master",
        dnaField: "name",
      },
    ],
  },
  // ── 理念・想い（3セクションに分割）──────────────────────
  {
    id: "philosophy-origin",
    title: "原点・ルーツ",
    description: "先生が歯科医師になるまでの物語を教えてください！",
    icon: "🌱",
    step: 2, estimatedMinutes: 10,
    fields: [
      {
        name: "motivation",
        label: "歯科医師を目指したきっかけ",
        type: "textarea",
        placeholder: "自由にお書きください",
        hint: "先生の原点！ここが一番のオリジナルストーリーです！",
        dnaSheet: "03_DNA_Master",
        dnaField: "content",
        textSuggestions: [
          { label: "家族の影響", text: "歯科医師を目指したきっかけは、家族の影響が大きいです。" },
          { label: "自分の体験", text: "子どもの頃に通っていた歯医者さんの先生が" },
          { label: "別の夢から", text: "実は最初は歯科医師になるつもりはありませんでした。" },
        ],
      },
      {
        name: "mentor",
        label: "影響を受けた恩師・先輩",
        type: "textarea",
        placeholder: "例：大学時代の◯◯教授に「治療は技術だけじゃない、患者さんの人生に寄り添うことだ」と教わりました",
        hint: "先生の技術や考え方のルーツが伝わります！",
        dnaSheet: "03_DNA_Master",
        dnaField: "content",
        textSuggestions: [
          { label: "大学の恩師", text: "大学時代の指導教授に教わったのは、" },
          { label: "勤務先の先輩", text: "以前勤務していた医院の院長から学んだことで一番大きかったのは、" },
          { label: "セミナー・学会", text: "あるセミナーで出会った先生の言葉がきっかけで、" },
        ],
      },
      {
        name: "opening_reason",
        label: "この場所で開業した理由",
        type: "textarea",
        placeholder: "例：この地域には予防歯科に力を入れている医院が少なく、自分がその役割を担いたいと思いました",
        hint: "地域への想いが伝わると、近所の患者さんの来院動機になりますよ！",
        dnaSheet: "03_DNA_Master",
        dnaField: "content",
        textSuggestions: [
          { label: "地域への想い", text: "この地域を選んだのは、" },
          { label: "縁があった", text: "この場所との出会いは偶然でしたが、" },
          { label: "地元に貢献", text: "生まれ育ったこの街で開業したいと、ずっと思っていました。" },
        ],
      },
      {
        name: "clinic_name_origin",
        label: "医院名・ロゴに込めた想い",
        type: "textarea",
        placeholder: "例：「◯◯」という名前には、患者さんに◯◯してほしいという想いを込めています",
        hint: "世界に1つだけの物語！AIには絶対書けない最強の一次情報です！",
        dnaSheet: "03_DNA_Master",
        dnaField: "content",
        textSuggestions: [
          { label: "名前の由来", text: "医院名の「◯◯」には、" },
          { label: "ロゴの意味", text: "ロゴのデザインは、" },
          { label: "込めた願い", text: "この名前をつけたのは、患者さんに" },
        ],
      },
    ],
  },
  {
    id: "philosophy-core",
    title: "理念・診療哲学",
    description: "先生の診療に対する考え方を教えてください！",
    icon: "💡",
    step: 1, estimatedMinutes: 10,
    fields: [
      {
        name: "philosophy",
        label: "診療理念・方針",
        type: "textarea",
        placeholder:
          "例：{{clinic_name}}では、親身な医療をプロの立場で行うことが診療理念です。",
        hint: "先生が一番大切にしてること、教えてください！",
        dnaSheet: "03_DNA_Master",
        dnaField: "content",
        textSuggestions: [
          { label: "一言で表すと", text: "私の診療理念を一言で表すと、" },
          { label: "大切にしてること", text: "診療で一番大切にしていることは、" },
          { label: "開院時の決意", text: "開院するとき、これだけは絶対に守ろうと決めたことがあります。" },
        ],
      },
      {
        name: "never_do",
        label: "患者さんに絶対にしないと決めていること",
        type: "textarea",
        placeholder: "例：説明なしに治療を始めること。どんなに忙しくても、必ず治療前に選択肢を説明してご納得いただいてから始めます",
        hint: "「やらないこと」は最強の判断軸です！信頼に直結しますよ！",
        dnaSheet: "03_DNA_Master",
        dnaField: "content",
        textSuggestions: [
          { label: "説明を省かない", text: "絶対にしないと決めていることは、説明を省くことです。" },
          { label: "無理な治療をしない", text: "患者さんが望まない治療は絶対にしません。" },
          { label: "手を抜かない", text: "どんな小さな治療でも、" },
        ],
      },
      {
        name: "motto",
        label: "座右の銘・大切にしている言葉",
        type: "textarea",
        placeholder: "例：「一期一会」— 初めて来る患者さんも、10年通ってくださる患者さんも、毎回が一度きりの出会いだと思って接しています",
        hint: "先生の人格の核が伝わります！その言葉を選んだ理由もぜひ！",
        dnaSheet: "03_DNA_Master",
        dnaField: "content",
        textSuggestions: [
          { label: "座右の銘は", text: "私の座右の銘は「" },
          { label: "大切な言葉", text: "ずっと大切にしている言葉があります。" },
          { label: "恩師の言葉", text: "恩師に言われた「" },
        ],
      },
      {
        name: "director_greeting",
        label: "院長先生のご挨拶文",
        type: "textarea",
        placeholder:
          "例：{{clinic_name}}では多くの方にストレスなく通院いただけるよう、お一人おひとりのご要望をしっかりと伺い、ライフスタイルや価値観に沿った治療を行っています。",
        hint: "HPに載せる院長メッセージです！ラフに書いてもらえればAIできれいにできますよ！",
        dnaSheet: "00_Clinic",
        dnaField: "director_greeting",
        rows: 8,
      },
    ],
  },
  {
    id: "philosophy-story",
    title: "エピソード・人柄",
    description: "先生の人柄が伝わるエピソードを教えてください！",
    icon: "📖",
    step: 2, estimatedMinutes: 15,
    fields: [
      {
        name: "memorable_episode",
        label: "印象に残っている患者さんエピソード",
        type: "textarea",
        placeholder: "自由にお書きください",
        hint: "こういうエピソード、患者さんにすごく響くんですよ！",
        dnaSheet: "03_DNA_Master",
        dnaField: "content",
        textSuggestions: [
          { label: "嬉しかった出来事", text: "一番嬉しかったのは、" },
          { label: "考えが変わった出来事", text: "自分の診療スタイルが変わるきっかけになった患者さんがいます。" },
          { label: "長く通ってくれてる方", text: "開院当初から通ってくださっている患者さんがいて、" },
        ],
      },
      {
        name: "hardest_moment",
        label: "開院して一番大変だったこと",
        type: "textarea",
        placeholder: "例：開院直後はスタッフが定着せず、患者さんに迷惑をかけてしまった時期がありました。その経験から採用と育成に力を入れるようになりました",
        hint: "苦労話は共感と信頼を生みます！乗り越えた経験は最高のストーリーです！",
        dnaSheet: "03_DNA_Master",
        dnaField: "content",
        textSuggestions: [
          { label: "開院直後の苦労", text: "開院して一番大変だったのは、" },
          { label: "コロナ禍", text: "コロナ禍のときは本当に大変でした。" },
          { label: "失敗から学んだこと", text: "正直に言うと、開院当初は" },
        ],
      },
      {
        name: "patient_feedback",
        label: "患者さんによく言われること",
        type: "textarea",
        placeholder: "例：「説明がすごく丁寧ですね」「ここに来ると安心する」「子どもが歯医者を嫌がらなくなった」",
        hint: "第三者の声は口コミと同じ効果があります！複数あればぜひ！",
        dnaSheet: "03_DNA_Master",
        dnaField: "content",
        textSuggestions: [
          { label: "よく言われる言葉", text: "患者さんからよく言っていただけるのは、「" },
          { label: "口コミに書かれた", text: "口コミで嬉しかったのは、" },
          { label: "意外だった反応", text: "自分では当たり前だと思っていたのですが、患者さんに「" },
        ],
      },
      {
        name: "staff_message",
        label: "スタッフに一番伝えていること",
        type: "textarea",
        placeholder: "例：「患者さんの名前を覚えること」。名前で呼ばれるだけで安心感が全然違うと思っています",
        hint: "チームの価値観が伝わります！採用ページにも活きますよ！",
        dnaSheet: "03_DNA_Master",
        dnaField: "content",
        textSuggestions: [
          { label: "いつも伝えてること", text: "スタッフにいつも伝えているのは、" },
          { label: "朝礼で話すこと", text: "朝礼では必ず" },
          { label: "採用面接で聞くこと", text: "採用面接で必ず聞くことがあります。" },
        ],
      },
      {
        name: "future_vision",
        label: "10年後の医院のビジョン",
        type: "textarea",
        placeholder: "例：10年後には、この地域の方が「歯のことならあそこ」と自然に思い浮かべてくれるような存在になりたいです",
        hint: "未来のビジョンがあると「長く通いたい」と思ってもらえますよ！",
        dnaSheet: "03_DNA_Master",
        dnaField: "content",
        textSuggestions: [
          { label: "地域での存在", text: "10年後には、この地域で" },
          { label: "医院の成長", text: "将来的には、" },
          { label: "患者さんとの関係", text: "患者さんとの関係で理想としているのは、" },
        ],
      },
      {
        name: "hobby",
        label: "休日の過ごし方・趣味",
        type: "textarea",
        placeholder: "例：休日は子どもと公園に行くことが多いです。あと料理が趣味で、細かい作業が好きなのは歯科医師と通じるものがあるかもしれません（笑）",
        hint: "先生の人柄が伝わって親近感が生まれますよ！来院時の話題にもなります！",
        dnaSheet: "10_Staff_Master",
        dnaField: "strength_summary",
        textSuggestions: [
          { label: "家族との時間", text: "休日は家族と" },
          { label: "趣味", text: "趣味は" },
          { label: "意外な一面", text: "意外かもしれませんが、実は" },
        ],
      },
    ],
  },
  {
    id: "features",
    title: "医院の特徴・設備",
    description: "先生の医院のアピールポイント、たくさん教えてください！",
    icon: "⭐",
    step: 1, estimatedMinutes: 10,
    fields: [
      {
        name: "clinic_features",
        label: "クリニックの特徴（6つほど）",
        type: "repeater",
        placeholder: "特徴を入力（例：痛みの少ない治療）",
        hint: "直感的な言葉でOKです！説明はラフに書いてもらえればAIで整えますよ！",
        dnaSheet: "00_Clinic",
        dnaField: "notes",
        defaultCount: 3,
        suggestions: [
          { title: "痛みの少ない治療", description: "電動麻酔器や表面麻酔を活用し、治療中の痛みを最小限に抑えています。歯医者が苦手な方にも安心してご来院いただけます。" },
          { title: "丁寧なカウンセリング", description: "治療前に十分な時間をかけて症状やご要望をお伺いし、治療計画を分かりやすくご説明します。納得いただいてから治療を開始します。" },
          { title: "予防歯科に注力", description: "虫歯や歯周病にならないための予防プログラムに力を入れています。定期検診とプロフェッショナルケアで健康な歯を維持します。" },
          { title: "最新の設備・技術", description: "CTやマイクロスコープなど最新の医療機器を導入し、精密で安全な治療を提供しています。" },
          { title: "土日・夜間診療", description: "お仕事や学校で忙しい方にも通いやすいよう、土日や平日夜間の診療を行っています。" },
          { title: "駅チカ・好アクセス", description: "◯◯駅から徒歩◯分の好アクセス。お仕事帰りやお買い物のついでにもお立ち寄りいただけます。" },
          { title: "個室診療室", description: "プライバシーに配慮した個室の診療スペースをご用意しています。他の患者さんの目を気にせず治療を受けていただけます。" },
          { title: "キッズスペース完備", description: "お子さまが待ち時間を楽しく過ごせるキッズスペースを設けています。お子さま連れでも安心してご来院いただけます。" },
          { title: "バリアフリー対応", description: "車椅子やベビーカーでもそのまま院内に入れるバリアフリー設計です。すべての方にストレスなくご来院いただけます。" },
          { title: "徹底した感染対策", description: "クラスBの滅菌器を導入し、治療器具は患者さまごとに滅菌しています。安心・安全な環境で治療を受けていただけます。" },
          { title: "精密な根管治療", description: "マイクロスコープを用いた精密な根管治療を行い、できる限り歯を残す治療を追求しています。" },
          { title: "インプラント専門医在籍", description: "インプラント専門医が在籍し、CT撮影による精密な診断のもと安全なインプラント治療を提供しています。" },
          { title: "矯正歯科", description: "マウスピース矯正やワイヤー矯正など、患者さまのライフスタイルに合わせた矯正治療をご提案します。" },
          { title: "審美歯科", description: "セラミック治療やホワイトニングなど、見た目の美しさと機能性を両立した審美歯科治療を行っています。" },
          { title: "小児歯科", description: "お子さまが歯医者を好きになるよう、楽しく通える雰囲気づくりと丁寧な対応を心がけています。" },
          { title: "訪問歯科", description: "通院が困難な方のために、ご自宅や施設への訪問歯科診療を行っています。" },
        ],
      },
      {
        name: "treatment_flow",
        label: "診療の流れ（初診の方向け）",
        type: "textarea",
        placeholder:
          "例：\n1. ご来院・受付\n   ご予約のお時間にご来院ください。初診の方は問診票のご記入をお願いします。\n\n2. 問診・カウンセリング\n   症状やお悩み、ご要望を丁寧にお伺いします。\n\n3. 検査（レントゲン・CT等）\n   お口の中の状態を詳しく検査します。\n\n4. 治療計画のご説明\n   検査結果をもとに、治療の選択肢と計画をご説明します。\n\n5. 治療\n   ご納得いただいた治療計画に沿って治療を進めます。\n\n6. メインテナンス・定期検診\n   治療後も健康な歯を維持するため、定期的なケアをおすすめします。",
        hint: "初めての患者さん向けの流れです！テンプレートから選んでカスタマイズもできますよ！",
        dnaSheet: "00_Clinic",
        dnaField: "treatment_flow",
        rows: 12,
        textSuggestions: [
          { label: "一般的な流れ", text: "1. ご来院・受付\nご予約のお時間にご来院ください。初診の方は問診票のご記入をお願いします。\n\n2. 問診・カウンセリング\n症状やお悩み、ご要望を丁寧にお伺いします。\n\n3. 検査（レントゲン・CT等）\nお口の中の状態を詳しく検査します。\n\n4. 治療計画のご説明\n検査結果をもとに、治療の選択肢と計画を分かりやすくご説明します。\n\n5. 治療\nご納得いただいた治療計画に沿って治療を進めます。\n\n6. メインテナンス・定期検診\n治療後も健康な歯を維持するため、定期的なケアをおすすめします。" },
          { label: "カウンセリング重視型", text: "1. ご来院・受付\nご予約のお時間にご来院ください。初診の方は問診票のご記入をお願いします。\n\n2. カウンセリング（30分〜）\n個室のカウンセリングルームで、症状やお悩みだけでなく、治療への不安やご希望をじっくりお伺いします。\n\n3. 精密検査\nレントゲン・CT撮影、口腔内写真、歯周組織検査などを行います。\n\n4. 診断結果のご説明\nモニターを使って検査結果を分かりやすくご説明し、複数の治療選択肢をご提案します。\n\n5. 治療計画の決定\n患者さまと一緒に最適な治療計画を決定します。\n\n6. 治療開始\nご納得いただいてから治療を開始します。\n\n7. 定期メインテナンス\n治療完了後も、お口の健康を維持するためのケアプログラムをご提供します。" },
          { label: "予防重視型", text: "1. ご来院・受付\nご予約のお時間にご来院ください。\n\n2. 問診・お口の状態チェック\n現在のお口の状態を確認し、気になる点をお伺いします。\n\n3. 検査・リスク評価\nレントゲン撮影、歯周検査、唾液検査などを行い、虫歯・歯周病のリスクを評価します。\n\n4. 治療計画のご説明\n検査結果をもとに、予防プランを含めた治療計画をご提案します。\n\n5. 初期治療・クリーニング\nまずはお口の環境を整えるためのクリーニングや初期治療を行います。\n\n6. 本格治療\n必要に応じて本格的な治療を進めます。\n\n7. 予防メインテナンス\n3〜6ヶ月ごとの定期検診とプロフェッショナルケアで、健康な状態を維持します。" },
        ],
      },
      {
        name: "equipment_summary",
        label: "アピールしたい設備や機器",
        type: "repeater",
        placeholder: "設備名を入力（例：CT、マイクロスコープ）",
        hint: "設備名を入れると説明文を自動で提案しますよ！試してみてください！",
        dnaSheet: "00_Clinic",
        dnaField: "equipment_summary",
        defaultCount: 6,
        enableAiSuggest: true,
      },
    ],
  },
  // ── 診療内容・設備チェックリスト ──────────────────────────
  {
    id: "treatment-menu",
    title: "診療内容",
    description: "対応している診療メニューを教えてください！こだわりがあるものはぜひ詳しく！",
    icon: "🦷",
    step: 2, estimatedMinutes: 10,
    fields: [
      {
        name: "treatment_checklist",
        label: "診療メニュー",
        type: "checklist",
        hint: "「こだわり」を選ぶと、詳しく聞かせてもらえます！ここがHPの差別化ポイントになりますよ！",
        dnaSheet: "04_Treatment_Policy",
        dnaField: "content",
        checklistCategories: [
          {
            name: "一般・保存",
            items: [
              "虫歯治療",
              "根管治療（神経の治療）",
              "歯周病治療",
              "知覚過敏治療",
              "親知らず抜歯",
              "顎関節症治療",
              "口腔外科",
              "歯ぎしり・食いしばり治療",
            ],
          },
          {
            name: "予防・メンテ",
            items: [
              "定期検診",
              "クリーニング・PMTC",
              "フッ素塗布",
              "シーラント",
              "唾液検査",
              "歯磨き指導（TBI）",
              "メインテナンスプログラム",
            ],
          },
          {
            name: "審美・ホワイトニング",
            items: [
              "オフィスホワイトニング",
              "ホームホワイトニング",
              "デュアルホワイトニング",
              "セラミック治療（詰め物）",
              "セラミック治療（被せ物）",
              "ラミネートベニア",
              "ダイレクトボンディング",
              "ガムピーリング（歯茎の黒ずみ除去）",
            ],
          },
          {
            name: "矯正",
            items: [
              "ワイヤー矯正（表側）",
              "ワイヤー矯正（裏側・舌側）",
              "マウスピース矯正",
              "部分矯正",
              "小児矯正（1期）",
              "小児矯正（2期）",
              "床矯正",
              "MFT（口腔筋機能療法）",
            ],
          },
          {
            name: "インプラント",
            items: [
              "インプラント治療",
              "All-on-4",
              "サイナスリフト・骨造成",
              "GBR（骨誘導再生法）",
              "インプラントメインテナンス",
            ],
          },
          {
            name: "小児・マタニティ",
            items: [
              "小児歯科",
              "小児予防プログラム",
              "マタニティ歯科",
              "障がい者歯科",
            ],
          },
          {
            name: "義歯・補綴",
            items: [
              "入れ歯（部分）",
              "入れ歯（総義歯）",
              "ノンクラスプデンチャー",
              "金属床義歯",
              "ブリッジ",
            ],
          },
          {
            name: "その他",
            items: [
              "訪問歯科",
              "スポーツマウスガード",
              "睡眠時無呼吸症候群（マウスピース）",
              "口臭治療",
              "ドライマウス治療",
              "レーザー治療",
              "笑気麻酔",
              "静脈内鎮静法",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "equipment-check",
    title: "設備・院内環境",
    description: "導入している設備や院内の環境を教えてください！",
    icon: "🔬",
    step: 2, estimatedMinutes: 5,
    fields: [
      {
        name: "equipment_checklist",
        label: "設備・院内環境",
        type: "checklist",
        hint: "患者さんは設備で医院を選ぶこともあります！こだわりがある設備はアピールしましょう！",
        dnaSheet: "00_Clinic",
        dnaField: "equipment_summary",
        checklistCategories: [
          {
            name: "診断機器",
            items: [
              "歯科用CT",
              "デジタルレントゲン",
              "パノラマレントゲン",
              "セファロ（矯正用）",
              "口腔内カメラ",
              "口腔内スキャナー（iTero等）",
              "ダイアグノデント（虫歯検出）",
              "位相差顕微鏡",
            ],
          },
          {
            name: "治療機器",
            items: [
              "マイクロスコープ（手術用顕微鏡）",
              "歯科用レーザー",
              "CAD/CAMシステム",
              "電動麻酔器",
              "エアフロー",
              "超音波スケーラー",
              "根管長測定器",
              "光学印象",
            ],
          },
          {
            name: "麻酔・鎮静",
            items: [
              "表面麻酔",
              "電動注射器",
              "麻酔液ウォーマー",
              "笑気吸入鎮静法",
              "静脈内鎮静法",
            ],
          },
          {
            name: "感染対策",
            items: [
              "クラスB滅菌器",
              "クラスS滅菌器",
              "口腔外バキューム",
              "医療用空気清浄機",
              "使い捨てグローブ・エプロン",
              "ハンドピース患者毎滅菌",
            ],
          },
          {
            name: "院内環境",
            items: [
              "完全個室診療室",
              "半個室診療室",
              "カウンセリングルーム",
              "キッズスペース",
              "おむつ替えスペース",
              "パウダールーム",
              "ウォーターサーバー",
              "Free Wi-Fi",
              "モニター付きチェア",
            ],
          },
          {
            name: "アクセシビリティ",
            items: [
              "バリアフリー（段差なし）",
              "車椅子対応",
              "エレベーター",
              "専用駐車場",
              "駐輪場",
              "ベビーカー院内持ち込み可",
              "靴のまま診療OK",
            ],
          },
        ],
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
