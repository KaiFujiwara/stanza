# データモデル

アプリで扱うドメインエンティティとDBスキーマを1枚に集約する。

## ドメインエンティティ

### 集約ルート

- **Folder**: プロジェクトをまとめるフォルダ。`id`, `name`, `orderIndex`
- **Project** (集約ルート): 曲単位のコンテナ。`id`, `title`, `folderId?`, `genreId?`, `orderIndex`, `isDeleted`, `deletedAt`, `createdAt`, `updatedAt`
  - **Section** (子エンティティ): 曲内のパート（Aメロ/サビなど）。`id`, `projectId`, `name`, `orderIndex`, `contents`
- **Phrase**: プロジェクト外のストックメモ。`id`, `text`, `note?`, `tagIds[]`, `createdAt`, `updatedAt`
- **Tag**: フレーズに付けるラベル。`id`, `name`
- **Genre** (集約ルート): ユーザーのジャンルテンプレ。`id`, `name`, `description?`, `sectionNames: string[]`
### 集約の設計方針

- **Project → Section**: Sectionは子エンティティ。歌詞は単純なstringとして保持
- **Genre → sectionNames[]**: セクション名は値オブジェクトの配列として保持（エンティティではない）
- **順序管理**:
  - 集約ルート同士 (Folder, Project): リポジトリの`reorder()`で一括更新
  - 集約内 (Section): 親エンティティの`reorder*()`メソッドで管理
  - 値オブジェクト配列 (Genre.sectionNames): 配列のインデックスで順序を管理
