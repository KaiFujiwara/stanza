export class PhraseText {
  private constructor(private readonly _value: string) {}

  static create(value: string): PhraseText {
    if (!value || value.trim() === '') {
      throw new Error('フレーズを入力してください');
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length > 500) {
      throw new Error('フレーズは500文字以内で入力してください');
    }

    return new PhraseText(trimmedValue);
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }
}