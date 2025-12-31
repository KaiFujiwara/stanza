import { MAX_PHRASE_TEXT_LENGTH } from '../../../constants/validation';
import { DomainError } from '../../shared/errors/DomainError';
import { ErrorCode } from '../../shared/errors/ErrorCode';

/**
 * バリデーション済みフレーズテキストを表すブランド型
 */
export type PhraseTextValue = string & { __phraseText: true };

/**
 * フレーズテキストのバリデーション
 */
export const PhraseText = {
  /**
   * フレーズテキストを検証して返す
   * @throws {DomainError} 空文字または最大文字数超過の場合
   */
  validate(value: string): PhraseTextValue {
    if (!value || value.trim() === '') {
      throw new DomainError(
        ErrorCode.EMPTY_VALUE,
        'フレーズを入力してください',
        { field: 'phraseText' }
      );
    }

    const trimmed = value.trim();
    if (trimmed.length > MAX_PHRASE_TEXT_LENGTH) {
      throw new DomainError(
        ErrorCode.MAX_LENGTH_EXCEEDED,
        `フレーズは${MAX_PHRASE_TEXT_LENGTH}文字以内で入力してください`,
        { field: 'phraseText', maxLength: MAX_PHRASE_TEXT_LENGTH, actualLength: trimmed.length }
      );
    }

    return trimmed as PhraseTextValue;
  },
};