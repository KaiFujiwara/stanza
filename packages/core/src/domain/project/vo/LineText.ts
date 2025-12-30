/**
 * 歌詞行テキストのバリデーション
 */
export const LineText = {
  /**
   * 歌詞行テキストを検証して返す
   * @throws {Error} 1000文字超過の場合
   */
  validate(value: string): string {
    if (value.length > 1000) {
      throw new Error('歌詞行は1000文字以内で入力してください');
    }

    return value;
  },
};
