# Clinic Portal — ぽん子ヒアリングポータル

歯科医院・一般企業向けのプライマリ情報入力ツール。業種別スキーマに基づく3ステップのヒアリングフォームで、クリニック情報を構造化して収集する。

## 技術スタック

- **Next.js 16** (App Router) + TypeScript + React 19
- **Tailwind CSS 4** + Material Design 3 トークン
- **Claude API** — テキストリライト・ミッション生成・タイトル生成
- **localStorage** — データ永続化（将来Supabase/GAS連携予定）

## 主要機能

- **業種別スキーマ**: 歯科医院・一般企業それぞれの専用フィールド定義
- **3ステップ入力**: 基本情報 → コア情報 → 詳細情報（進捗率ダッシュボード付き）
- **AIリライト**: ラフなメモをHP掲載品質のコピーに変換（医療広告ガイドライン準拠）
- **ミッション生成**: アンケート回答からブランドミッション・スローガン・WAYを自動生成
- **自動保存**: localStorageへの定期自動保存、セッション復元
- **マルチクリニック対応**: 1ブラウザで複数クリニックのデータを管理
- **エクスポート**: JSON・プレーンテキスト出力
- **DNA-OS連携**: dnaSheet/dnaFieldプロパティによるスキーママッピング

## セットアップ

```bash
npm install
npm run dev    # http://localhost:3005
```

### 環境変数 (.env.local)

```
ANTHROPIC_API_KEY=    # Claude API
```

## ディレクトリ構成

```
src/
├── app/
│   ├── page.tsx                    # クリニック選択ダッシュボード
│   ├── clinic/[id]/page.tsx        # メイン入力フォーム
│   ├── admin/                      # クリニック管理
│   └── api/                        # rewrite / generate-mission / generate-title
├── components/
│   ├── Dashboard.tsx               # 進捗率ダッシュボード
│   └── fields/                     # 各種入力フィールドコンポーネント
└── lib/
    ├── schema.ts                   # フィールド定義・ルーティング
    ├── industries/dental/          # 歯科医院スキーマ
    ├── industries/corporate/       # 一般企業スキーマ
    └── clinics.ts                  # クリニック管理ロジック
```
