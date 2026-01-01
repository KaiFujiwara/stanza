import { EntityId } from '../shared/EntityId';
import { DomainError } from '../shared/errors/DomainError';
import { ErrorCode } from '../shared/errors/ErrorCode';
import { MAX_SECTIONS_PER_GENRE } from '../../constants/limits';
import { GenreDescription, GenreDescriptionValue } from './vo/GenreDescription';
import { GenreName, GenreNameValue } from './vo/GenreName';
import { TemplateSectionName, TemplateSectionNameValue } from './vo/TemplateSectionName';

// ドメインエンティティ：Genre（ユーザーのジャンルテンプレ）
export class Genre {

  private _id: EntityId;
  private _name: GenreNameValue;
  private _description?: GenreDescriptionValue;
  private _sectionNames: TemplateSectionNameValue[];

  private constructor(
    id: EntityId,
    name: string,
    description: string | undefined,
    sectionNames: string[]
  ) {
    // セクション数の上限チェック
    if (sectionNames.length > MAX_SECTIONS_PER_GENRE) {
      throw new DomainError(
        ErrorCode.MAX_COUNT_EXCEEDED,
        `テンプレートセクション数の上限を超えています（最大: ${MAX_SECTIONS_PER_GENRE}）`,
        { maxCount: MAX_SECTIONS_PER_GENRE, currentCount: sectionNames.length }
      );
    }

    this._id = id;
    this._name = GenreName.validate(name);
    this._description = GenreDescription.validate(description);
    this._sectionNames = sectionNames.map(name => TemplateSectionName.validate(name));
  }

  get id(): EntityId {
    return this._id;
  }

  get name(): GenreNameValue {
    return this._name;
  }

  get description(): GenreDescriptionValue | undefined {
    return this._description;
  }

  get sectionNames(): readonly TemplateSectionNameValue[] {
    return [...this._sectionNames];
  }

  static create(
    name: string,
    options: { description?: string; sectionNames?: string[] } = {}
  ): Genre {
    return new Genre(
      EntityId.generate(),
      name,
      options.description,
      options.sectionNames || []
    );
  }

  static reconstruct(
    id: EntityId,
    name: string,
    description: string | undefined,
    sectionNames: string[]
  ): Genre {
    return new Genre(
      id,
      name,
      description,
      sectionNames
    );
  }

  updateName(name: string): void {
    const validatedName = GenreName.validate(name);
    this._name = validatedName;
  }

  updateDescription(description?: string | null): void {
    const validatedDescription = GenreDescription.validate(description);
    this._description = validatedDescription;
  }

  setSectionNames(sectionNames: string[]): void {
    // 上限チェック
    if (sectionNames.length > MAX_SECTIONS_PER_GENRE) {
      throw new DomainError(
        ErrorCode.MAX_COUNT_EXCEEDED,
        `テンプレートセクション数の上限を超えています（最大: ${MAX_SECTIONS_PER_GENRE}）`,
        { maxCount: MAX_SECTIONS_PER_GENRE, currentCount: sectionNames.length }
      );
    }
    // バリデーション
    this._sectionNames = sectionNames.map(name => TemplateSectionName.validate(name));
  }
}
