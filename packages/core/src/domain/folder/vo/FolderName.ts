import { MAX_FOLDER_NAME_LENGTH } from '../../../constants/validation';
import { DomainError } from '../../shared/errors/DomainError';
import { ErrorCode } from '../../shared/errors/ErrorCode';

/**
 * バリデーション済みフォルダ名を表すブランド型
 */
export type FolderNameValue = string & { __folderName: true };

/**
 * フォルダ名のバリデーション
 */
export const FolderName = {
  /**
   * フォルダ名を検証して返す
   * @throws {DomainError} 空文字または最大文字数超過の場合
   */
  validate(value: string): FolderNameValue {
    if (!value || value.trim() === '') {
      throw new DomainError(
        ErrorCode.EMPTY_VALUE,
        'フォルダ名を入力してください',
        { field: 'folderName' }
      );
    }

    const trimmed = value.trim();
    if (trimmed.length > MAX_FOLDER_NAME_LENGTH) {
      throw new DomainError(
        ErrorCode.MAX_LENGTH_EXCEEDED,
        `フォルダ名は${MAX_FOLDER_NAME_LENGTH}文字以内で入力してください`,
        { field: 'folderName', maxLength: MAX_FOLDER_NAME_LENGTH, actualLength: trimmed.length }
      );
    }

    return trimmed as FolderNameValue;
  },
};