import { EntityId } from '../shared/EntityId';
import { SectionName, SectionNameValue } from './vo/SectionName';
import { SectionContent, SectionContentValue } from './vo/SectionContent';

// ドメインエンティティ：Section
export class Section {
  private _id: EntityId;
  private _projectId: EntityId;
  private _name: SectionNameValue;
  private _orderIndex: number;
  private _content: SectionContentValue;

  private constructor(
    id: EntityId,
    projectId: EntityId,
    name: string,
    orderIndex: number,
    content: string
  ) {
    this._id = id;
    this._projectId = projectId;
    this._name = SectionName.validate(name);
    this._orderIndex = orderIndex;
    this._content = SectionContent.validate(content);
  }

  get id(): EntityId {
    return this._id;
  }

  get projectId(): EntityId {
    return this._projectId;
  }

  get name(): SectionNameValue {
    return this._name;
  }

  get orderIndex(): number {
    return this._orderIndex;
  }

  get content(): SectionContentValue {
    return this._content;
  }

  static create(
    projectId: EntityId,
    name: string,
    orderIndex: number = 0
  ): Section {
    return new Section(
      EntityId.generate(),
      projectId,
      name,
      orderIndex,
      ''
    );
  }

  static reconstruct(
    id: EntityId,
    projectId: EntityId,
    name: string,
    orderIndex: number,
    content: string
  ): Section {
    return new Section(id, projectId, name, orderIndex, content);
  }

  updateName(name: string): void {
    this._name = SectionName.validate(name);
  }

  updateContent(content: string): void {
    this._content = SectionContent.validate(content);
  }

  reorder(newIndex: number): void {
    this._orderIndex = newIndex;
  }
}
