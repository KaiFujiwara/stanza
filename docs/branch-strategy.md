# ブランチ戦略

## 環境構成

| 環境 | ブランチ | Supabase | 用途 |
|------|---------|----------|------|
| ローカル | `feature/*` | ローカルSupabase<br>(`npx supabase start`) | 個人開発・テスト |
| 本番 | `main` | Supabaseプロジェクト<br>(production-project-ref) | 本番環境 |

## ブランチ構成

```
main (本番環境 → Supabase本番プロジェクト)
  ↑
feature/* (ローカル開発 → ローカルSupabase)
```

## 各ブランチの役割

### `main` - 本番環境
- **用途:** 本番環境にデプロイされるコード
- **保護:** 直接pushは禁止、featureブランチからのPRのみ許可
- **デプロイ:** マージ時に本番環境へ自動デプロイ（CI/CD設定後）
- **マイグレーション:** `npx supabase db push` で本番DBへ適用

### `feature/*` - ローカル開発
- **用途:** 新機能開発・バグ修正
- **命名規則:**
  - 新機能: `feature/add-lyric-analysis`
  - バグ修正: `feature/fix-project-delete`
  - リファクタリング: `feature/refactor-repository-layer`
- **マイグレーション:** ローカルSupabaseで開発・テスト
- **テスト:** ローカルで十分にテストしてからPR作成

## ワークフロー

### 1. 新機能開発

```bash
# mainから新しいfeatureブランチを作成
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# 開発作業
# - コード変更
# - マイグレーション作成（必要に応じて）
# - ローカルでテスト

# ローカルでマイグレーションをテスト
npx supabase db reset

# ローカルで動作確認
npm run dev

# コミット
git add .
git commit -m "feat: implement your feature"

# mainへマージ（PR作成）
git push origin feature/your-feature-name
# GitHub上でPR作成: feature/your-feature-name → main
```

### 2. mainへのマージ後

```bash
# PRがマージされたら、本番DBへマイグレーション適用
git checkout main
git pull origin main

# リモート環境とリンク（初回のみ）
npx supabase link --project-ref your-project-ref

# 本番DBへマイグレーションをプッシュ
npx supabase db push
```

## マイグレーション管理

### ローカル開発（feature/*）
```bash
# スキーマ変更後、マイグレーションを作成
npx supabase db diff -f add_new_column

# ローカルで確認
npx supabase db reset

# テストを実行して問題ないか確認
npm run test
```

### 本番環境（main）
```bash
# featureブランチがmainにマージされたら
# 本番環境DBに適用（必ず手動確認後）

# リモート環境とリンク（初回のみ）
npx supabase link --project-ref production-ref

# 本番DBへマイグレーションをプッシュ
npx supabase db push
```
