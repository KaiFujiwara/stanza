import { ErrorCode } from '@stanza/core';
import { InfraErrorCode } from './InfraError';

/**
 * エラーメッセージの型定義
 * user: ユーザー向けメッセージ（UI表示用）
 * dev: 開発者向けメッセージ（ログ用、オプショナル）
 */
export type ErrorMessage = {
  user: string;
  dev?: string;
};

/**
 * ErrorCode → { user, dev? } のマッピング
 */
export const ERROR_MESSAGES: Record<ErrorCode, ErrorMessage> = {
  [ErrorCode.EMPTY_VALUE]: {
    user: '入力が必要です。内容を入力してから再度お試しください。',
    dev: 'Validation failed: empty value',
  },
  [ErrorCode.MAX_LENGTH_EXCEEDED]: {
    user: '入力内容が長すぎます。文字数を減らして再度お試しください。',
    dev: 'Validation failed: max length exceeded',
  },
  [ErrorCode.INVALID_FORMAT]: {
    user: '入力形式が正しくありません。正しい形式で入力してください。',
    dev: 'Validation failed: invalid format',
  },
  [ErrorCode.DUPLICATE_NAME]: {
    user: 'その名前は既に使用されています。別の名前で再度お試しください。',
    dev: 'Business rule violation: duplicate name',
  },
  [ErrorCode.MAX_COUNT_EXCEEDED]: {
    user: '作成上限に達しています。既存のものを削除してから再度お試しください。',
    dev: 'Business rule violation: max count exceeded',
  },
  [ErrorCode.ENTITY_NOT_FOUND]: {
    user: 'データが見つかりません。画面を更新してから再度お試しください。',
    dev: 'Entity not found in repository',
  },
};

/**
 * InfraErrorCode → { user, dev? } のマッピング
 */
export const INFRA_ERROR_MESSAGES: Record<InfraErrorCode, ErrorMessage> = {
  [InfraErrorCode.AUTH_FAILED]: {
    user: 'ログインに失敗しました。しばらく時間をおいてからお試しください。',
    dev: 'Authentication failed',
  },
  [InfraErrorCode.AUTH_CANCELLED]: {
    user: 'ログインがキャンセルされました。',
    dev: 'User cancelled authentication',
  },
  [InfraErrorCode.AUTH_SESSION_INVALID]: {
    user: '認証情報の取得に失敗しました。再度ログインしてください。',
    dev: 'Session is invalid or expired',
  },
  [InfraErrorCode.SIGN_OUT_FAILED]: {
    user: 'ログアウトに失敗しました。しばらく時間をおいてからお試しください。',
    dev: 'Sign out operation failed',
  },
};
