/**
 * ジャンルテンプレートのセクション名のバリデーション
 */
export const TemplateSectionName = {
  /**
   * テンプレートセクション名を検証して返す
   * @throws {Error} 空文字または50文字超過の場合
   */
  validate(name: string | undefined | null): string {
    if (!name || name.trim() === '') {
      throw new Error('テンプレートセクション名は必須です');
    }

    const trimmed = name.trim();
    if (trimmed.length > 50) {
      throw new Error('テンプレートセクション名は50文字以内で入力してください');
    }

    return trimmed;
  },
};
