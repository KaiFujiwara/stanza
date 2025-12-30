export const PhraseNote = {
  validate(value?: string | null): string | undefined {
    if (!value || value.trim() === '') {
      return undefined;
    }

    const trimmed = value.trim();
    if (trimmed.length > 500) {
      throw new Error('メモは500文字以内で入力してください');
    }

    return trimmed;
  },
};
