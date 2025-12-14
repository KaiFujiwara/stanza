import { FolderName } from './vo/FolderName';
import { EntityId } from '../shared/EntityId';

export class Folder {
  constructor(
    public readonly id: string,
    public name: string,
    public orderIndex: number,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    FolderName.validate(name);
  }

  static create(
    name: string,
    orderIndex: number = 0
  ): Folder {
    const validatedName = FolderName.validate(name);
    const now = new Date();
    return new Folder(
      EntityId.generate(),
      validatedName,
      orderIndex,
      now,
      now
    );
  }

  updateName(name: string): void {
    const validatedName = FolderName.validate(name);
    this.name = validatedName;
    this.updatedAt = new Date();
  }

  reorder(newIndex: number): void {
    this.orderIndex = newIndex;
    this.updatedAt = new Date();
  }
}
