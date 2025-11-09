export class SectionName {
  private constructor(private readonly _value: string) {}

  static create(value: string): SectionName {
    if (!value || value.trim() === '') {
      throw new Error('セクション名を入力してください');
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length > 50) {
      throw new Error('セクション名は50文字以内で入力してください');
    }

    return new SectionName(trimmedValue);
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }
}