import { MAX_GENRE_DESCRIPTION_LENGTH } from '../../../constants/validation';
import { DomainError } from '../../shared/errors/DomainError';
import { ErrorCode } from '../../shared/errors/ErrorCode';

/**
 * バリデーション済みジャンル説明を表すブランド型
 */
export type GenreDescriptionValue = string & { __genreDescription: true };

/**
 * ジャンル説明のバリデーション
 */
export const GenreDescription = {
  /**
   * ジャンル説明を検証して返す
   * @returns 正規化された説明文、または undefined
   * @throws {DomainError} 最大文字数超過の場合
   */
  validate(value?: string | null): GenreDescriptionValue | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    const trimmed = value.trim();
    if (trimmed === '') {
      return undefined;
    }

    if (trimmed.length > MAX_GENRE_DESCRIPTION_LENGTH) {
      throw new DomainError(
        ErrorCode.MAX_LENGTH_EXCEEDED,
        `ジャンルの説明は${MAX_GENRE_DESCRIPTION_LENGTH}文字以内で入力してください`,
        { field: 'genreDescription', maxLength: MAX_GENRE_DESCRIPTION_LENGTH, actualLength: trimmed.length }
      );
    }

    return trimmed as GenreDescriptionValue;
  },
};
