import { EntityId } from '../shared/EntityId';
import { TagColor, TagColorValue } from './vo/TagColor';
import { TagName, TagNameValue } from './vo/TagName';

export class Tag {
  private _id: EntityId;
  private _name: TagNameValue;
  private _color?: TagColorValue;

  private constructor(
    id: EntityId,
    name: string,
    color: string | undefined
  ) {
    this._id = id;
    this._name = TagName.validate(name);
    this._color = TagColor.validate(color);
  }

  get id(): EntityId {
    return this._id;
  }

  get name(): TagNameValue {
    return this._name;
  }

  get color(): TagColorValue | undefined {
    return this._color;
  }

  static create(
    name: string,
    color?: string
  ): Tag {
    return new Tag(
      EntityId.generate(),
      name,
      color
    );
  }

  static reconstruct(
    id: EntityId,
    name: string,
    color: string | undefined
  ): Tag {
    return new Tag(id, name, color);
  }

  updateName(name: string): void {
    const validatedName = TagName.validate(name);
    this._name = validatedName;
  }

  updateColor(color?: string): void {
    const validatedColor = TagColor.validate(color);
    this._color = validatedColor;
  }
}
