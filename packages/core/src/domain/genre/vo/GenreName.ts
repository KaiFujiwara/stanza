import { MAX_GENRE_NAME_LENGTH } from '../../../constants/validation';
import { DomainError } from '../../shared/errors/DomainError';
import { ErrorCode } from '../../shared/errors/ErrorCode';

/**
 * バリデーション済みジャンル名を表すブランド型
 */
export type GenreNameValue = string & { __genreName: true };

/**
 * ジャンル名のバリデーション
 */
export const GenreName = {
  /**
   * ジャンル名を検証して返す
   * @throws {DomainError} 空文字または最大文字数超過の場合
   */
  validate(value: string): GenreNameValue {
    if (!value || value.trim() === '') {
      throw new DomainError(
        ErrorCode.EMPTY_VALUE,
        'ジャンル名を入力してください',
        { field: 'genreName' }
      );
    }

    const trimmed = value.trim();
    if (trimmed.length > MAX_GENRE_NAME_LENGTH) {
      throw new DomainError(
        ErrorCode.MAX_LENGTH_EXCEEDED,
        `ジャンル名は${MAX_GENRE_NAME_LENGTH}文字以内で入力してください`,
        { field: 'genreName', maxLength: MAX_GENRE_NAME_LENGTH, actualLength: trimmed.length }
      );
    }

    return trimmed as GenreNameValue;
  },
};