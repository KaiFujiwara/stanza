/**
 * フォルダ名のバリデーション
 */
export const FolderName = {
  /**
   * フォルダ名を検証して返す
   * @throws {Error} 空文字または100文字超過の場合
   */
  validate(value: string): string {
    if (!value || value.trim() === '') {
      throw new Error('フォルダ名を入力してください');
    }

    const trimmed = value.trim();
    if (trimmed.length > 100) {
      throw new Error('フォルダ名は100文字以内で入力してください');
    }

    return trimmed;
  },
};