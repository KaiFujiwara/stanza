/**
 * ジャンル名のバリデーション
 */
export const GenreName = {
  /**
   * ジャンル名を検証して返す
   * @throws {Error} 空文字または50文字超過の場合
   */
  validate(value: string): string {
    if (!value || value.trim() === '') {
      throw new Error('ジャンル名を入力してください');
    }

    const trimmed = value.trim();
    if (trimmed.length > 50) {
      throw new Error('ジャンル名は50文字以内で入力してください');
    }

    return trimmed;
  },
};