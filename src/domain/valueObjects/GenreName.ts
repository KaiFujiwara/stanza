export class GenreName {
  private constructor(private readonly _value: string) {}

  static create(value: string): GenreName {
    if (!value || value.trim() === '') {
      throw new Error('ジャンル名を入力してください');
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length > 50) {
      throw new Error('ジャンル名は50文字以内で入力してください');
    }

    return new GenreName(trimmedValue);
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }
}