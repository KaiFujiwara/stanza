/**
 * タグ名のバリデーション
 */
export const TagName = {
  /**
   * タグ名を検証して返す
   * @throws {Error} 空文字または30文字超過の場合
   */
  validate(value: string): string {
    if (!value || value.trim() === '') {
      throw new Error('タグ名を入力してください');
    }

    const trimmed = value.trim();
    if (trimmed.length > 30) {
      throw new Error('タグ名は30文字以内で入力してください');
    }

    return trimmed;
  },
};