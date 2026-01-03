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
  const redirectUrl = Linking.createURL('auth/callback', { scheme: 'stanza' });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true, // React Native/Expoでは必須
      queryParams: {
        prompt: 'select_account', // 常にアカウント選択画面を表示
      },
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
    // result.url が deep link (stanza://) じゃない場合は処理しない
    if (!result.url.startsWith('stanza://')) {
      throw new InfraError(
        InfraErrorCode.AUTH_FAILED,
        `Expected deep link but got: ${result.url}`
      );
    }

    // コールバックURLをパース
    const parsed = Linking.parse(result.url);

    // PKCE Flow: query (?code=...) をチェック
    const code = typeof parsed.queryParams?.code === 'string' ? parsed.queryParams.code : null;

    // Implicit Flow: fragment (#access_token=...&refresh_token=...) をチェック
    // Linking.parse は fragment を queryParams に入れないので、手動でパース
    const fragment = result.url.split('#')[1];
    let access_token: string | null = null;
    let refresh_token: string | null = null;

    if (fragment) {
      const fragmentParams = new URLSearchParams(fragment);
      access_token = fragmentParams.get('access_token');
      refresh_token = fragmentParams.get('refresh_token');
    }

    // PKCE フロー: code を session に交換
    if (code) {
      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

      if (sessionError) {
        throw new InfraError(
          InfraErrorCode.AUTH_FAILED,
          `Failed to exchange code for session: ${sessionError.message}`,
          sessionError
        );
      }
      return;
    }

    // Implicit フロー: access_token と refresh_token を直接使用
    if (access_token && refresh_token) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (sessionError) {
        throw new InfraError(
          InfraErrorCode.AUTH_FAILED,
          `Failed to set session: ${sessionError.message}`,
          sessionError
        );
      }
      return;
    }

    // code も token も見つからない場合
    throw new InfraError(
      InfraErrorCode.AUTH_FAILED,
      `No code or tokens found in callback URL. URL: ${result.url}`
    );
  } else if (result.type === 'cancel') {
    // ユーザーがキャンセルした場合は正常なフローとして扱う
    return;
  } else {
    throw new InfraError(
      InfraErrorCode.AUTH_FAILED,
      `OAuth flow failed with type: ${result.type}`
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
