-- フォルダ内のプロジェクトの order_index を詰め直す関数
-- プロジェクト移動時に、移動元フォルダの order_index に穴ができるのを防ぐ

CREATE OR REPLACE FUNCTION reorder_projects_in_folder(
  p_user_id UUID,
  p_folder_id UUID  -- NULL の場合は未分類フォルダ
) RETURNS void AS $$
DECLARE
  v_project RECORD;
  v_new_index INT := 0;
BEGIN
  -- 指定されたフォルダ内のプロジェクトを order_index 順に取得し、
  -- 1, 2, 3... と振り直す
  FOR v_project IN
    SELECT id
    FROM public.projects
    WHERE user_id = p_user_id
      AND is_deleted = false
      AND (
        (p_folder_id IS NULL AND folder_id IS NULL) OR
        (p_folder_id IS NOT NULL AND folder_id = p_folder_id)
      )
    ORDER BY order_index ASC
  LOOP
    v_new_index := v_new_index + 1;

    UPDATE public.projects
    SET order_index = v_new_index
    WHERE id = v_project.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql
SET search_path = '';
