/**
 * 一次情報充足度の分析ロジック
 *
 * 一次情報 = 医院固有の生きた情報。テンプレ的な一般論ではなく、
 * その医院ならではの判断軸・取り組み・エピソードを含むほど高評価。
 */

export interface AnalysisResult {
  /** 全体スコア 0-100 */
  score: number;
  /** 検出された一次情報の種類 */
  detected: DetectedElement[];
  /** 不足している要素（フィードバックとして表示） */
  missing: MissingFeedback[];
}

export interface DetectedElement {
  type: "judgement" | "initiative" | "episode" | "specifics" | "emotion";
  label: string;
  /** マッチしたテキストの一部 */
  excerpt: string;
}

export interface MissingFeedback {
  type: "judgement" | "initiative" | "episode" | "specifics" | "emotion";
  label: string;
  question: string;
  priority: "high" | "medium" | "low";
}

// ── 分析パターン定義 ─────────────────────────────────────

interface Pattern {
  type: DetectedElement["type"];
  label: string;
  /** テキストに含まれていたら検出 */
  patterns: RegExp[];
  /** このパターンの重み（スコア計算用） */
  weight: number;
}

const ANALYSIS_PATTERNS: Pattern[] = [
  {
    type: "judgement",
    label: "判断軸・こだわり",
    patterns: [
      /なぜなら|理由は|だから|という考え|という思い|大切にして|こだわ[りっ]|重視して|信念|方針として|あえて|選んだ|決めた|判断/,
      /ではなく|よりも|むしろ|一般的には.*(?:しかし|だが|でも)|他院と(?:違|異なる)|独自/,
      /〜ない(?:ように|ために|こと)|しない(?:ように|と決め)|禁止|やらない/,
    ],
    weight: 30,
  },
  {
    type: "initiative",
    label: "独自の取り組み",
    patterns: [
      /導入して|取り入れ|始めた|開発した|考案した|工夫して|仕組み(?:を|が)|独自(?:の|に)|オリジナル/,
      /毎[日週月]|定期的に|ルーティン|習慣として|必ず|かならず|徹底して/,
      /研修|勉強会|セミナー|学会|資格|認定|トレーニング/,
      /具体的には|例えば|実際に|たとえば/,
    ],
    weight: 25,
  },
  {
    type: "episode",
    label: "エピソード・実体験",
    patterns: [
      /患者さ[んま](?:から|が|に|の)|ある(?:日|時|患者)|以前|過去に|きっかけ(?:は|で|が)/,
      /言われた|喜んで|感謝|涙|笑顔|驚[いか]|感動|印象に残/,
      /〜したことがあ[りる]|経験(?:して|から|が)|実[際体]験/,
      /開[院業](?:した|して|当初)|勤務(?:時代|していた)|学生時代/,
    ],
    weight: 25,
  },
  {
    type: "specifics",
    label: "具体的な数字・事実",
    patterns: [
      /\d+[年月回人件台%％倍]|\d+(?:万|千|百)/,
      /[０-９]+[年月回人件台]|[０-９]+(?:万|千|百)/,
      /約\d|およそ\d|毎月\d|年間\d|週\d/,
    ],
    weight: 10,
  },
  {
    type: "emotion",
    label: "想い・感情",
    patterns: [
      /嬉し[いかっく]|悔し[いかっく]|悩[んみ]|苦労|葛藤|迷[いっ]|不安|心配/,
      /目指[しす]|夢|志|使命|誇り|願[いっ]|祈[りっ]/,
      /大切(?:な|に)|一番|最も|何より|心(?:から|を込め|がけ)/,
    ],
    weight: 10,
  },
];

// ── 不足時のフィードバック生成 ─────────────────────────────

/** 入力テキストからトピック（主語）を抽出する */
function extractTopic(text: string): string {
  // タイトル部分（最初の行 or 短いテキスト）を取得
  const firstLine = text.split("\n")[0].trim();
  // 短ければそのまま使う
  if (firstLine.length <= 20) return firstLine;
  // 長ければ最初の句読点まで
  const match = firstLine.match(/^(.{5,20}?)[。、！!？?\s]/);
  return match ? match[1] : firstLine.slice(0, 15);
}

type FeedbackTemplate = {
  type: MissingFeedback["type"];
  label: string;
  /** topic = 入力テキストから抽出したトピック */
  questions: ((topic: string) => string)[];
  priority: MissingFeedback["priority"];
};

const FEEDBACK_TEMPLATES: FeedbackTemplate[] = [
  {
    type: "judgement",
    label: "判断軸",
    questions: [
      (t) => `「${t}」、なんでそこにこだわってるんですか？理由がすごく気になります！`,
      (t) => `「${t}」を大事にしてる背景って何かあるんですか？他のやり方もある中であえてそうしてる理由、教えてほしいです！`,
      (t) => `先生が「${t}」を選んだ決め手って何だったんですか？`,
    ],
    priority: "high",
  },
  {
    type: "initiative",
    label: "独自の取り組み",
    questions: [
      (t) => `「${t}」で、先生の医院ならではの工夫ってありますか？他の医院ではやってないぞ！ってこと教えてください！`,
      (t) => `「${t}」について、具体的にどんなことをされてますか？先生の医院だからこそのやり方があれば！`,
      (t) => `「${t}」を実現するために、独自にやってることってありますか？`,
    ],
    priority: "high",
  },
  {
    type: "episode",
    label: "エピソード",
    questions: [
      (t) => `「${t}」に関して、印象に残ってるエピソードとかありますか？患者さんの反応とか！`,
      (t) => `「${t}」を始めたきっかけとか、実際にあった出来事があったら教えてください！`,
      (t) => `「${t}」で患者さんに喜ばれた経験とか、逆に大変だったこととかありますか？`,
    ],
    priority: "medium",
  },
  {
    type: "specifics",
    label: "具体的な数字",
    questions: [
      (t) => `「${t}」に関して、年数とか件数とか、具体的な数字で言えることありますか？数字があるとグッと説得力上がりますよ！`,
      (t) => `「${t}」、どのくらいの頻度でやってるとか、何年続けてるとか、数字で表せることあります？`,
    ],
    priority: "low",
  },
  {
    type: "emotion",
    label: "想い",
    questions: [
      (t) => `「${t}」への先生の想いとか、こうなってほしいっていう願いがあったら聞かせてください！`,
      (t) => `「${t}」を続けてる中で感じてることとか、先生の率直な気持ちも入れてもらえたら嬉しいです！`,
    ],
    priority: "low",
  },
];

/** トピックに応じた質問を生成する */
function generateMissingFeedbacks(topic: string): MissingFeedback[] {
  return FEEDBACK_TEMPLATES.map((tmpl) => {
    // ランダムに質問パターンを選択（同じトピックなら同じ質問が出るようにハッシュ的に）
    const idx = topic.length % tmpl.questions.length;
    return {
      type: tmpl.type,
      label: tmpl.label,
      question: tmpl.questions[idx](topic),
      priority: tmpl.priority,
    };
  });
}

// ── 分析関数 ─────────────────────────────────────────────

export function analyzePrimaryInfo(text: string): AnalysisResult {
  const topic = extractTopic(text);
  const feedbacks = generateMissingFeedbacks(topic);

  if (!text || text.trim().length < 10) {
    return {
      score: 0,
      detected: [],
      missing: feedbacks.filter((f) => f.priority === "high"),
    };
  }

  const detected: DetectedElement[] = [];
  let totalWeight = 0;
  let earnedWeight = 0;

  for (const pattern of ANALYSIS_PATTERNS) {
    totalWeight += pattern.weight;
    let matched = false;

    for (const regex of pattern.patterns) {
      const match = text.match(regex);
      if (match) {
        matched = true;
        // マッチ箇所の前後を含む抜粋を取得
        const idx = match.index || 0;
        const start = Math.max(0, idx - 10);
        const end = Math.min(text.length, idx + match[0].length + 20);
        detected.push({
          type: pattern.type,
          label: pattern.label,
          excerpt: text.slice(start, end).replace(/\n/g, " "),
        });
        break;
      }
    }

    if (matched) {
      earnedWeight += pattern.weight;
    }
  }

  // テキスト長によるボーナス（短すぎると減点）
  const lengthBonus = Math.min(text.length / 200, 1) * 10;

  const rawScore = totalWeight > 0
    ? (earnedWeight / totalWeight) * 90 + lengthBonus
    : 0;
  const score = Math.min(100, Math.round(rawScore));

  // 検出されなかった要素をフィードバックとして返す
  const detectedTypes = new Set(detected.map((d) => d.type));
  const missing = feedbacks.filter(
    (f) => !detectedTypes.has(f.type)
  );

  // 優先度順にソート
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  missing.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return { score, detected, missing };
}

/** スコアに応じたラベルを返す */
export function getScoreLabel(score: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (score >= 80)
    return { label: "すごい！最高です！", color: "#1e8e3e", bgColor: "#ceead6" };
  if (score >= 50)
    return { label: "いい感じ！もうちょっと！", color: "#e37400", bgColor: "#fef7e0" };
  if (score >= 20)
    return { label: "もっと聞きたいです！", color: "#d93025", bgColor: "#fce8e6" };
  return { label: "書いてみてください！", color: "#5f6368", bgColor: "#e8eaed" };
}
