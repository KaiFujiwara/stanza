-- フォルダ作成用のストアドプロシージャ
-- order_indexを原子的に計算して挿入することで、競合状態を防ぐ

CREATE OR REPLACE FUNCTION create_folder(
  p_user_id UUID,
  p_name TEXT
) RETURNS folders AS $$
DECLARE
  v_next_order_index INT;
  v_folder folders;
BEGIN
  -- 現在の最大order_indexを取得して+1（原子的）
  SELECT COALESCE(MAX(order_index), 0) + 1
  INTO v_next_order_index
  FROM folders
  WHERE user_id = p_user_id;

  -- フォルダを挿入
  INSERT INTO folders (id, user_id, name, order_index, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    p_user_id,
    p_name,
    v_next_order_index,
    NOW(),
    NOW()
  )
  RETURNING * INTO v_folder;

  RETURN v_folder;
END;
$$ LANGUAGE plpgsql;
