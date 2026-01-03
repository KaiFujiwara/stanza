-- save_project_with_sections 関数を拡張
-- フォルダ移動時に、移動元フォルダの order_index を自動で詰め直す

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
DECLARE
  v_old_folder_id UUID;
  v_folder_changed BOOLEAN := false;
BEGIN
  -- 既存プロジェクトのフォルダIDを取得（新規作成の場合は NULL）
  SELECT folder_id INTO v_old_folder_id
  FROM public.projects
  WHERE id = p_project_id
    AND user_id = p_user_id;

  -- フォルダが変更されたかチェック
  IF FOUND AND (v_old_folder_id IS DISTINCT FROM p_folder_id) THEN
    v_folder_changed := true;
  END IF;

  -- プロジェクトをupsert
  INSERT INTO public.projects (id, user_id, title, folder_id, genre_id, order_index, is_deleted, deleted_at)
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
  DELETE FROM public.sections WHERE project_id = p_project_id;

  -- 新しいセクションを挿入
  IF p_sections IS NOT NULL AND jsonb_array_length(p_sections) > 0 THEN
    INSERT INTO public.sections (id, user_id, project_id, name, order_index, content)
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

  -- フォルダが変更された場合、移動元フォルダの order_index を詰め直す
  IF v_folder_changed THEN
    PERFORM public.reorder_projects_in_folder(p_user_id, v_old_folder_id);
  END IF;
END;
$$ LANGUAGE plpgsql
SET search_path = '';
