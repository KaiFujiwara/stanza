-- フォルダ作成関数を修正: クライアント側で生成したIDを受け取るように変更
-- プロジェクト作成関数と同じパターンに統一

CREATE OR REPLACE FUNCTION create_folder(
  p_folder_id UUID,
  p_user_id UUID,
  p_name TEXT
) RETURNS void AS $$
DECLARE
  v_next_order_index INT;
BEGIN
  -- 現在の最大order_indexを取得して+1（原子的）
  SELECT COALESCE(MAX(order_index), 0) + 1
  INTO v_next_order_index
  FROM public.folders
  WHERE user_id = p_user_id;

  -- フォルダを挿入
  INSERT INTO public.folders (id, user_id, name, order_index)
  VALUES (
    p_folder_id,
    p_user_id,
    p_name,
    v_next_order_index
    -- created_at, updated_at はDEFAULT値(NOW())で自動設定
  );
END;
$$ LANGUAGE plpgsql
SET search_path = '';
