import { MAX_SECTION_NAME_LENGTH } from '../../../constants/validation';
import { DomainError } from '../../shared/errors/DomainError';
import { ErrorCode } from '../../shared/errors/ErrorCode';

/**
 * バリデーション済みセクション名を表すブランド型
 */
export type SectionNameValue = string & { __sectionName: true };

/**
 * セクション名のバリデーション
 */
export const SectionName = {
  /**
   * セクション名を検証して返す
   * @throws {DomainError} 空文字または最大文字数超過の場合
   */
  validate(value: string): SectionNameValue {
    if (!value || value.trim() === '') {
      throw new DomainError(
        ErrorCode.EMPTY_VALUE,
        'セクション名を入力してください',
        { field: 'sectionName' }
      );
    }

    const trimmed = value.trim();
    if (trimmed.length > MAX_SECTION_NAME_LENGTH) {
      throw new DomainError(
        ErrorCode.MAX_LENGTH_EXCEEDED,
        `セクション名は${MAX_SECTION_NAME_LENGTH}文字以内で入力してください`,
        { field: 'sectionName', maxLength: MAX_SECTION_NAME_LENGTH, actualLength: trimmed.length }
      );
    }

    return trimmed as SectionNameValue;
  },
};