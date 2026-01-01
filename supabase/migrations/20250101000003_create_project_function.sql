-- プロジェクト作成用のストアドプロシージャ
-- order_indexを原子的に計算して挿入することで、競合状態を防ぐ
-- セクションも同じトランザクション内で作成

CREATE OR REPLACE FUNCTION create_project_with_sections(
  p_project_id UUID,
  p_user_id UUID,
  p_title TEXT,
  p_folder_id UUID,
  p_genre_id UUID,
  p_sections JSONB
) RETURNS void AS $$
DECLARE
  v_next_order_index INT;
BEGIN
  -- 現在の最大order_indexを取得して+1（原子的）
  -- folder_id が指定されている場合は同じフォルダ内、そうでない場合はフォルダなしのプロジェクト内で採番
  IF p_folder_id IS NOT NULL THEN
    SELECT COALESCE(MAX(order_index), 0) + 1
    INTO v_next_order_index
    FROM projects
    WHERE user_id = p_user_id
      AND folder_id = p_folder_id
      AND is_deleted = false;
  ELSE
    SELECT COALESCE(MAX(order_index), 0) + 1
    INTO v_next_order_index
    FROM projects
    WHERE user_id = p_user_id
      AND folder_id IS NULL
      AND is_deleted = false;
  END IF;

  -- プロジェクトを挿入
  INSERT INTO projects (id, user_id, title, folder_id, genre_id, order_index, is_deleted, deleted_at)
  VALUES (
    p_project_id,
    p_user_id,
    p_title,
    p_folder_id,
    p_genre_id,
    v_next_order_index,
    false,
    NULL
    -- created_at, updated_at はDEFAULT値(NOW())で自動設定
  );

  -- セクションを挿入
  IF p_sections IS NOT NULL AND jsonb_array_length(p_sections) > 0 THEN
    INSERT INTO sections (id, user_id, project_id, name, order_index, content)
    SELECT
      (elem->>'id')::UUID,
      p_user_id,
      p_project_id,
      elem->>'name',
      (elem->>'order_index')::INT,
      elem->>'content'
      -- created_at, updated_at はDEFAULT値(NOW())で自動設定
    FROM jsonb_array_elements(p_sections) AS elem;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- プロジェクト更新用のストアドプロシージャ（セクションも含めてトランザクション内で更新）
CREATE OR REPLACE FUNCTION save_project_with_sections(
  p_project_id UUID,
  p_user_id UUID,
  p_title TEXT,
  p_folder_id UUID,
  p_genre_id UUID,
  p_order_index INT,
  p_is_deleted BOOLEAN,
  p_deleted_at TIMESTAMPTZ,
  p_sections JSONB
) RETURNS void AS $$
BEGIN
  -- プロジェクトをupsert
  INSERT INTO projects (id, user_id, title, folder_id, genre_id, order_index, is_deleted, deleted_at)
  VALUES (
    p_project_id,
    p_user_id,
    p_title,
    p_folder_id,
    p_genre_id,
    p_order_index,
    p_is_deleted,
    p_deleted_at
    -- created_at, updated_at はDEFAULT値で自動設定
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    folder_id = EXCLUDED.folder_id,
    genre_id = EXCLUDED.genre_id,
    order_index = EXCLUDED.order_index,
    is_deleted = EXCLUDED.is_deleted,
    deleted_at = EXCLUDED.deleted_at;
    -- created_at は更新しないので既存の値が保持される
    -- updated_at はBEFORE UPDATEトリガーで自動更新

  -- 既存のセクションを削除
  DELETE FROM sections WHERE project_id = p_project_id;

  -- 新しいセクションを挿入
  IF p_sections IS NOT NULL AND jsonb_array_length(p_sections) > 0 THEN
    INSERT INTO sections (id, user_id, project_id, name, order_index, content)
    SELECT
      (elem->>'id')::UUID,
      p_user_id,
      p_project_id,
      elem->>'name',
      (elem->>'order_index')::INT,
      elem->>'content'
      -- created_at, updated_at はDEFAULT値(NOW())で自動設定
    FROM jsonb_array_elements(p_sections) AS elem;
  END IF;
END;
$$ LANGUAGE plpgsql;
