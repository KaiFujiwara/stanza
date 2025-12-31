# Stanza

歌詞制作に特化したマルチプラットフォーム向けメモアプリ。音数カウントや韻チェックなどラップ／ポップス制作で欲しくなる補助機能を提供します。

## 🧭 概要
- その場で歌詞の断片やメモをストックし、セクションごとに整理
- 音数カウントや韻チェックなど、歌詞制作特有の検証作業をアプリ内で完結
- Expo (React Native) + Supabase で iOS / Android / Web (将来) を展開

詳細なアーキテクチャ・技術スタック・モノレポ構成については [docs/architecture.md](docs/architecture.md) を参照してください。

## 🚀 セットアップ手順

### 前提条件
- Node.js 18 以上
- Docker (Supabase ローカル環境用)

### 手順

1. **リポジトリ取得**
   ```bash
   git clone https://github.com/kaifujiwara/stanza.git
   cd stanza
   ```

2. **依存関係をインストール**
   ```bash
   npm install
   ```

3. **Supabase ローカル環境を起動**

   Docker Desktop を起動してから、以下を実行:
   ```bash
   npx supabase start
   ```

   起動後、以下の URL でアクセスできます:
   - Studio (管理画面): http://localhost:54323
   - API: http://localhost:54321

4. **データベースマイグレーションを適用**
   ```bash
   npx supabase db reset
   ```

5. **環境変数を設定**
   ```bash
   cp apps/mobile/.env.example apps/mobile/.env
   # apps/mobile/.env に `npx supabase start` で表示された接続情報を記入
   ```

   **Supabase URL の設定について**:
   - **iOSシミュレーター**: `http://localhost:54321`
   - **実機（iPhone/iPad）**: `http://<ローカルIP>:54321`
     - ローカルIPの確認方法: `ipconfig getifaddr en0`
   - **Androidエミュレーター**: `http://10.0.2.2:54321`

   ローカルIPはWi-Fi環境によって変わります（例: 192.168.1.5, 192.168.3.4など）。

6. **開発サーバーを起動**
   ```bash
   npm run dev
   ```

   Expo Go アプリで QR コードを読み込むか、iOS シミュレータ / Android Emulator を使用して接続します。

## 🔀 開発フロー

ブランチ戦略・マイグレーション管理・デプロイフローの詳細は [docs/branch-strategy.md](docs/branch-strategy.md) を参照してください。

## 🧪 テスト & 型チェック
```bash
npm run test         # Jest (apps/mobile) など、定義済みワークスペースのみ実行
npm run typecheck    # すべてのワークスペースで tsc --noEmit
npx tsc --noEmit     # 単体実行したいとき
```

## 📱 ビルド & リリース

アプリのビルドとリリースの詳細な手順については [docs/release-process.md](docs/release-process.md) を参照してください。
