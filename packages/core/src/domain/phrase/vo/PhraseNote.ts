import { MAX_PHRASE_NOTE_LENGTH } from '../../../constants/validation';
import { DomainError } from '../../shared/errors/DomainError';
import { ErrorCode } from '../../shared/errors/ErrorCode';

/**
 * バリデーション済みフレーズメモを表すブランド型
 */
export type PhraseNoteValue = string & { __phraseNote: true };

/**
 * フレーズメモのバリデーション
 */
export const PhraseNote = {
  /**
   * フレーズメモを検証して返す
   * @returns 正規化されたメモ、または undefined
   * @throws {DomainError} 最大文字数超過の場合
   */
  validate(value?: string | null): PhraseNoteValue | undefined {
    if (!value || value.trim() === '') {
      return undefined;
    }

    const trimmed = value.trim();
    if (trimmed.length > MAX_PHRASE_NOTE_LENGTH) {
      throw new DomainError(
        ErrorCode.MAX_LENGTH_EXCEEDED,
        `メモは${MAX_PHRASE_NOTE_LENGTH}文字以内で入力してください`,
        { field: 'phraseNote', maxLength: MAX_PHRASE_NOTE_LENGTH, actualLength: trimmed.length }
      );
    }

    return trimmed as PhraseNoteValue;
  },
};
