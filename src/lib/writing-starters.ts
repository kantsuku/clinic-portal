/**
 * 一次情報タイプ別の書き出し候補
 * タップするとテキストエリアに追記される
 */

export interface WritingStarter {
  label: string;
  text: string;
}

export const WRITING_STARTERS: Record<string, WritingStarter[]> = {
  judgement: [
    { label: "理由を話す", text: "\nなぜなら、" },
    { label: "あえて選んだ", text: "\n他にも方法はありますが、あえてこの方法を選んでいるのは" },
    { label: "大切にしてる", text: "\n私が一番大切にしているのは" },
    { label: "こだわり", text: "\nここにこだわっている理由は、" },
    { label: "やらない判断", text: "\nあえてやらないと決めていることもあります。" },
  ],
  initiative: [
    { label: "具体的には", text: "\n具体的には、" },
    { label: "独自の工夫", text: "\n当院独自の取り組みとして、" },
    { label: "毎回必ず", text: "\n患者さんには毎回必ず" },
    { label: "仕組みを作った", text: "\nそのために独自の仕組みを作りました。" },
    { label: "導入した理由", text: "\nこれを導入した理由は、" },
  ],
  episode: [
    { label: "きっかけは", text: "\nこの方針にしたきっかけは、" },
    { label: "患者さんから", text: "\n以前、ある患者さんから" },
    { label: "印象的だった", text: "\n印象に残っているのは、" },
    { label: "開院当初", text: "\n開院した当初、" },
    { label: "言われた言葉", text: "\n患者さんに「" },
  ],
  specifics: [
    { label: "年数", text: "\nこの取り組みは◯年前から続けています。" },
    { label: "件数", text: "\nこれまでに◯件以上の" },
    { label: "頻度", text: "\n月に◯回は必ず" },
    { label: "割合", text: "\n当院の患者さんの約◯割が" },
  ],
  emotion: [
    { label: "一番嬉しい", text: "\n一番嬉しいのは、" },
    { label: "目指す姿", text: "\n私が目指しているのは、" },
    { label: "願い", text: "\n患者さんには" },
  ],
};
