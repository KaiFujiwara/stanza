import { EntityId } from '../shared/EntityId';
import { TemplateSectionName } from './vo/TemplateSectionName';

// ドメインエンティティ：GenreTemplateSection
export class GenreTemplateSection {
  private _id: EntityId;
  private _genreId: EntityId;
  private _name: string;
  private _orderIndex: number;

  private constructor(
    id: EntityId,
    genreId: EntityId,
    name: string,
    orderIndex: number
  ) {
    this._id = id;
    this._genreId = genreId;
    this._name = TemplateSectionName.validate(name);
    this._orderIndex = orderIndex;
  }

  get id(): EntityId {
    return this._id;
  }

  get genreId(): EntityId {
    return this._genreId;
  }

  get name(): string {
    return this._name;
  }

  get orderIndex(): number {
    return this._orderIndex;
  }

  static create(
    genreId: EntityId,
    name: string,
    orderIndex: number = 0
  ): GenreTemplateSection {
    return new GenreTemplateSection(
      EntityId.generate(),
      genreId,
      name,
      orderIndex
    );
  }

  static reconstruct(
    id: EntityId,
    genreId: EntityId,
    name: string,
    orderIndex: number
  ): GenreTemplateSection {
    return new GenreTemplateSection(
      id,
      genreId,
      name,
      orderIndex
    );
  }

  updateName(name: string): void {
    const validatedName = TemplateSectionName.validate(name);
    this._name = validatedName;
  }

  reorder(newIndex: number): void {
    this._orderIndex = newIndex;
  }
}
