/**
 * ドメインエラーコード
 * 現時点で必要なエラーのみを定義（YAGNI原則）
 */
export const ErrorCode = {
  // バリデーションエラー
  EMPTY_VALUE: 'EMPTY_VALUE',
  MAX_LENGTH_EXCEEDED: 'MAX_LENGTH_EXCEEDED',

  // ビジネスルール違反
  DUPLICATE_NAME: 'DUPLICATE_NAME',
  MAX_COUNT_EXCEEDED: 'MAX_COUNT_EXCEEDED',

  // エンティティ操作エラー
  ENTITY_NOT_FOUND: 'ENTITY_NOT_FOUND',
} as const;

export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode];
