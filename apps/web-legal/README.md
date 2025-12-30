# Web Legal Documents

このディレクトリには、App Store審査用の利用規約とプライバシーポリシーが含まれています。

## ファイル

- `public/terms.html` - 利用規約
- `public/privacy.html` - プライバシーポリシー

## 公開方法

これらのファイルは、App Store審査時に公開URLが必要です。GitHub Pagesで公開することを推奨します。

### GitHub Pagesでの公開手順

1. GitHubリポジトリの Settings > Pages に移動
2. Source を "Deploy from a branch" に設定
3. Branch を `main` 、フォルダを `/apps/web-legal/public` に設定
4. Save をクリック

公開後、以下のようなURLでアクセスできます：
```
https://yourusername.github.io/lyrics-notes/terms.html
https://yourusername.github.io/lyrics-notes/privacy.html
```

### アプリ内での表示

`apps/mobile/app/(tabs)/settings/terms.tsx` と `privacy.tsx` で、公開URLを設定してください：

```typescript
const termsUrl = "https://yourusername.github.io/lyrics-notes/terms.html";
const privacyUrl = "https://yourusername.github.io/lyrics-notes/privacy.html";
```

## 更新時の注意

法的文書を更新する際は、必ず以下を行ってください：

1. HTMLファイルの「最終更新日」を更新
2. 変更内容を記録（重要な変更の場合）
3. ユーザーへの通知が必要な場合は、アプリ内で告知

## App Store Connect での設定

App Store Connect のアプリ情報で、以下のURLを登録してください：

- **利用規約URL**: `https://yourusername.github.io/lyrics-notes/terms.html`
- **プライバシーポリシーURL**: `https://yourusername.github.io/lyrics-notes/privacy.html`
