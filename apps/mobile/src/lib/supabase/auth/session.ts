import { supabase } from '../client';
import { InfraError, InfraErrorCode } from '@/lib/errors';

/**
 * 現在のセッションを確認
 */
export async function checkSession(): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return false;
  }

  // セッションが存在する場合、サーバーで検証
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    // セッションは存在するがサーバーで無効な場合
    await supabase.auth.signOut();
    return false;
  }

  return true;
}

/**
 * 現在のユーザーIDを取得
 * 認証されていない場合はエラーをスロー
 */
export async function getCurrentUserId(): Promise<string> {
  // getSession()を使用（ローカルセッションから取得、サーバー問い合わせ不要）
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    throw new InfraError(
      InfraErrorCode.AUTH_SESSION_INVALID,
      'Failed to get session',
      error
    );
  }

  if (!session?.user) {
    throw new InfraError(
      InfraErrorCode.AUTH_SESSION_INVALID,
      'No user session found'
    );
  }

  return session.user.id;
}
