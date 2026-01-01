# アーキテクチャ

## 概要
このプロジェクトは**クリーンアーキテクチャ**と**ドメイン駆動設計（DDD）**をベースに設計されています。
個人開発でも扱いやすいよう、明確な層分離とモノレポ構成を採用しています。

## アーキテクチャ図

```
┌──────────────────────────────────────────────────────┐
│ Presentation Layer (apps/mobile)                     │
│  - Expo Router画面 (app/)                            │
│  - UIコンポーネント (src/components/)                │
│  - カスタムHooks (src/hooks/)                        │
│  - Context Providers (src/providers/)                │
└────────────────┬─────────────────────────────────────┘
                 │ uses (React Query)
┌────────────────▼─────────────────────────────────────┐
│ Application Layer (apps/mobile/src/application)      │
│  - UseCases (ビジネスロジックのオーケストレーション) │
└────────────────┬─────────────────────────────────────┘
                 │ uses
┌────────────────▼─────────────────────────────────────┐
│ Domain Layer (packages/core/src/domain)              │
│  - Entities (集約ルート・エンティティ)               │
│  - Value Objects (値オブジェクト)                    │
│  - Repository Interfaces (リポジトリインターフェース)│
│  - Domain Services (ドメインサービス)                │
│  - Domain Errors (ドメインエラー)                    │
└────────────────▲─────────────────────────────────────┘
                 │ implements (DIP)
┌────────────────┴─────────────────────────────────────┐
│ Infrastructure Layer (apps/mobile/src/infra)         │
│  - Repository Implementations (リポジトリ実装)       │
│  - Query Services (CQRS読み取り専用クエリ)          │
│  - Supabase Client                                   │
└──────────────────────────────────────────────────────┘
```

### 依存関係の原則
- **依存性逆転の原則（DIP）**: Domain層がInfrastructure層に依存しない
- **単方向の依存**: 外側の層から内側の層へのみ依存
- **循環依存なし**: すべての依存関係は一方向

## 技術スタック

| レイヤー | 主な技術 |
| --- | --- |
| Mobile App | Expo SDK 54, React Native 0.81, Expo Router, NativeWind (Tailwind) |
| State Management | React Query (TanStack Query) |
| Backend | Supabase (Auth / PostgreSQL / RLS) |
| Language | TypeScript (strict mode) |
| Testing | Jest, ts-jest |
| Build & Deploy | EAS Build |
| Monorepo | npm workspaces |

## 設計パターン

### 1. CQRS（Command Query Responsibility Segregation）
- **Command**: Repository経由でドメインエンティティ操作（書き込み）
- **Query**: Query Service経由で最適化されたデータ取得（読み取り）

```typescript
// Command（書き込み）
const project = await projectRepository.findById(id);
project.updateTitle(newTitle);
await projectRepository.save(project);

// Query（読み取り）
const projects = await getProjectList(userId);
```

### 2. Repository パターン
- ドメイン層でインターフェース定義
- インフラ層で具象実装
- データソースの抽象化

### 3. Value Object パターン
- ブランド型による型安全性
- 不変性の保証
- バリデーションの集約

```typescript
export type ProjectTitleValue = string & { _brand: 'ProjectTitle' };

export class ProjectTitle {
  private constructor(private readonly value: ProjectTitleValue) {}

  static create(value: string): ProjectTitle {
    if (!value || value.length > 100) {
      throw new DomainError(/* ... */);
    }
    return new ProjectTitle(value as ProjectTitleValue);
  }
}
```

### 4. Factory Method パターン
- エンティティ生成時: `create()`
- DB再構築時: `reconstruct()`

### 5. Domain Service パターン
- 複数エンティティにまたがるロジック
- 上限チェックなどのポリシー

## コーディング規約

### TypeScript
- **Strict モード有効**: `tsconfig.base.json` で `"strict": true`
- **型安全性**: `any` 禁止、明示的な型付け必須
- **Opaque Type**: ブランド型による値オブジェクト実装

### 命名規則
- **ファイル名**: PascalCase（クラス、コンポーネント）、camelCase（関数、ユーティリティ）
- **コンポーネント**: 関数コンポーネント、Props型は `ComponentNameProps`
- **Hooks**: `use` プレフィックス必須
- **UseCases**: `{動詞}{ドメイン}UseCase` （例: CreateProjectUseCase）

### スタイリング
- **NativeWind優先**: Tailwind CSSクラスを使用
- **インラインスタイル最小限**: 動的スタイルのみ

### ドメインロジック
- **Domain層で完結**: `packages/core` にすべてのビジネスルールを集約
- **外部依存排除**: Domain層から直接Supabase SDK等を使用しない
- **値オブジェクトでバリデーション**: エンティティ生成前に入力検証

### エラーハンドリング
- **ドメインエラー**: `DomainError` クラス使用、`ErrorCode` で分類
- **ユーザーメッセージ変換**: `toUserMessage()` でUI表示用に変換
- **インフラエラー**: 詳細を隠蔽し汎用メッセージ化

### テスト
- **単体テスト**: Domain層、Application層
- **UIテスト**: 壊れやすいテストは避ける
