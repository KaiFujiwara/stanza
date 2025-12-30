# リリースプロセス

アプリをリリースする際の手順をまとめたドキュメントです。

## リリース前の準備

### 1. バージョン番号の更新

`apps/mobile/app.config.ts` のバージョン番号を更新します。

```typescript
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  version: '1.0.0', // ここを更新
  // ...
});
```

バージョニングルール（Semantic Versioning）:
- メジャーバージョン: 破壊的変更がある場合（例: 1.0.0 → 2.0.0）
- マイナーバージョン: 新機能追加（例: 1.0.0 → 1.1.0）
- パッチバージョン: バグ修正（例: 1.0.0 → 1.0.1）

### 2. テスト

- すべての機能が正常に動作することを確認
- iOSシミュレータ/実機でテスト

## ビルド

### iOS

#### Development ビルド

```bash
npm run build:ios:dev
```

#### Production ビルド

```bash
npm run build:ios:prod
```

## リリース後

### App Store提出

```bash
npm run submit:ios:prod
```

### リリースノート

App Store Connect でリリースノートを記入します。

## チェックリスト

リリース前に以下を確認してください：

- [ ] バージョン番号を更新した
- [ ] サポートメールアドレスが正しい
- [ ] すべての機能が正常に動作する
- [ ] クラッシュやバグがない
- [ ] App Store用のスクリーンショットを準備した
- [ ] App Store用のアプリ説明文を準備した
- [ ] プライバシーポリシーと利用規約が最新

## トラブルシューティング

### ビルドが失敗する場合

1. キャッシュをクリアして再試行
   ```bash
   npx expo start -c
   ```

2. 依存関係を再インストール
   ```bash
   npm clean-install
   ```

### 証明書の問題

EAS Build を使用している場合、証明書は自動で管理されます。
手動で管理する場合は、Apple Developer Portal で証明書を確認してください。

## 参考リンク

- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Semantic Versioning](https://semver.org/)
