/**
 * ジャンル説明のバリデーション
 */
export const GenreDescription = {
  /**
   * ジャンル説明を検証して返す
   * @returns 正規化された説明文、または undefined
   * @throws {Error} 500文字超過の場合
   */
  validate(value?: string | null): string | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    const trimmed = value.trim();
    if (trimmed === '') {
      return undefined;
    }

    if (trimmed.length > 500) {
      throw new Error('ジャンルの説明は500文字以内で入力してください');
    }

    return trimmed;
  },
};
