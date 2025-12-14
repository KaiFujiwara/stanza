/**
 * フレーズテキストのバリデーション
 */
export const PhraseText = {
  /**
   * フレーズテキストを検証して返す
   * @throws {Error} 空文字または500文字超過の場合
   */
  validate(value: string): string {
    if (!value || value.trim() === '') {
      throw new Error('フレーズを入力してください');
    }

    const trimmed = value.trim();
    if (trimmed.length > 500) {
      throw new Error('フレーズは500文字以内で入力してください');
    }

    return trimmed;
  },
};