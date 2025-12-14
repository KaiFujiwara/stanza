/**
 * プロジェクトタイトルのバリデーション
 */
export const ProjectTitle = {
  /**
   * プロジェクトタイトルを検証して返す
   * @throws {Error} 空文字または200文字超過の場合
   */
  validate(value: string): string {
    if (!value || value.trim() === '') {
      throw new Error('プロジェクトタイトルを入力してください');
    }

    const trimmed = value.trim();
    if (trimmed.length > 200) {
      throw new Error('プロジェクトタイトルは200文字以内で入力してください');
    }

    return trimmed;
  },
};