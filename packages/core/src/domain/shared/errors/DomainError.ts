import { ErrorCode } from './ErrorCode';

/**
 * ドメインエラー
 * ドメインルール違反時に投げられるエラー
 */
export class DomainError extends Error {
  readonly code: ErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(code: ErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.details = details;

    // プロトタイプチェーンを正しく設定（TypeScript の extends Error 対策）
    Object.setPrototypeOf(this, DomainError.prototype);
  }

  /**
   * 型ガード: unknown な error が DomainError かどうかを判定
   */
  static isDomainError(error: unknown): error is DomainError {
    return error instanceof DomainError;
  }
}
