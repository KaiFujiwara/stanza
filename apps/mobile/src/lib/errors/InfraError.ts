/**
 * インフラ層エラーコード
 * 認証、ネットワーク、データベースなどのインフラ層で発生するエラー
 */
export enum InfraErrorCode {
  /** 認証失敗 */
  AUTH_FAILED = 'AUTH_FAILED',
  /** 認証キャンセル */
  AUTH_CANCELLED = 'AUTH_CANCELLED',
  /** セッション無効 */
  AUTH_SESSION_INVALID = 'AUTH_SESSION_INVALID',
  /** ログアウト失敗 */
  SIGN_OUT_FAILED = 'SIGN_OUT_FAILED',
}

/**
 * インフラ層エラー
 * Supabase、ネットワーク、ストレージなどインフラ層で発生するエラーを表現
 */
export class InfraError extends Error {
  constructor(
    public readonly code: InfraErrorCode,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'InfraError';
  }

  /**
   * エラーがInfraErrorかどうかを判定
   */
  static isInfraError(error: unknown): error is InfraError {
    return error instanceof InfraError;
  }
}
