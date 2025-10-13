# データベーススキーマ設計

## 概要
歌詞制作アプリのドメインエンティティに基づいたデータベーステーブル構造を定義します。

## テーブル構造

### 1. folders テーブル
フォルダ（プロジェクトの分類）を管理

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | TEXT | PRIMARY KEY | UUID |
| name | TEXT | NOT NULL | フォルダ名（1-100文字） |
| order_index | INTEGER | NOT NULL DEFAULT 0 | 表示順序 |
| created_at | TEXT | NOT NULL | 作成日時（ISO8601） |
| updated_at | TEXT | NOT NULL | 更新日時（ISO8601） |

### 2. genres テーブル
ジャンル（楽曲ジャンルとテンプレート）を管理

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | TEXT | PRIMARY KEY | UUID |
| name | TEXT | NOT NULL | ジャンル名（1-50文字） |
| template_sections | TEXT | NOT NULL DEFAULT '[]' | セクションテンプレート（JSON配列） |
| is_preset | INTEGER | NOT NULL DEFAULT 0 | プリセットフラグ（0:カスタム, 1:プリセット） |
| created_at | TEXT | NOT NULL | 作成日時（ISO8601） |
| updated_at | TEXT | NOT NULL | 更新日時（ISO8601） |

### 3. tags テーブル
タグを管理

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | TEXT | PRIMARY KEY | UUID |
| name | TEXT | NOT NULL | タグ名（1-30文字） |
| color | TEXT | NULL | カラーコード（#RRGGBB形式） |
| created_at | TEXT | NOT NULL | 作成日時（ISO8601） |
| updated_at | TEXT | NOT NULL | 更新日時（ISO8601） |

### 4. projects テーブル
楽曲プロジェクトを管理

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | TEXT | PRIMARY KEY | UUID |
| title | TEXT | NOT NULL | プロジェクトタイトル（1-200文字） |
| folder_id | TEXT | NULL | フォルダID（外部キー） |
| genre_id | TEXT | NULL | ジャンルID（外部キー） |
| created_at | TEXT | NOT NULL | 作成日時（ISO8601） |
| updated_at | TEXT | NOT NULL | 更新日時（ISO8601） |
| is_deleted | INTEGER | NOT NULL DEFAULT 0 | 論理削除フラグ |

#### 外部キー制約
- folder_id → folders.id (ON DELETE SET NULL)
- genre_id → genres.id (ON DELETE SET NULL)

### 5. sections テーブル
プロジェクト内のセクション（Aメロ、Bメロ等）を管理

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | TEXT | PRIMARY KEY | UUID |
| project_id | TEXT | NOT NULL | プロジェクトID（外部キー） |
| name | TEXT | NOT NULL | セクション名（1-50文字） |
| order_index | INTEGER | NOT NULL DEFAULT 0 | セクション内での順序 |
| created_at | TEXT | NOT NULL | 作成日時（ISO8601） |
| updated_at | TEXT | NOT NULL | 更新日時（ISO8601） |

#### 外部キー制約
- project_id → projects.id (ON DELETE CASCADE)

### 6. lines テーブル
セクション内の歌詞行を管理

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | TEXT | PRIMARY KEY | UUID |
| section_id | TEXT | NOT NULL | セクションID（外部キー） |
| text | TEXT | NOT NULL DEFAULT '' | 歌詞テキスト |
| line_index | INTEGER | NOT NULL | セクション内の行番号 |
| created_at | TEXT | NOT NULL | 作成日時（ISO8601） |
| updated_at | TEXT | NOT NULL | 更新日時（ISO8601） |

#### 外部キー制約
- section_id → sections.id (ON DELETE CASCADE)

### 7. phrases テーブル
フレーズストック（再利用可能な歌詞フレーズ）を管理

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| id | TEXT | PRIMARY KEY | UUID |
| text | TEXT | NOT NULL | フレーズテキスト（1-500文字） |
| created_at | TEXT | NOT NULL | 作成日時（ISO8601） |
| updated_at | TEXT | NOT NULL | 更新日時（ISO8601） |

### 8. project_tags テーブル（中間テーブル）
プロジェクトとタグの多対多関係を管理

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| project_id | TEXT | NOT NULL | プロジェクトID（外部キー） |
| tag_id | TEXT | NOT NULL | タグID（外部キー） |
| created_at | TEXT | NOT NULL | 関連付け日時（ISO8601） |

#### 主キー・外部キー制約
- PRIMARY KEY (project_id, tag_id)
- project_id → projects.id (ON DELETE CASCADE)
- tag_id → tags.id (ON DELETE CASCADE)

### 9. phrase_tags テーブル（中間テーブル）
フレーズとタグの多対多関係を管理

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| phrase_id | TEXT | NOT NULL | フレーズID（外部キー） |
| tag_id | TEXT | NOT NULL | タグID（外部キー） |
| created_at | TEXT | NOT NULL | 関連付け日時（ISO8601） |

#### 主キー・外部キー制約
- PRIMARY KEY (phrase_id, tag_id)
- phrase_id → phrases.id (ON DELETE CASCADE)
- tag_id → tags.id (ON DELETE CASCADE)

## インデックス設計

### パフォーマンス用インデックス
```sql
-- プロジェクト検索用
CREATE INDEX idx_projects_folder_id ON projects(folder_id);
CREATE INDEX idx_projects_genre_id ON projects(genre_id);
CREATE INDEX idx_projects_is_deleted ON projects(is_deleted);
CREATE INDEX idx_projects_updated_at ON projects(updated_at DESC);

-- セクション・ライン階層検索用
CREATE INDEX idx_sections_project_id_order ON sections(project_id, order_index);
CREATE INDEX idx_lines_section_id_index ON lines(section_id, line_index);

-- タグ関連検索用
CREATE INDEX idx_project_tags_project_id ON project_tags(project_id);
CREATE INDEX idx_project_tags_tag_id ON project_tags(tag_id);
CREATE INDEX idx_phrase_tags_phrase_id ON phrase_tags(phrase_id);
CREATE INDEX idx_phrase_tags_tag_id ON phrase_tags(tag_id);

-- フォルダ・ジャンル表示順序用
CREATE INDEX idx_folders_order_index ON folders(order_index);

-- 全文検索用（必要に応じて）
-- CREATE INDEX idx_lines_text_fts ON lines(text);
-- CREATE INDEX idx_phrases_text_fts ON phrases(text);
```

## エンティティ関係図

```
folders (1) -----> (0..n) projects
genres (1) ------> (0..n) projects
projects (1) ----> (0..n) sections
sections (1) ----> (0..n) lines

tags (n) <-----> (n) projects [project_tags]
tags (n) <-----> (n) phrases [phrase_tags]
```

## 注意事項

1. **文字列制約**: ドメインモデルのバリューオブジェクトで文字数制限を実施
2. **日時形式**: ISO8601形式の文字列として保存（`YYYY-MM-DDTHH:mm:ss.sssZ`）
3. **論理削除**: projectsテーブルのみ論理削除を実装
4. **カスケード削除**: 階層構造に応じてCASCADE/SET NULL設定
5. **JSON配列**: template_sectionsは文字列形式のJSON配列として保存

## データ整合性

- 外部キー制約による参照整合性の保証
- ユニーク制約による重複防止
- NOT NULL制約による必須データの保証
- CHECKエラー時は生成されるSQL文で制約を追加予定