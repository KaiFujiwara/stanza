import { DomainError } from '@stanza/core';
import { ERROR_MESSAGES } from './messages';

/**
 * エラーハンドリング結果
 */
export type ErrorHandlingResult = {
  userMessage: string; // UI表示用のユーザー向けメッセージ
  devMessage?: string; // ログ用の開発者向けメッセージ
  stack?: string; // スタックトレース（開発環境用）
  details?: Record<string, unknown>; // 追加の詳細情報
};

/**
 * エラーをユーザー向けメッセージに変換
 *
 * - DomainError の場合: ERROR_MESSAGES からマップを引いて変換
 * - 未定義コード or 非ドメインエラー: 汎用メッセージにフォールバック
 *
 * @param error キャッチしたエラー
 * @returns ErrorHandlingResult
 */
export function toUserMessage(error: unknown): ErrorHandlingResult {
  // DomainError の場合
  if (DomainError.isDomainError(error)) {
    const errorMessage = ERROR_MESSAGES[error.code];

    if (errorMessage) {
      // マップに定義されている場合
      return {
        userMessage: errorMessage.user,
        devMessage: errorMessage.dev || error.message,
        stack: error.stack,
        details: error.details,
      };
    } else {
      // マップに未定義のコード（念のためのフォールバック）
      return {
        userMessage: 'エラーが発生しました',
        devMessage: `Unknown ErrorCode: ${error.code} - ${error.message}`,
        stack: error.stack,
        details: error.details,
      };
    }
  }

  // Error オブジェクトの場合（非ドメインエラー = インフラエラー）
  // リポジトリ層のエラーメッセージは開発者向けログとして扱い、
  // ユーザーには汎用メッセージを表示（セキュリティ・一貫性のため）
  if (error instanceof Error) {
    return {
      userMessage: '通信エラーが発生しました。しばらくしてから再度お試しください。',
      devMessage: error.message,
      stack: error.stack,
      details: error.cause ? { cause: error.cause } : undefined,
    };
  }

  // その他の場合
  return {
    userMessage: 'エラーが発生しました',
    devMessage: String(error),
  };
}
