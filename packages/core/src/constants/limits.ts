/**
 * エンティティ作成数の制限値
 * ビジネスルールとして定義される上限値
 */

/**
 * フレーズの最大作成数
 * パフォーマンスとユーザビリティを考慮した制限値
 */
export const MAX_PHRASES_PER_USER = 100;

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

/**
 * ジャンルの最大作成数
 * テンプレートとして使うジャンルの数制限
 */
export const MAX_GENRES_PER_USER = 10;

/**
 * ジャンル1つあたりのセクション最大数
 * テンプレートセクションの数制限
 */
export const MAX_SECTIONS_PER_GENRE = 20;

/**
 * プロジェクトの最大作成数
 * 大量のプロジェクト管理を考慮した制限値
 */
export const MAX_PROJECTS_PER_USER = 500;

/**
 * プロジェクト1つあたりのセクション最大数
 * プロジェクト内のセクション数制限
 */
export const MAX_SECTIONS_PER_PROJECT = 20;

/**
 * セクションコンテンツの最大文字数
 * 歌詞セクションの内容（改行を含む）の文字数制限
 */
export const MAX_SECTION_CONTENT_LENGTH = 3000;
