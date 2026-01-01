-- ============================================================================
-- Database Functions
-- フォルダ削除、フレーズ保存などのトランザクション処理
-- ============================================================================

-- ============================================================================
-- 1. フォルダ削除関数（トランザクション付き）
-- ============================================================================
-- フォルダを削除し、紐づくプロジェクトを未分類に移動する
-- 削除後、残りのフォルダのorder_indexを再採番
CREATE OR REPLACE FUNCTION delete_folder_with_projects(
  p_folder_id UUID,
  p_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_max_uncategorized_order_index INT;
  v_project RECORD;
  v_new_order_index INT;
  v_deleted_order_index INT;
BEGIN
  -- トランザクション開始（関数内では自動）

  -- 1. ユーザーの所有権を確認
  IF NOT EXISTS (
    SELECT 1 FROM folders
    WHERE id = p_folder_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'フォルダが見つからないか、アクセス権限がありません';
  END IF;

  -- 削除対象のフォルダのorder_indexを取得
  SELECT order_index INTO v_deleted_order_index
  FROM folders
  WHERE id = p_folder_id AND user_id = p_user_id;

  -- 2. 未分類（folder_id = null）の最大 order_index を取得
  SELECT COALESCE(MAX(order_index), 0)
  INTO v_max_uncategorized_order_index
  FROM projects
  WHERE user_id = p_user_id
    AND folder_id IS NULL
    AND is_deleted = false;

  -- 3. 削除するフォルダ内のプロジェクトを order_index 順に処理
  v_new_order_index := v_max_uncategorized_order_index;

  FOR v_project IN
    SELECT id, order_index
    FROM projects
    WHERE folder_id = p_folder_id
      AND user_id = p_user_id
      AND is_deleted = false
    ORDER BY order_index ASC
  LOOP
    v_new_order_index := v_new_order_index + 1;

    -- プロジェクトを未分類に移動
    UPDATE projects
    SET folder_id = NULL,
        order_index = v_new_order_index
        -- updated_at はBEFORE UPDATEトリガーで自動更新
    WHERE id = v_project.id;
  END LOOP;

  -- 4. フォルダを削除
  DELETE FROM folders
  WHERE id = p_folder_id
    AND user_id = p_user_id;

  -- 5. 残りのフォルダのorder_indexを再採番
  -- 削除したフォルダより後ろのフォルダを1つずつ前に詰める
  UPDATE folders
  SET order_index = order_index - 1
      -- updated_at はBEFORE UPDATEトリガーで自動更新
  WHERE user_id = p_user_id
    AND order_index > v_deleted_order_index;

  -- トランザクションは関数終了時に自動コミット
END;
$$;

COMMENT ON FUNCTION delete_folder_with_projects IS
'フォルダを削除し、配下のプロジェクトを順序を保持したまま未分類に移動する。削除後、残りのフォルダのorder_indexを再採番する。トランザクション内で実行される。';

-- ============================================================================
-- 2. フレーズとタグをトランザクション内で保存する関数
-- ============================================================================
-- フレーズとタグの紐付けをトランザクション内で保存
-- 引数の順序はアルファベット順に統一（Supabaseのデフォルト）
CREATE OR REPLACE FUNCTION save_phrase_with_tags(
  p_note TEXT,
  p_phrase_id UUID,
  p_tag_ids UUID[],
  p_text TEXT,
  p_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
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
    FROM tags
    WHERE id = ANY(p_tag_ids)
      AND user_id = p_user_id;

    -- タグ数が一致しない場合はエラー
    IF v_existing_tag_count != array_length(p_tag_ids, 1) THEN
      RAISE EXCEPTION '指定されたタグが存在しないか、アクセス権限がありません';
    END IF;
  END IF;

  -- フレーズ本体を保存（upsert）
  INSERT INTO phrases (id, user_id, text, note)
  VALUES (p_phrase_id, p_user_id, p_text, p_note)
  ON CONFLICT (id) DO UPDATE
  SET
    text = EXCLUDED.text,
    note = EXCLUDED.note;
    -- created_at は更新しないので既存の値が保持される
    -- updated_at はBEFORE UPDATEトリガーで自動更新

  -- 既存のタグ関連を削除
  DELETE FROM phrase_tags
  WHERE phrase_id = p_phrase_id;

  -- 新しいタグ関連を挿入（配列が空でない場合のみ）
  IF array_length(p_tag_ids, 1) > 0 THEN
    FOREACH v_tag_id IN ARRAY p_tag_ids
    LOOP
      INSERT INTO phrase_tags (phrase_id, tag_id)
      VALUES (p_phrase_id, v_tag_id);
    END LOOP;
  END IF;
END;
$$;

COMMENT ON FUNCTION save_phrase_with_tags IS
'フレーズとタグの紐付けをトランザクション内で保存する。フレーズ自体に変更がなくても、タグの変更があればupdated_atが更新される。';
