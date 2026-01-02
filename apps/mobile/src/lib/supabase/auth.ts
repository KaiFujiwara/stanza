import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './client';
import { InfraError, InfraErrorCode } from '@/lib/errors';

// WebBrowserの設定（OAuth完了後に自動でブラウザを閉じる）
WebBrowser.maybeCompleteAuthSession();

/**
 * 匿名認証を実行（開発用）
 */
export async function signInAnonymously(): Promise<void> {
  const { error } = await supabase.auth.signInAnonymously();

  if (error) {
    throw new InfraError(
      InfraErrorCode.AUTH_FAILED,
      'Anonymous sign-in failed',
      error
    );
  }
}

/**
 * Google OAuth認証を実行
 */
export async function signInWithGoogle(): Promise<void> {
  // アプリのカスタムスキームでリダイレクトURLを作成
  const redirectUrl = Linking.createURL('/auth/callback');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true, // React Native/Expoでは必須
    },
  });

  if (error) {
    throw new InfraError(
      InfraErrorCode.AUTH_FAILED,
      'OAuth initialization failed',
      error
    );
  }

  if (!data?.url) {
    throw new InfraError(
      InfraErrorCode.AUTH_FAILED,
      'No OAuth URL returned'
    );
  }

  // WebBrowserでOAuthフローを開始
  const result = await WebBrowser.openAuthSessionAsync(
    data.url,
    redirectUrl
  );

  if (result.type === 'success' && result.url) {
    // URLからトークンを抽出
    const url = new URL(result.url);
    const access_token = url.searchParams.get('access_token');
    const refresh_token = url.searchParams.get('refresh_token');

    if (!access_token || !refresh_token) {
      throw new InfraError(
        InfraErrorCode.AUTH_FAILED,
        'No tokens found in callback URL'
      );
    }

    // セッションを設定
    const { error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (sessionError) {
      throw new InfraError(
        InfraErrorCode.AUTH_FAILED,
        'Failed to set session',
        sessionError
      );
    }
  } else if (result.type === 'cancel') {
    // ユーザーがキャンセルした場合は正常なフローとして扱う
    return;
  } else {
    throw new InfraError(
      InfraErrorCode.AUTH_FAILED,
      'OAuth flow failed'
    );
  }
}

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
 * サインアウト
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new InfraError(
      InfraErrorCode.SIGN_OUT_FAILED,
      'Sign out operation failed',
      error
    );
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
