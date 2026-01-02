-- ============================================================================
-- Fix Function Search Path Security Issue
-- セキュリティ警告対応: 各関数に search_path を設定して検索パス注入攻撃を防ぐ
-- ============================================================================

-- 1. update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 2. delete_folder_with_projects
CREATE OR REPLACE FUNCTION delete_folder_with_projects(
  p_folder_id UUID,
  p_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_max_uncategorized_order_index INT;
  v_project RECORD;
  v_new_order_index INT;
  v_deleted_order_index INT;
BEGIN
  -- 1. ユーザーの所有権を確認
  IF NOT EXISTS (
    SELECT 1 FROM public.folders
    WHERE id = p_folder_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'フォルダが見つからないか、アクセス権限がありません';
  END IF;

  -- 削除対象のフォルダのorder_indexを取得
  SELECT order_index INTO v_deleted_order_index
  FROM public.folders
  WHERE id = p_folder_id AND user_id = p_user_id;

  -- 2. 未分類（folder_id = null）の最大 order_index を取得
  SELECT COALESCE(MAX(order_index), 0)
  INTO v_max_uncategorized_order_index
  FROM public.projects
  WHERE user_id = p_user_id
    AND folder_id IS NULL
    AND is_deleted = false;

  -- 3. 削除するフォルダ内のプロジェクトを order_index 順に処理
  v_new_order_index := v_max_uncategorized_order_index;

  FOR v_project IN
    SELECT id, order_index
    FROM public.projects
    WHERE folder_id = p_folder_id
      AND user_id = p_user_id
      AND is_deleted = false
    ORDER BY order_index ASC
  LOOP
    v_new_order_index := v_new_order_index + 1;

    -- プロジェクトを未分類に移動
    UPDATE public.projects
    SET folder_id = NULL,
        order_index = v_new_order_index
    WHERE id = v_project.id;
  END LOOP;

  -- 4. フォルダを削除
  DELETE FROM public.folders
  WHERE id = p_folder_id
    AND user_id = p_user_id;

  -- 5. 残りのフォルダのorder_indexを再採番
  UPDATE public.folders
  SET order_index = order_index - 1
  WHERE user_id = p_user_id
    AND order_index > v_deleted_order_index;
END;
$$;

-- 3. save_phrase_with_tags
CREATE OR REPLACE FUNCTION save_phrase_with_tags(
  p_note TEXT,
  p_phrase_id UUID,
  p_tag_ids UUID[],
  p_text TEXT,
  p_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_tag_id UUID;
  v_existing_tag_count INTEGER;
BEGIN
  -- タグIDの存在確認（配列が空でない場合のみ）
  IF array_length(p_tag_ids, 1) > 0 THEN
    -- 指定されたタグIDが全て存在し、かつユーザーのものであることを確認
    SELECT COUNT(*)
    INTO v_existing_tag_count
    FROM public.tags
    WHERE id = ANY(p_tag_ids)
      AND user_id = p_user_id;

    -- タグ数が一致しない場合はエラー
    IF v_existing_tag_count != array_length(p_tag_ids, 1) THEN
      RAISE EXCEPTION '指定されたタグが存在しないか、アクセス権限がありません';
    END IF;
  END IF;

  -- フレーズ本体を保存（upsert）
  INSERT INTO public.phrases (id, user_id, text, note)
  VALUES (p_phrase_id, p_user_id, p_text, p_note)
  ON CONFLICT (id) DO UPDATE
  SET
    text = EXCLUDED.text,
    note = EXCLUDED.note;

  -- 既存のタグ関連を削除
  DELETE FROM public.phrase_tags
  WHERE phrase_id = p_phrase_id;

  -- 新しいタグ関連を挿入（配列が空でない場合のみ）
  IF array_length(p_tag_ids, 1) > 0 THEN
    FOREACH v_tag_id IN ARRAY p_tag_ids
    LOOP
      INSERT INTO public.phrase_tags (phrase_id, tag_id)
      VALUES (p_phrase_id, v_tag_id);
    END LOOP;
  END IF;
END;
$$;

-- 4. create_folder
CREATE OR REPLACE FUNCTION create_folder(
  p_user_id UUID,
  p_name TEXT
)
RETURNS public.folders
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_next_order_index INT;
  v_folder public.folders;
BEGIN
  -- 現在の最大order_indexを取得して+1（原子的）
  SELECT COALESCE(MAX(order_index), 0) + 1
  INTO v_next_order_index
  FROM public.folders
  WHERE user_id = p_user_id;

  -- フォルダを挿入
  INSERT INTO public.folders (id, user_id, name, order_index)
  VALUES (
    gen_random_uuid(),
    p_user_id,
    p_name,
    v_next_order_index
  )
  RETURNING * INTO v_folder;

  RETURN v_folder;
END;
$$;

-- 5. create_project_with_sections
CREATE OR REPLACE FUNCTION create_project_with_sections(
  p_project_id UUID,
  p_user_id UUID,
  p_title TEXT,
  p_folder_id UUID,
  p_genre_id UUID,
  p_sections JSONB
)
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_next_order_index INT;
BEGIN
  -- 現在の最大order_indexを取得して+1（原子的）
  IF p_folder_id IS NOT NULL THEN
    SELECT COALESCE(MAX(order_index), 0) + 1
    INTO v_next_order_index
    FROM public.projects
    WHERE user_id = p_user_id
      AND folder_id = p_folder_id
      AND is_deleted = false;
  ELSE
    SELECT COALESCE(MAX(order_index), 0) + 1
    INTO v_next_order_index
    FROM public.projects
    WHERE user_id = p_user_id
      AND folder_id IS NULL
      AND is_deleted = false;
  END IF;

  -- プロジェクトを挿入
  INSERT INTO public.projects (id, user_id, title, folder_id, genre_id, order_index, is_deleted, deleted_at)
  VALUES (
    p_project_id,
    p_user_id,
    p_title,
    p_folder_id,
    p_genre_id,
    v_next_order_index,
    false,
    NULL
  );

  -- セクションを挿入
  IF p_sections IS NOT NULL AND jsonb_array_length(p_sections) > 0 THEN
    INSERT INTO public.sections (id, user_id, project_id, name, order_index, content)
    SELECT
      (elem->>'id')::UUID,
      p_user_id,
      p_project_id,
      elem->>'name',
      (elem->>'order_index')::INT,
      elem->>'content'
    FROM jsonb_array_elements(p_sections) AS elem;
  END IF;
END;
$$;

-- 6. save_project_with_sections
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
)
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
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
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    folder_id = EXCLUDED.folder_id,
    genre_id = EXCLUDED.genre_id,
    order_index = EXCLUDED.order_index,
    is_deleted = EXCLUDED.is_deleted,
    deleted_at = EXCLUDED.deleted_at;

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
    FROM jsonb_array_elements(p_sections) AS elem;
  END IF;
END;
$$;

COMMENT ON FUNCTION update_updated_at_column IS
'updated_at カラムを自動更新するトリガー関数。search_path を固定してセキュリティを強化。';

COMMENT ON FUNCTION delete_folder_with_projects IS
'フォルダを削除し、配下のプロジェクトを順序を保持したまま未分類に移動する。削除後、残りのフォルダのorder_indexを再採番する。トランザクション内で実行される。search_path を固定してセキュリティを強化。';

COMMENT ON FUNCTION save_phrase_with_tags IS
'フレーズとタグの紐付けをトランザクション内で保存する。フレーズ自体に変更がなくても、タグの変更があればupdated_atが更新される。search_path を固定してセキュリティを強化。';
