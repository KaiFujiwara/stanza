import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './client';

// WebBrowserの設定（OAuth完了後に自動でブラウザを閉じる）
WebBrowser.maybeCompleteAuthSession();

/**
 * Google OAuth認証を実行
 */
export async function signInWithGoogle(): Promise<void> {
  // アプリのカスタムスキームでリダイレクトURLを作成
  const redirectUrl = Linking.createURL('/auth/callback');
  console.log('[signInWithGoogle] redirectUrl:', redirectUrl);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true, // React Native/Expoでは必須
    },
  });

  console.log('[signInWithGoogle] OAuth URL:', data?.url);

  if (error) {
    throw new Error('Failed to sign in with Google', { cause: error });
  }

  if (!data?.url) {
    throw new Error('No OAuth URL returned');
  }

  // WebBrowserでOAuthフローを開始
  const result = await WebBrowser.openAuthSessionAsync(
    data.url,
    redirectUrl
  );

  console.log('[signInWithGoogle] result:', result);

  if (result.type === 'success' && result.url) {
    // URLからトークンを抽出
    const url = new URL(result.url);
    const access_token = url.searchParams.get('access_token');
    const refresh_token = url.searchParams.get('refresh_token');

    console.log('[signInWithGoogle] tokens found:', {
      hasAccessToken: !!access_token,
      hasRefreshToken: !!refresh_token
    });

    if (!access_token || !refresh_token) {
      throw new Error('No tokens found in callback URL');
    }

    // セッションを設定
    const { error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (sessionError) {
      throw new Error('Failed to set session', { cause: sessionError });
    }
  } else if (result.type === 'cancel') {
    throw new Error('Googleログインがキャンセルされました');
  } else {
    throw new Error('Googleログインが失敗しました');
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
    throw new Error('Failed to sign out', { cause: error });
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
    throw new Error('User not authenticated', { cause: error });
  }

  if (!session?.user) {
    throw new Error('User not authenticated');
  }

  return session.user.id;
}
