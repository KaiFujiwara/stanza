import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from '../client';
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
 * Apple ID認証を実行（iOS専用）
 */
export async function signInWithApple(): Promise<void> {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Supabase認証
    if (!credential.identityToken) {
      throw new InfraError(
        InfraErrorCode.AUTH_FAILED,
        'No identityToken received from Apple'
      );
    }

    const {
      error,
      data: { user },
    } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    });

    if (error) {
      throw new InfraError(
        InfraErrorCode.AUTH_FAILED,
        'Apple sign-in failed',
        error
      );
    }

    // Appleは初回サインイン時のみ氏名を提供するため、保存する
    if (user && credential.fullName) {
      const nameParts = [];
      if (credential.fullName.givenName) nameParts.push(credential.fullName.givenName);
      if (credential.fullName.middleName) nameParts.push(credential.fullName.middleName);
      if (credential.fullName.familyName) nameParts.push(credential.fullName.familyName);

      const fullName = nameParts.join(' ');

      await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          given_name: credential.fullName.givenName,
          family_name: credential.fullName.familyName,
        },
      });
    }
  } catch (error: any) {
    if (error.code === 'ERR_REQUEST_CANCELED') {
      // ユーザーがキャンセルした場合は正常なフローとして扱う
      return;
    }
    throw new InfraError(
      InfraErrorCode.AUTH_FAILED,
      'Apple sign-in failed',
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
