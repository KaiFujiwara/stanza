export class ProjectTitle {
  private constructor(private readonly _value: string) {}

  static create(value: string): ProjectTitle {
    if (!value || value.trim() === '') {
      throw new Error('プロジェクトタイトルを入力してください');
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length > 200) {
      throw new Error('プロジェクトタイトルは200文字以内で入力してください');
    }

    return new ProjectTitle(trimmedValue);
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }
}