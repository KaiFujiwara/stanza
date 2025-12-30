import { supabase } from './client';

/**
 * 匿名認証を実行
 * セッションが存在しない場合のみ新規に作成
 */
export async function ensureAnonymousAuth(): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    // 既存のセッションがある場合でも、サーバーで検証
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      // セッションは存在するがサーバーで無効な場合（DBにユーザーが存在しない）
      await supabase.auth.signOut();
      // 再帰的に再認証
      return ensureAnonymousAuth();
    }

    return;
  }

  // 匿名認証を実行
  const { error } = await supabase.auth.signInAnonymously();

  if (error) {
    throw new Error(`匿名認証に失敗しました: ${error.message}`);
  }
}

/**
 * 現在のユーザーIDを取得
 * 認証されていない場合はエラーをスロー
 */
export async function getCurrentUserId(): Promise<string> {
  // getSession()を使用（ローカルセッションから取得、サーバー問い合わせ不要）
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(`セッション取得に失敗: ${error.message}`);
  }

  if (!session?.user) {
    throw new Error('ユーザーが認証されていません');
  }

  return session.user.id;
}
