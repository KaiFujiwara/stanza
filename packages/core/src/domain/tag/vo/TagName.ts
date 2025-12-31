import { MAX_TAG_NAME_LENGTH } from '../../../constants/validation';
import { DomainError } from '../../shared/errors/DomainError';
import { ErrorCode } from '../../shared/errors/ErrorCode';

/**
 * バリデーション済みタグ名を表すブランド型
 * TagName.validate()を通過した文字列のみがこの型を持つ
 */
export type TagNameValue = string & { __tagName: true };

/**
 * タグ名のバリデーション
 */
export const TagName = {
  /**
   * タグ名を検証して返す
   * @throws {DomainError} 空文字または最大文字数超過の場合
   */
  validate(value: string): TagNameValue {
    if (!value || value.trim() === '') {
      throw new DomainError(
        ErrorCode.EMPTY_VALUE,
        'タグ名を入力してください',
        { field: 'tagName' }
      );
    }

    const trimmed = value.trim();
    if (trimmed.length > MAX_TAG_NAME_LENGTH) {
      throw new DomainError(
        ErrorCode.MAX_LENGTH_EXCEEDED,
        `タグ名は${MAX_TAG_NAME_LENGTH}文字以内で入力してください`,
        { field: 'tagName', maxLength: MAX_TAG_NAME_LENGTH, actualLength: trimmed.length }
      );
    }

    return trimmed as TagNameValue;
  },
};