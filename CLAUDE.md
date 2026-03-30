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
- MVP段階ではデータ保存なし（将来 localStorage → GAS API → Supabase）

## DNA-OS 連携

- DNA-OS リポジトリ: kantsuku/dna-os
- スキーマ定義: `03_apps_script/Propose.gs` の SHEET_FIELD_SCHEMA
- 連携方式（将来）: GAS WebApp API 経由
