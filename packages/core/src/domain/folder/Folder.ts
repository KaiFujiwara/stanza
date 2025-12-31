import { FolderName, FolderNameValue } from './vo/FolderName';
import { EntityId } from '../shared/EntityId';

export class Folder {
  private _id: EntityId;
  private _name: FolderNameValue;
  private _orderIndex: number;

  private constructor(
    id: EntityId,
    name: string,
    orderIndex: number
  ) {
    this._id = id;
    this._name = FolderName.validate(name);
    this._orderIndex = orderIndex;
  }

  get id(): EntityId {
    return this._id;
  }

  get name(): FolderNameValue {
    return this._name;
  }

  get orderIndex(): number {
    return this._orderIndex;
  }

  static create(name: string, orderIndex: number = 0): Folder {
    return new Folder(
      EntityId.generate(),
      name,
      orderIndex
    );
  }

  static reconstruct(
    id: EntityId,
    name: string,
    orderIndex: number
  ): Folder {
    return new Folder(id, name, orderIndex);
  }

  updateName(name: string): void {
    const validatedName = FolderName.validate(name);
    this._name = validatedName;
  }
}
