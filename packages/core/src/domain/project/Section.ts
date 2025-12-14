import { SectionName } from './vo/SectionName';
import { EntityId } from '../shared/EntityId';

// ドメインエンティティ：Section
export class Section {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public name: string,
    public orderIndex: number,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    SectionName.validate(name);
  }

  static create(
    projectId: string,
    name: string,
    orderIndex: number = 0
  ): Section {
    const validatedName = SectionName.validate(name);
    const now = new Date();
    return new Section(
      EntityId.generate(),
      projectId,
      validatedName,
      orderIndex,
      now,
      now
    );
  }

  updateName(name: string): void {
    const validatedName = SectionName.validate(name);
    this.name = validatedName;
    this.updatedAt = new Date();
  }

  reorder(newIndex: number): void {
    this.orderIndex = newIndex;
    this.updatedAt = new Date();
  }
}
