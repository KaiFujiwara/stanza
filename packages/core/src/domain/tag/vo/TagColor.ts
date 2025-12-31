import { TAG_COLOR_PATTERN } from '../../../constants/validation';

/**
 * バリデーション済みタグカラーを表すブランド型
 */
export type TagColorValue = string & { __tagColor: true };

/**
 * タグカラーのバリデーション
 */
export const TagColor = {
  /**
   * カラーコードを検証して返す
   * @param value カラーコード（#RGB または #RRGGBB 形式）
   * @returns 正規化されたカラーコード（大文字）、または undefined
   * @throws {Error} 不正な形式の場合
   */
  validate(value?: string): TagColorValue | undefined {
    if (!value || value.trim() === '') {
      return undefined;
    }

    const trimmed = value.trim();

    // #RRGGBB または #RGB 形式をチェック
    if (!TAG_COLOR_PATTERN.test(trimmed)) {
      throw new Error('正しいカラーコード形式で入力してください（例: #FF0000）');
    }

    return trimmed.toUpperCase() as TagColorValue;
  },
};
