/**
 * エンティティ作成数の制限値
 * ビジネスルールとして定義される上限値
 */

/**
 * フレーズの最大作成数
 * パフォーマンスとユーザビリティを考慮した制限値
 */
export const MAX_PHRASES_PER_USER = 200;

/**
 * タグの最大作成数
 * タグは整理・分類が目的なので、多すぎると管理が困難になる
 */
export const MAX_TAGS_PER_USER = 20;

/**
 * フォルダの最大作成数
 * プロジェクト整理のためのフォルダ数制限
 */
export const MAX_FOLDERS_PER_USER = 10;
