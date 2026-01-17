-- アカウント削除機能
-- ユーザーデータとアカウントを完全に削除する関数
-- ベストプラクティス: パラメータなし、auth.uid()を使用

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- 現在のユーザーIDを取得
  current_user_id := auth.uid();

  -- ユーザーが認証されていることを確認
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: You must be logged in to delete your account';
  END IF;

  -- auth.users からユーザーを削除
  -- SECURITY DEFINERにより、この関数は所有者権限で実行されるため削除可能
  -- ON DELETE CASCADE により、関連データ（projects, sections, phrases, tags, genres, folders）も自動削除される
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;

-- この関数は認証済みユーザーのみが実行可能
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;

COMMENT ON FUNCTION public.delete_user_account IS 'ユーザーアカウントと関連するすべてのデータを削除する（本人のみ）';
