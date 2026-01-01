import { TAG_COLOR_PATTERN } from '../../../constants/validation';
import { DomainError } from '../../shared/errors/DomainError';
import { ErrorCode } from '../../shared/errors/ErrorCode';

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
   * @param value カラーコード（#RRGGBB 形式）
   * @returns 正規化されたカラーコード（大文字）、または undefined
   * @throws {DomainError} 不正な形式の場合
   */
  validate(value?: string): TagColorValue | undefined {
    if (!value || value.trim() === '') {
      return undefined;
    }

    const trimmed = value.trim();

    // #RRGGBB 形式をチェック（6桁のみ）
    if (!TAG_COLOR_PATTERN.test(trimmed)) {
      throw new DomainError(
        ErrorCode.INVALID_FORMAT,
        '正しいカラーコード形式で入力してください（例: #FF0000）',
        { field: 'tagColor', value: trimmed }
      );
    }

    return trimmed.toUpperCase() as TagColorValue;
  },
};
