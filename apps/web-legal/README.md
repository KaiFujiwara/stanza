# Web Legal Documents

このディレクトリには、App Store審査用の利用規約とプライバシーポリシーが含まれています。

## ファイル

- `public/terms.html` - 利用規約
- `public/privacy.html` - プライバシーポリシー

## 公開方法

これらのファイルは、App Store審査時に公開URLが必要です。GitHub Actionsで手動デプロイします。

### GitHub Pagesの設定手順

1. GitHubリポジトリの **Settings > Pages** に移動
2. **Source** を **"GitHub Actions"** に設定

### デプロイ手順（手動）

1. GitHubリポジトリの **Actions** タブに移動
2. 左サイドバーから **"Deploy Legal Documents to GitHub Pages"** を選択
3. **"Run workflow"** ボタンをクリック
4. mainブランチを選択して **"Run workflow"** を実行

### アプリ内での表示

`apps/mobile/app/(tabs)/settings/terms.tsx` と `privacy.tsx` で、公開URLを設定してください：

```typescript
const termsUrl = "https://kaifujiwara.github.io/stanza/terms.html";
const privacyUrl = "https://kaifujiwara.github.io/stanza/privacy.html";
```

## 更新時の注意

法的文書を更新する際は、必ず以下を行ってください：

1. HTMLファイルの「最終更新日」を更新
2. 変更内容を記録（重要な変更の場合）
3. ユーザーへの通知が必要な場合は、アプリ内で告知
