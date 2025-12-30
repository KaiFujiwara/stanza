# アーキテクチャ

## 概要
DDD/Clean Architecture をベースにしつつ、個人開発でも扱いやすい 3 層構成に最適化しています。

```
┌───────────────────────────────┐
│ Presentation (apps/mobile)        │ Expo Router, Hooks, UI
└──────────────┬────────────────┘
               │ import
┌──────────────▼────────────────┐
│ Core (packages/core)            │ ドメイン + ユースケース + 共通ユーティリティ
└──────────────┬────────────────┘
               │ 接続
┌──────────────▼────────────────┐
│ Infrastructure (apps/mobile/src) │ Supabase Repositories
└───────────────────────────────┘
```

将来 Web クライアントを追加する場合も、UI だけを別アプリとして増やし `@lyrics-notes/core` を共通利用する方針です。

## モノレポ構成
```
lyrics-notes/
├── apps/
│   ├── mobile/            # Expo アプリ (React Native)
│   │   ├── app/           # Expo Router 画面
│   │   ├── components/    # UI コンポーネント
│   │   └── src/
│   │       ├── data/      # Repository 実装 (Supabase)
│   │       └── lib/       # Supabase 初期化など
├── packages/
│   └── core/              # ドメイン + ユースケース + Utils
│       ├── src/features/projects/domain
│       ├── src/features/projects/application
│       └── src/utils
├── docs/                  # ドキュメント
│   └── supabase-schema.sql # PostgreSQL スキーマ定義
├── supabase/              # Supabase ローカル環境設定
├── __tests__/             # Node 上で動かすユニット/統合テスト
├── package.json           # ルートスクリプト & ワークスペース設定
└── tsconfig.base.json     # 共通 TypeScript 設定
```

## 技術スタック
| レイヤー | 主な技術 |
| --- | --- |
| Mobile App | Expo SDK 54, React Native 0.81, Expo Router, NativeWind |
| Storage / Backend | Supabase (Auth / PostgreSQL) |
| Language / Tooling | TypeScript, Jest, ts-jest, EAS Build |
| Shared Logic | `@lyrics-notes/core` (uuid, strict TS) |

## コーディング規約
- TypeScript Strict モード、有効な型付けを必須
- React Components は関数コンポーネント + Hooks、Props は PascalCase ファイル名
- NativeWind (Tailwind) を優先し、インラインスタイルは最小限
- ドメインロジックは `@lyrics-notes/core` で完結させ、アプリ層から直接 Supabase SDK を触らない
