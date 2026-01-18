import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from '../client';
import { InfraError, InfraErrorCode } from '@/lib/errors';

/**
 * Appleアカウントを既存ユーザーにリンク（iOS専用）
 */
export async function linkAppleIdentity(): Promise<void> {
  console.log('[linkAppleIdentity] Starting Apple identity linking');

  try {
    console.log('[linkAppleIdentity] Requesting Apple credentials...');
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    console.log('[linkAppleIdentity] Received credential, has identityToken:', !!credential.identityToken);

    if (!credential.identityToken) {
      throw new InfraError(
        InfraErrorCode.AUTH_FAILED,
        'No identityToken received from Apple'
      );
    }

    console.log('[linkAppleIdentity] Calling Supabase linkIdentity...');
    const { error } = await supabase.auth.linkIdentity({
      provider: 'apple',
      token: credential.identityToken,
    });

    if (error) {
      console.error('[linkAppleIdentity] Supabase linkIdentity error:', error);
      throw new InfraError(
        InfraErrorCode.AUTH_FAILED,
        'Apple identity linking failed',
        error
      );
    }

    console.log('[linkAppleIdentity] Successfully linked Apple identity');
  } catch (error: any) {
    if (error.code === 'ERR_REQUEST_CANCELED') {
      // ユーザーがキャンセルした場合は正常なフローとして扱う
      return;
    }
    throw new InfraError(
      InfraErrorCode.AUTH_FAILED,
      'Apple identity linking failed',
      error
    );
  }
}

/**
 * Googleアカウントを既存ユーザーにリンク
 */
export async function linkGoogleIdentity(): Promise<void> {
  console.log('[linkGoogleIdentity] Starting Google identity linking');

  const redirectUrl = Linking.createURL('auth/callback', { scheme: 'stanza' });

  const { data, error } = await supabase.auth.linkIdentity({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true,
      queryParams: {
        prompt: 'select_account',
      },
    },
  });

  if (error) {
    throw new InfraError(
      InfraErrorCode.AUTH_FAILED,
      'Google identity linking initialization failed',
      error
    );
  }

  if (!data?.url) {
    throw new InfraError(
      InfraErrorCode.AUTH_FAILED,
      'No linking URL returned'
    );
  }

  // WebBrowserでリンクフローを開始
  const result = await WebBrowser.openAuthSessionAsync(
    data.url,
    redirectUrl
  );

  if (result.type === 'success' && result.url) {
    if (!result.url.startsWith('stanza://')) {
      throw new InfraError(
        InfraErrorCode.AUTH_FAILED,
        `Expected deep link but got: ${result.url}`
      );
    }

    console.log('[linkGoogleIdentity] Identity linking completed');
  } else if (result.type === 'cancel') {
    // ユーザーがキャンセルした場合は正常なフローとして扱う
    return;
  } else {
    throw new InfraError(
      InfraErrorCode.AUTH_FAILED,
      `Identity linking failed with type: ${result.type}`
    );
  }
}
