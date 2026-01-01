import { MAX_SECTION_CONTENT_LENGTH } from '../../../constants/limits';
import { DomainError } from '../../shared/errors/DomainError';
import { ErrorCode } from '../../shared/errors/ErrorCode';

/**
 * バリデーション済みセクションコンテンツを表すブランド型
 */
export type SectionContentValue = string & { __sectionContent: true };

/**
 * セクションコンテンツのバリデーション
 */
export const SectionContent = {
  /**
   * セクションコンテンツを検証して返す
   * @throws {DomainError} 最大文字数超過の場合
   */
  validate(value: string): SectionContentValue {
    if (value.length > MAX_SECTION_CONTENT_LENGTH) {
      throw new DomainError(
        ErrorCode.MAX_LENGTH_EXCEEDED,
        `セクションの内容が最大文字数を超えています（最大: ${MAX_SECTION_CONTENT_LENGTH}文字）`,
        { field: 'sectionContent', maxLength: MAX_SECTION_CONTENT_LENGTH, actualLength: value.length }
      );
    }

    return value as SectionContentValue;
  },
};
