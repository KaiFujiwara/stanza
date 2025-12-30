import { EntityId } from '../shared/EntityId';
import { GenreDescription } from './vo/GenreDescription';
import { GenreName } from './vo/GenreName';
import { GenreTemplateSection } from './GenreTemplateSection';

// ドメインエンティティ：Genre（ユーザーのジャンルテンプレ）
export class Genre {
  private static readonly MAX_TEMPLATE_SECTIONS = 20;

  private _id: EntityId;
  private _name: string;
  private _description?: string;
  private _templateSections: GenreTemplateSection[];

  private constructor(
    id: EntityId,
    name: string,
    description: string | undefined,
    templateSections: GenreTemplateSection[]
  ) {
    this._id = id;
    this._name = GenreName.validate(name);
    this._description = GenreDescription.validate(description);
    this._templateSections = templateSections;
  }

  get id(): EntityId {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | undefined {
    return this._description;
  }

  get templateSections(): readonly GenreTemplateSection[] {
    return [...this._templateSections];
  }

  static create(
    name: string,
    options: { description?: string } = {}
  ): Genre {
    return new Genre(
      EntityId.generate(),
      name,
      options.description,
      []
    );
  }

  static reconstruct(
    id: EntityId,
    name: string,
    description: string | undefined,
    templateSections: GenreTemplateSection[]
  ): Genre {
    return new Genre(
      id,
      name,
      description,
      templateSections
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

  // セクション追加
  addTemplateSection(name: string): GenreTemplateSection {
    if (this._templateSections.length >= Genre.MAX_TEMPLATE_SECTIONS) {
      throw new Error(
        `テンプレートセクション数の上限を超えています（最大: ${Genre.MAX_TEMPLATE_SECTIONS}）`
      );
    }

    const section = GenreTemplateSection.create(
      this._id,
      name,
      this._templateSections.length
    );

    this._templateSections.push(section);
    return section;
  }

  // セクション名変更
  updateTemplateSectionName(sectionId: string, newName: string): void {
    const section = this._templateSections.find(s => s.id === sectionId);
    if (!section) {
      throw new Error(`テンプレートセクションが見つかりません: ${sectionId}`);
    }
    section.updateName(newName);
  }

  // セクション削除
  removeTemplateSection(sectionId: string): void {
    const index = this._templateSections.findIndex(s => s.id === sectionId);
    if (index === -1) {
      throw new Error(`テンプレートセクションが見つかりません: ${sectionId}`);
    }

    this._templateSections.splice(index, 1);

    // orderIndex を振り直し
    this._templateSections.forEach((section, idx) => {
      section.reorder(idx);
    });
  }

  // セクション並び替え
  reorderTemplateSections(orderedIds: string[]): void {
    if (orderedIds.length !== this._templateSections.length) {
      throw new Error('並び替え対象のセクション数が一致しません');
    }

    const reordered = orderedIds.map(id => {
      const section = this._templateSections.find(s => s.id === id);
      if (!section) {
        throw new Error(`テンプレートセクションが見つかりません: ${id}`);
      }
      return section;
    });

    reordered.forEach((section, index) => {
      section.reorder(index);
    });

    this._templateSections = reordered;
  }
}
