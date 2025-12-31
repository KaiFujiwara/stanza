import { MAX_PROJECT_TITLE_LENGTH } from '../../../constants/validation';
import { DomainError } from '../../shared/errors/DomainError';
import { ErrorCode } from '../../shared/errors/ErrorCode';

/**
 * バリデーション済みプロジェクトタイトルを表すブランド型
 */
export type ProjectTitleValue = string & { __projectTitle: true };

/**
 * プロジェクトタイトルのバリデーション
 */
export const ProjectTitle = {
  /**
   * プロジェクトタイトルを検証して返す
   * @throws {DomainError} 空文字または最大文字数超過の場合
   */
  validate(value: string): ProjectTitleValue {
    if (!value || value.trim() === '') {
      throw new DomainError(
        ErrorCode.EMPTY_VALUE,
        'プロジェクトタイトルを入力してください',
        { field: 'projectTitle' }
      );
    }

    const trimmed = value.trim();
    if (trimmed.length > MAX_PROJECT_TITLE_LENGTH) {
      throw new DomainError(
        ErrorCode.MAX_LENGTH_EXCEEDED,
        `プロジェクトタイトルは${MAX_PROJECT_TITLE_LENGTH}文字以内で入力してください`,
        { field: 'projectTitle', maxLength: MAX_PROJECT_TITLE_LENGTH, actualLength: trimmed.length }
      );
    }

    return trimmed as ProjectTitleValue;
  },
};