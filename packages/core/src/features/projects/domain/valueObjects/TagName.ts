export class TagName {
  private constructor(private readonly _value: string) {}

  static create(value: string): TagName {
    if (!value || value.trim() === '') {
      throw new Error('タグ名を入力してください');
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length > 30) {
      throw new Error('タグ名は30文字以内で入力してください');
    }

    return new TagName(trimmedValue);
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }
}