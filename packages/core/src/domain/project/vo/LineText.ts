import { MAX_LINE_TEXT_LENGTH } from '../../../constants/validation';
import { DomainError } from '../../shared/errors/DomainError';
import { ErrorCode } from '../../shared/errors/ErrorCode';

/**
 * バリデーション済み歌詞行テキストを表すブランド型
 */
export type LineTextValue = string & { __lineText: true };

/**
 * 歌詞行テキストのバリデーション
 */
export const LineText = {
  /**
   * 歌詞行テキストを検証して返す
   * @throws {DomainError} 最大文字数超過の場合
   */
  validate(value: string): LineTextValue {
    if (value.length > MAX_LINE_TEXT_LENGTH) {
      throw new DomainError(
        ErrorCode.MAX_LENGTH_EXCEEDED,
        `歌詞行は${MAX_LINE_TEXT_LENGTH}文字以内で入力してください`,
        { field: 'lineText', maxLength: MAX_LINE_TEXT_LENGTH, actualLength: value.length }
      );
    }

    return value as LineTextValue;
  },
};
