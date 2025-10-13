export class FolderName {
  private constructor(private readonly _value: string) {}

  static create(value: string): FolderName {
    if (!value || value.trim() === '') {
      throw new Error('フォルダ名を入力してください');
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length > 100) {
      throw new Error('フォルダ名は100文字以内で入力してください');
    }

    return new FolderName(trimmedValue);
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }
}