# Clinic Portal

歯科医院の一次情報を効率よく入力するためのポータルツール。
DNA-OS のマスターデータと連携し、ヒアリング〜運用まで一気通貫で管理する。

## 技術スタック

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- React 19

## ディレクトリ構成

```
src/
  app/           - Next.js App Router ページ
  components/    - UIコンポーネント
  lib/           - ユーティリティ・スキーマ定義
```

## 開発ルール

- ポート: 3002
- スマホファースト設計
- フィールド定義は `src/lib/schema.ts` に集約
- DNA-OS との対応は各フィールドの `dnaSheet` / `dnaField` で管理

## DB変更ルール（厳守）

クライアントが常時利用中のため、DBスキーマ変更は以下の順序を厳守すること。
**順序を間違えるとクライアントの入力データが読み込めなくなる。**

### カラム追加時
1. **先にSQLを実行** — ユーザーにSQL実行を依頼し、完了確認を受ける
2. **次にコードをデプロイ** — SELECTにカラムを追加するコードを反映

### カラム削除時（逆順）
1. **先にコードをデプロイ** — SELECTからカラムを外す
2. **次にSQLを実行** — カラムを削除

### 安全策
- `loadHearingSession` と `getHearingStats` はフォールバック付きで実装する
- SELECTが失敗した場合、新カラムを除外してリトライし、既存データを守る
- SQLファイルは `supabase/` に番号付きで保管し、実行済みかどうかコミットメッセージに明記する

## DNA-OS 連携

- DNA-OS リポジトリ: kantsuku/dna-os
- スキーマ定義: `03_apps_script/Propose.gs` の SHEET_FIELD_SCHEMA
- 連携方式（将来）: GAS WebApp API 経由
