# Lyrics Notes - 歌詞制作特化メモアプリ

## プロジェクト概要
歌詞のアイデアをその場でメモし、音数判定や韻の確認など歌詞制作に特化した機能を提供するアプリ

## ドキュメント
詳細な設計・仕様については `/docs` ディレクトリを参照してください：
- [アーキテクチャ設計](docs/architecture.md)
- [データモデル](docs/data-model.md)
- [画面設計](docs/screen-structure.md)
- [ブランチ戦略](docs/branch-strategy.md)

## 開発時の注意事項
**IMPORTANT: 以下のコマンドは明示的な指示がない限り実行しないこと**

開発環境に直接影響を与えるコマンドは、ユーザーの明示的な許可が必要です：

### 禁止コマンド（明示的指示がない限り実行禁止）
- `npm run build` - ビルド実行
- `npm run dev` / `npx expo start` - 開発サーバー起動
- `npx supabase migration up` - マイグレーション実行
- `npx supabase db reset` - データベースリセット
- `git push` / `git commit` - Git操作（明示的な指示があれば可）

### 許可されている操作
- マイグレーションファイルの作成・編集（実行は禁止）
- コードの読み取り・編集・作成
- `git status` / `git diff` などの参照系コマンド
- ファイル検索・grep 操作
