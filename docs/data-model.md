# データモデル

アプリで扱うドメインエンティティとDBスキーマを1枚に集約する。

## ドメインエンティティ

### 集約ルート

- **Folder**: プロジェクトをまとめるフォルダ。`id`, `name`, `orderIndex`
- **Project** (集約ルート): 曲単位のコンテナ。`id`, `title`, `folderId?`, `genreId?`, `orderIndex`, `isDeleted`, `deletedAt`, `createdAt`, `updatedAt`
  - **Section** (子エンティティ): 曲内のパート（Aメロ/サビなど）。`id`, `projectId`, `name`, `orderIndex`, `lines: string[]`
- **Phrase**: プロジェクト外のストックメモ。`id`, `text`, `note?`, `tagIds[]`, `createdAt`, `updatedAt`
- **Tag**: フレーズに付けるラベル。`id`, `name`, `createdAt`, `updatedAt`
- **Genre** (集約ルート): ユーザーのジャンルテンプレ。`id`, `name`, `description?`, `createdAt`, `updatedAt`
  - **GenreTemplateSection** (子エンティティ): `id`, `genreId`, `name`, `orderIndex`

### 集約の設計方針

- **Project → Section → lines[]**: Sectionは子エンティティ。歌詞行(lines)は単純なstring配列として保持
- **Genre → GenreTemplateSection**: GenreTemplateSectionは子エンティティ
- **順序管理**:
  - 集約ルート同士 (Folder, Project): リポジトリの`reorder()`で一括更新
  - 集約内 (Section, GenreTemplateSection): 親エンティティの`reorder*()`メソッドで管理

## DBスキーマ (Supabase想定)

### テーブル構造

```
folders
  - id (uuid, pk)
  - user_id (uuid, fk -> auth.users)
  - name (text)
  - order_index (integer)
  - created_at (timestamp)
  - updated_at (timestamp)

projects
  - id (uuid, pk)
  - user_id (uuid, fk -> auth.users)
  - title (text)
  - folder_id (uuid, fk -> folders, nullable)
  - genre_id (uuid, fk -> genres, nullable)
  - order_index (integer)
  - is_deleted (boolean)
  - deleted_at (timestamp, nullable)
  - created_at (timestamp)
  - updated_at (timestamp)

sections
  - id (uuid, pk)
  - project_id (uuid, fk -> projects)
  - name (text)
  - order_index (integer)
  - lines (text[], 歌詞行の配列。各要素は1000文字以内、最大1000行)

phrases
  - id (uuid, pk)
  - user_id (uuid, fk -> auth.users)
  - text (text)
  - note (text, nullable)
  - tag_ids (uuid[])
  - created_at (timestamp)
  - updated_at (timestamp)

tags
  - id (uuid, pk)
  - user_id (uuid, fk -> auth.users)
  - name (text)
  - created_at (timestamp)
  - updated_at (timestamp)

genres
  - id (uuid, pk)
  - user_id (uuid, fk -> auth.users)
  - name (text)
  - description (text, nullable)
  - created_at (timestamp)
  - updated_at (timestamp)

genre_template_sections
  - id (uuid, pk)
  - genre_id (uuid, fk -> genres)
  - name (text)
  - order_index (integer)
```

### トリガーと制約

**updated_atの自動更新:**

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**sectionsテーブルのCHECK制約:**

```sql
-- 各行は1000文字以内
ALTER TABLE sections
ADD CONSTRAINT lines_length_check
CHECK (
  lines IS NULL OR
  (SELECT bool_and(length(line) <= 1000)
   FROM unnest(lines) AS line)
);

-- 配列の要素数は1000以内
ALTER TABLE sections
ADD CONSTRAINT lines_count_check
CHECK (
  lines IS NULL OR
  array_length(lines, 1) IS NULL OR
  array_length(lines, 1) <= 1000
);
```

## 主要クエリ例

| 用途 | テーブル | クエリ | インデックス |
|------|---------|--------|--------------|
| フォルダ一覧 | `folders` | `WHERE user_id = ? ORDER BY order_index ASC` | `user_id, order_index` |
| プロジェクト一覧 | `projects` | `WHERE user_id = ? AND is_deleted = false ORDER BY updated_at DESC` | `user_id, is_deleted, updated_at` |
| プロジェクト検索 | `projects` | `WHERE user_id = ? AND is_deleted = false AND title ILIKE ?` | `user_id, is_deleted, title` (GINインデックス) |
| セクション取得 | `sections` | `WHERE project_id = ? ORDER BY order_index ASC` | `project_id, order_index` |
| タグ一覧 | `tags` | `WHERE user_id = ? ORDER BY name ASC` | `user_id, name` |
| フレーズ一覧 | `phrases` | `WHERE user_id = ? ORDER BY updated_at DESC` | `user_id, updated_at` |
| タグ別フレーズ | `phrases` | `WHERE user_id = ? AND ? = ANY(tag_ids) ORDER BY updated_at DESC` | `user_id, tag_ids (GIN)` |

## RLS (Row Level Security)

全テーブルで user_id による行レベルセキュリティを設定:

```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own projects"
  ON projects
  FOR ALL
  USING (auth.uid() = user_id);
```
