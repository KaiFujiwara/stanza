import { MAX_TEMPLATE_SECTION_NAME_LENGTH } from '../../../constants/validation';
import { DomainError } from '../../shared/errors/DomainError';
import { ErrorCode } from '../../shared/errors/ErrorCode';

/**
 * バリデーション済みテンプレートセクション名を表すブランド型
 */
export type TemplateSectionNameValue = string & { __templateSectionName: true };

/**
 * ジャンルテンプレートのセクション名のバリデーション
 */
export const TemplateSectionName = {
  /**
   * テンプレートセクション名を検証して返す
   * @throws {DomainError} 空文字または最大文字数超過の場合
   */
  validate(name: string | undefined | null): TemplateSectionNameValue {
    if (!name || name.trim() === '') {
      throw new DomainError(
        ErrorCode.EMPTY_VALUE,
        'テンプレートセクション名は必須です',
        { field: 'templateSectionName' }
      );
    }

    const trimmed = name.trim();
    if (trimmed.length > MAX_TEMPLATE_SECTION_NAME_LENGTH) {
      throw new DomainError(
        ErrorCode.MAX_LENGTH_EXCEEDED,
        `テンプレートセクション名は${MAX_TEMPLATE_SECTION_NAME_LENGTH}文字以内で入力してください`,
        { field: 'templateSectionName', maxLength: MAX_TEMPLATE_SECTION_NAME_LENGTH, actualLength: trimmed.length }
      );
    }

    return trimmed as TemplateSectionNameValue;
  },
};
