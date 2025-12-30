-- Supabase (PostgreSQL) Schema Definition
-- 作成日: 2025-12-29

-- ============================================================================
-- 1. Users Table (Supabase Authが自動管理)
-- ============================================================================
-- auth.users テーブルはSupabaseが自動作成
-- 参照: auth.users(id)

-- ============================================================================
-- 2. Folders Table
-- ============================================================================
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT folders_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_folders_user_order ON folders(user_id, order_index);

-- ============================================================================
-- 3. Genres Table
-- ============================================================================
CREATE TABLE genres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT genres_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

CREATE INDEX idx_genres_user_id ON genres(user_id);
CREATE INDEX idx_genres_user_name ON genres(user_id, name);

-- ============================================================================
-- 4. Genre Template Sections (ジャンルのセクションテンプレート)
-- ============================================================================
CREATE TABLE genre_template_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  genre_id UUID NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT genre_template_sections_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

CREATE INDEX idx_genre_template_sections_genre_id ON genre_template_sections(genre_id);
CREATE INDEX idx_genre_template_sections_order ON genre_template_sections(genre_id, order_index);

-- ============================================================================
-- 5. Projects Table (集約ルート)
-- ============================================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  genre_id UUID REFERENCES genres(id) ON DELETE SET NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT projects_title_not_empty CHECK (LENGTH(TRIM(title)) > 0),
  CONSTRAINT projects_deleted_at_consistency CHECK (
    (is_deleted = TRUE AND deleted_at IS NOT NULL) OR
    (is_deleted = FALSE AND deleted_at IS NULL)
  )
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_user_not_deleted ON projects(user_id, is_deleted) WHERE is_deleted = FALSE;
CREATE INDEX idx_projects_folder_id ON projects(folder_id);
CREATE INDEX idx_projects_genre_id ON projects(genre_id);
CREATE INDEX idx_projects_updated_at ON projects(user_id, updated_at DESC);
CREATE INDEX idx_projects_folder_order ON projects(folder_id, order_index);

-- 全文検索用インデックス
CREATE INDEX idx_projects_title_search ON projects USING gin(to_tsvector('simple', title));

-- ============================================================================
-- 6. Sections Table (Project集約内エンティティ)
-- ============================================================================
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  lines TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT sections_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
  -- Note: sections_max_per_project constraint removed (subqueries not allowed in CHECK)
  -- This validation should be handled at the application layer
);

CREATE INDEX idx_sections_project_id ON sections(project_id);
CREATE INDEX idx_sections_project_order ON sections(project_id, order_index);
CREATE INDEX idx_sections_user_id ON sections(user_id);

-- ============================================================================
-- 7. Tags Table
-- ============================================================================
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7), -- #RRGGBB形式
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT tags_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT tags_color_format CHECK (color IS NULL OR color ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT tags_unique_name_per_user UNIQUE (user_id, name)
);

CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_tags_user_name ON tags(user_id, name);

-- ============================================================================
-- 8. Phrases Table
-- ============================================================================
CREATE TABLE phrases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT phrases_text_not_empty CHECK (LENGTH(TRIM(text)) > 0)
);

CREATE INDEX idx_phrases_user_id ON phrases(user_id);
CREATE INDEX idx_phrases_created_at ON phrases(user_id, created_at DESC);

-- 全文検索用インデックス
CREATE INDEX idx_phrases_text_search ON phrases USING gin(to_tsvector('simple', text));

-- ============================================================================
-- 9. Phrase_Tags Table (中間テーブル - 多対多)
-- ============================================================================
CREATE TABLE phrase_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phrase_id UUID NOT NULL REFERENCES phrases(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT phrase_tags_unique_pair UNIQUE (phrase_id, tag_id)
);

CREATE INDEX idx_phrase_tags_phrase_id ON phrase_tags(phrase_id);
CREATE INDEX idx_phrase_tags_tag_id ON phrase_tags(tag_id);
CREATE INDEX idx_phrase_tags_tag_created ON phrase_tags(tag_id, created_at DESC);

-- ============================================================================
-- Triggers: updated_at 自動更新
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルにトリガー設定
CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_genres_updated_at BEFORE UPDATE ON genres
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sections_updated_at BEFORE UPDATE ON sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON tags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_phrases_updated_at BEFORE UPDATE ON phrases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Row Level Security (RLS) ポリシー
-- ============================================================================

-- RLS有効化
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE genre_template_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE phrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE phrase_tags ENABLE ROW LEVEL SECURITY;

-- Folders ポリシー
CREATE POLICY "Users can view their own folders"
  ON folders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own folders"
  ON folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders"
  ON folders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders"
  ON folders FOR DELETE
  USING (auth.uid() = user_id);

-- Genres ポリシー
CREATE POLICY "Users can view their own genres"
  ON genres FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own genres"
  ON genres FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own genres"
  ON genres FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own genres"
  ON genres FOR DELETE
  USING (auth.uid() = user_id);

-- Genre Template Sections ポリシー
CREATE POLICY "Users can view their own genre templates"
  ON genre_template_sections FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM genres WHERE genres.id = genre_template_sections.genre_id AND genres.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own genre templates"
  ON genre_template_sections FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM genres WHERE genres.id = genre_template_sections.genre_id AND genres.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own genre templates"
  ON genre_template_sections FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM genres WHERE genres.id = genre_template_sections.genre_id AND genres.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own genre templates"
  ON genre_template_sections FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM genres WHERE genres.id = genre_template_sections.genre_id AND genres.user_id = auth.uid()
  ));

-- Projects ポリシー
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Sections ポリシー
CREATE POLICY "Users can view their own sections"
  ON sections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sections"
  ON sections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sections"
  ON sections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sections"
  ON sections FOR DELETE
  USING (auth.uid() = user_id);

-- Tags ポリシー
CREATE POLICY "Users can view their own tags"
  ON tags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tags"
  ON tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags"
  ON tags FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags"
  ON tags FOR DELETE
  USING (auth.uid() = user_id);

-- Phrases ポリシー
CREATE POLICY "Users can view their own phrases"
  ON phrases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own phrases"
  ON phrases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own phrases"
  ON phrases FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own phrases"
  ON phrases FOR DELETE
  USING (auth.uid() = user_id);

-- Phrase_Tags ポリシー
CREATE POLICY "Users can view their own phrase_tags"
  ON phrase_tags FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM phrases WHERE phrases.id = phrase_tags.phrase_id AND phrases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own phrase_tags"
  ON phrase_tags FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM phrases WHERE phrases.id = phrase_tags.phrase_id AND phrases.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own phrase_tags"
  ON phrase_tags FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM phrases WHERE phrases.id = phrase_tags.phrase_id AND phrases.user_id = auth.uid()
  ));

-- ============================================================================
-- View: phrases_with_tags (N+1対策用)
-- ============================================================================

CREATE OR REPLACE VIEW phrases_with_tags AS
SELECT
  p.id,
  p.user_id,
  p.text,
  p.note,
  p.created_at,
  p.updated_at,
  COALESCE(
    json_agg(
      json_build_object(
        'id', t.id,
        'name', t.name,
        'color', t.color
      ) ORDER BY t.created_at
    ) FILTER (WHERE t.id IS NOT NULL),
    '[]'::json
  ) AS tags
FROM phrases p
LEFT JOIN phrase_tags pt ON p.id = pt.phrase_id
LEFT JOIN tags t ON pt.tag_id = t.id
GROUP BY p.id, p.user_id, p.text, p.note, p.created_at, p.updated_at;

-- RLS for View
ALTER VIEW phrases_with_tags SET (security_invoker = true);

COMMENT ON VIEW phrases_with_tags IS 'Phrases with their tags aggregated (N+1 query optimization)';
